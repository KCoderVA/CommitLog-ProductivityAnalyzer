/**
 * File Handler - Handles file operations and local file system interactions
 * This module provides functionality for reading local files and handling file selection.
 */

class FileHandler {
    constructor() {
        this.supportedFormats = ['.git', '.json', '.csv', '.txt'];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
    }

    /**
     * Opens a file picker for selecting local Git repositories
     * @returns {Promise<File|null>} Selected file or null
     */
    async selectGitRepository() {
        try {
            // Check if File System Access API is available
            if ('showDirectoryPicker' in window) {
                return await this.selectDirectoryModern();
            } else {
                // Fallback to input element
                return await this.selectDirectoryFallback();
            }
        } catch (error) {
            console.error('Error selecting repository:', error);
            throw new Error(`Failed to select repository: ${error.message}`);
        }
    }

    /**
     * Modern directory selection using File System Access API
     * @private
     * @returns {Promise<FileSystemDirectoryHandle>} Directory handle
     */
    async selectDirectoryModern() {
        try {
            const dirHandle = await window.showDirectoryPicker({
                mode: 'read',
                startIn: 'documents'
            });

            // Check if it's a Git repository
            const isGitRepo = await this.verifyGitRepository(dirHandle);
            if (!isGitRepo) {
                throw new Error('Selected directory is not a Git repository');
            }

            return dirHandle;
        } catch (error) {
            if (error.name === 'AbortError') {
                return null; // User cancelled
            }
            throw error;
        }
    }

    /**
     * Fallback directory selection using input element
     * @private
     * @returns {Promise<FileList|null>} Selected files or null
     */
    async selectDirectoryFallback() {
        return new Promise((resolve, reject) => {
            try {
                const input = document.createElement('input');
                input.type = 'file';
                input.webkitdirectory = true;
                input.directory = true;
                input.multiple = true;

                input.onchange = (event) => {
                    const files = event.target.files;
                    if (files.length === 0) {
                        resolve(null);
                        return;
                    }

                    // Check if any .git files are present
                    const hasGitFiles = Array.from(files).some(file => 
                        file.webkitRelativePath.includes('.git/')
                    );

                    if (!hasGitFiles) {
                        reject(new Error('Selected directory is not a Git repository'));
                        return;
                    }

                    resolve(files);
                };

                input.onclick = () => {
                    // Reset value to allow selecting the same directory again
                    input.value = '';
                };

                input.click();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Verifies if a directory is a Git repository
     * @private
     * @param {FileSystemDirectoryHandle} dirHandle - Directory handle
     * @returns {Promise<boolean>} Whether it's a Git repository
     */
    async verifyGitRepository(dirHandle) {
        try {
            // Check for .git subdirectory
            const gitDirHandle = await dirHandle.getDirectoryHandle('.git');
            
            // Check for essential Git files
            const essentialFiles = ['HEAD', 'config', 'refs', 'objects'];
            const checks = essentialFiles.map(async (fileName) => {
                try {
                    if (fileName === 'refs' || fileName === 'objects') {
                        await gitDirHandle.getDirectoryHandle(fileName);
                    } else {
                        await gitDirHandle.getFileHandle(fileName);
                    }
                    return true;
                } catch {
                    return false;
                }
            });

            const results = await Promise.all(checks);
            return results.every(result => result);
        } catch {
            return false;
        }
    }

    /**
     * Reads Git repository files and extracts commit information
     * @param {FileSystemDirectoryHandle|FileList} source - Directory handle or file list
     * @returns {Promise<Object>} Repository information
     */
    async readGitRepository(source) {
        try {
            if (source instanceof FileSystemDirectoryHandle) {
                return await this.readGitRepositoryModern(source);
            } else {
                return await this.readGitRepositoryFallback(source);
            }
        } catch (error) {
            console.error('Error reading Git repository:', error);
            throw new Error(`Failed to read repository: ${error.message}`);
        }
    }

    /**
     * Reads Git repository using modern File System Access API
     * @private
     * @param {FileSystemDirectoryHandle} dirHandle - Directory handle
     * @returns {Promise<Object>} Repository information
     */
    async readGitRepositoryModern(dirHandle) {
        const repoInfo = {
            name: dirHandle.name,
            path: dirHandle.name,
            commits: [],
            branches: [],
            remotes: []
        };

        try {
            const gitDirHandle = await dirHandle.getDirectoryHandle('.git');
            
            // Read HEAD to get current branch
            const headFile = await gitDirHandle.getFileHandle('HEAD');
            const headContent = await this.readFileContent(headFile);
            repoInfo.currentBranch = this.parseHead(headContent);

            // Read config for remote information
            try {
                const configFile = await gitDirHandle.getFileHandle('config');
                const configContent = await this.readFileContent(configFile);
                repoInfo.remotes = this.parseGitConfig(configContent);
            } catch (error) {
                console.warn('Could not read Git config:', error);
            }

            // Read commit logs (simplified)
            repoInfo.commits = await this.readCommitLogs(gitDirHandle);

        } catch (error) {
            console.error('Error reading Git data:', error);
            throw new Error('Failed to read Git repository data');
        }

        return repoInfo;
    }

    /**
     * Reads Git repository using fallback method
     * @private
     * @param {FileList} files - File list from input
     * @returns {Promise<Object>} Repository information
     */
    async readGitRepositoryFallback(files) {
        const repoInfo = {
            name: this.extractRepoName(files),
            path: files[0].webkitRelativePath.split('/')[0],
            commits: [],
            branches: [],
            remotes: []
        };

        try {
            // Find and read HEAD file
            const headFile = Array.from(files).find(file => 
                file.webkitRelativePath.endsWith('.git/HEAD')
            );
            
            if (headFile) {
                const headContent = await this.readFileAsText(headFile);
                repoInfo.currentBranch = this.parseHead(headContent);
            }

            // Find and read config file
            const configFile = Array.from(files).find(file => 
                file.webkitRelativePath.endsWith('.git/config')
            );
            
            if (configFile) {
                const configContent = await this.readFileAsText(configFile);
                repoInfo.remotes = this.parseGitConfig(configContent);
            }

            // Process log files if available
            let logFiles = Array.from(files).filter(file => 
                file.webkitRelativePath.includes('.git/logs/')
            );

            // Also look for custom Git log files in the repository root
            const customLogFiles = Array.from(files).filter(file => {
                const name = file.name.toLowerCase();
                return (name.includes('git-log') || name.includes('commit-log')) && 
                       (name.endsWith('.txt') || name.endsWith('.log'));
            });

            if (customLogFiles.length > 0) {
                console.log('Found custom Git log files:', customLogFiles.map(f => f.name));
                logFiles = [...logFiles, ...customLogFiles];
            }
            
            repoInfo.commits = await this.processLogFiles(logFiles);

        } catch (error) {
            console.error('Error processing Git files:', error);
            throw new Error('Failed to process Git repository files');
        }

        return repoInfo;
    }

    /**
     * Generates Git log files with statistics for enhanced analysis
     * This method provides instructions for creating enhanced Git log files
     * @param {string} repositoryPath - Path to the Git repository
     * @returns {Object} Instructions for generating enhanced Git logs
     */
    generateGitLogInstructions(repositoryPath) {
        return {
            description: "To get full commit statistics, generate enhanced Git log files using these commands:",
            commands: [
                {
                    name: "Full Git Log with Statistics",
                    command: "git log --stat --pretty=fuller > git-log-with-stats.txt",
                    description: "Creates a comprehensive log with file change statistics"
                },
                {
                    name: "Detailed Git Log with Patches",
                    command: "git log --numstat --pretty=format:'commit %H%nAuthor: %an <%ae>%nDate: %ad%nSubject: %s%n%n%b%n' --date=iso > git-log-detailed.txt",
                    description: "Creates a detailed log with numerical file statistics"
                },
                {
                    name: "Recent Commits with Statistics",
                    command: "git log --stat --since='6 months ago' --pretty=fuller > recent-commits-with-stats.txt",
                    description: "Creates a log of recent commits with statistics"
                }
            ],
            usage: "Run these commands in your Git repository, then include the generated files when selecting the repository folder.",
            fileLocation: "Place the generated .txt files in your repository's root directory before selecting the folder."
        };
    }

    /**
     * Reads content from a file handle
     * @private
     * @param {FileSystemFileHandle} fileHandle - File handle
     * @returns {Promise<string>} File content
     */
    async readFileContent(fileHandle) {
        const file = await fileHandle.getFile();
        return await file.text();
    }

    /**
     * Reads a file as text
     * @private
     * @param {File} file - File object
     * @returns {Promise<string>} File content
     */
    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Parses Git HEAD file content
     * @private
     * @param {string} content - HEAD file content
     * @returns {string} Current branch name
     */
    parseHead(content) {
        const line = content.trim();
        if (line.startsWith('ref: refs/heads/')) {
            return line.replace('ref: refs/heads/', '');
        }
        return 'detached';
    }

    /**
     * Parses Git config file content
     * @private
     * @param {string} content - Config file content
     * @returns {Array} Array of remote configurations
     */
    parseGitConfig(content) {
        const remotes = [];
        const lines = content.split('\n');
        let currentRemote = null;

        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('[remote "')) {
                const match = trimmed.match(/\[remote "(.+)"\]/);
                if (match) {
                    currentRemote = { name: match[1] };
                    remotes.push(currentRemote);
                }
            } else if (currentRemote && trimmed.startsWith('url = ')) {
                currentRemote.url = trimmed.replace('url = ', '');
            }
        }

        return remotes;
    }

    /**
     * Reads commit logs from Git directory
     * @private
     * @param {FileSystemDirectoryHandle} gitDirHandle - Git directory handle
     * @returns {Promise<Array>} Array of commits
     */
    async readCommitLogs(gitDirHandle) {
        const commits = [];
        
        try {
            // This is a simplified implementation
            // In a real application, you'd need to parse Git objects properly
            const logsDir = await gitDirHandle.getDirectoryHandle('logs');
            const refsDir = await logsDir.getDirectoryHandle('refs');
            const headsDir = await refsDir.getDirectoryHandle('heads');
            
            // Read main/master branch log
            const branches = ['main', 'master'];
            for (const branch of branches) {
                try {
                    const branchLog = await headsDir.getFileHandle(branch);
                    const logContent = await this.readFileContent(branchLog);
                    const branchCommits = this.parseRefLog(logContent);
                    commits.push(...branchCommits);
                    break; // Found a branch, stop looking
                } catch {
                    // Branch doesn't exist, try next
                }
            }
        } catch (error) {
            console.warn('Could not read commit logs:', error);
        }

        return commits;
    }

    /**
     * Processes log files from file list
     * @private
     * @param {Array} logFiles - Array of log files
     * @returns {Promise<Array>} Array of commits
     */
    async processLogFiles(logFiles) {
        const commits = [];

        // Look for different types of Git log files
        for (const logFile of logFiles) {
            try {
                const content = await this.readFileAsText(logFile);
                const fileName = logFile.webkitRelativePath || logFile.name;
                
                let fileCommits = [];
                
                // Check if this might be a Git log with statistics
                if (this.looksLikeGitLogWithStats(content)) {
                    console.log('Found Git log with statistics:', fileName);
                    fileCommits = this.parseGitLogWithStats(content);
                } else {
                    // Fall back to reflog parsing
                    fileCommits = this.parseRefLog(content);
                }
                
                console.log(`Parsed ${fileCommits.length} commits from ${fileName}`);
                commits.push(...fileCommits);
                
            } catch (error) {
                console.warn('Failed to process log file:', logFile.name, error);
            }
        }

        // Remove duplicates and sort by date
        const uniqueCommits = commits.filter((commit, index, arr) => 
            arr.findIndex(c => c.sha === commit.sha) === index
        );

        console.log(`Total unique commits found: ${uniqueCommits.length}`);
        return uniqueCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Checks if content looks like Git log with statistics
     * @private
     * @param {string} content - File content
     * @returns {boolean} Whether content appears to be Git log with stats
     */
    looksLikeGitLogWithStats(content) {
        // Look for patterns that indicate Git log with statistics
        return content.includes('files changed') || 
               content.includes('insertions(+)') || 
               content.includes('deletions(-)') ||
               content.match(/commit [a-f0-9]{40}/);
    }

    /**
     * Parses a Git reflog file
     * @private
     * @param {string} content - Reflog content
     * @returns {Array} Array of commits
     */
    parseRefLog(content) {
        const commits = [];
        const lines = content.trim().split('\n');

        for (const line of lines) {
            if (!line.trim()) continue;

            try {
                const match = line.match(/^(\w+) (\w+) (.+?) <(.+?)> (\d+) ([+-]\d{4})\t(.+)$/);
                if (match) {
                    const [, oldSha, newSha, name, email, timestamp, timezone, message] = match;
                    
                    commits.push({
                        sha: newSha,
                        message: message.replace(/^commit: /, ''),
                        author: {
                            name: name,
                            email: email
                        },
                        date: new Date(parseInt(timestamp) * 1000).toISOString(),
                        stats: null // Would need additional parsing for stats
                    });
                }
            } catch (error) {
                console.warn('Failed to parse reflog line:', line, error);
            }
        }

        return commits;
    }

    /**
     * Parses Git log with statistics (enhanced format)
     * @private
     * @param {string} content - Git log content with stats
     * @returns {Array} Array of commits with statistics
     */
    parseGitLogWithStats(content) {
        const commits = [];
        
        // Split by commit separator (assuming --format with custom separator)
        const commitBlocks = content.split(/^commit /m).filter(block => block.trim());
        
        for (const block of commitBlocks) {
            try {
                const commit = this.parseGitLogCommitBlock(block);
                if (commit) {
                    commits.push(commit);
                }
            } catch (error) {
                console.warn('Failed to parse commit block:', error);
            }
        }
        
        return commits;
    }

    /**
     * Parses a single Git log commit block with statistics
     * @private
     * @param {string} block - Single commit block
     * @returns {Object|null} Parsed commit object
     */
    parseGitLogCommitBlock(block) {
        const lines = block.trim().split('\n');
        if (lines.length === 0) return null;

        // Extract commit SHA (first line)
        const shaMatch = lines[0].match(/^([a-f0-9]{40})/);
        if (!shaMatch) return null;

        const sha = shaMatch[1];
        let author = { name: 'Unknown', email: 'unknown@example.com' };
        let date = new Date().toISOString();
        let message = '';
        let stats = { additions: 0, deletions: 0, files: [] };

        // Parse commit metadata and statistics
        let inMessage = false;
        let inStats = false;
        let messageLines = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            // Parse author line
            if (line.startsWith('Author: ')) {
                const authorMatch = line.match(/^Author: (.+?) <(.+?)>$/);
                if (authorMatch) {
                    author = { name: authorMatch[1], email: authorMatch[2] };
                }
                continue;
            }

            // Parse date line
            if (line.startsWith('Date: ')) {
                const dateStr = line.replace('Date: ', '').trim();
                date = new Date(dateStr).toISOString();
                continue;
            }

            // Start of commit message
            if (line === '' && !inMessage && !inStats) {
                inMessage = true;
                continue;
            }

            // Parse commit message
            if (inMessage && !inStats) {
                if (line.trim() === '' && messageLines.length > 0) {
                    // Empty line might indicate end of message, start looking for stats
                    continue;
                }
                if (line.match(/^\s*\d+\s+files?\s+changed/)) {
                    // Statistics line found
                    inStats = true;
                    inMessage = false;
                    message = messageLines.join('\n').trim();
                    // Process this stats line
                    i--; // Reprocess this line as stats
                    continue;
                }
                messageLines.push(line.replace(/^    /, '')); // Remove leading spaces
                continue;
            }

            // Parse statistics
            if (inStats || line.match(/^\s*\d+\s+files?\s+changed/)) {
                inStats = true;
                if (!inMessage && messageLines.length > 0) {
                    message = messageLines.join('\n').trim();
                }

                // Parse summary line: "X files changed, Y insertions(+), Z deletions(-)"
                const statsMatch = line.match(/(\d+)\s+files?\s+changed(?:,\s*(\d+)\s+insertions?\(\+\))?(?:,\s*(\d+)\s+deletions?\(-\))?/);
                if (statsMatch) {
                    const filesChanged = parseInt(statsMatch[1]) || 0;
                    const insertions = parseInt(statsMatch[2]) || 0;
                    const deletions = parseInt(statsMatch[3]) || 0;
                    
                    stats.additions = insertions;
                    stats.deletions = deletions;
                    // Generate file list (simplified)
                    stats.files = Array(filesChanged).fill(0).map((_, idx) => `file${idx + 1}`);
                    continue;
                }

                // Parse individual file stats: "path/to/file | X ++--"
                const fileMatch = line.match(/^\s*(.+?)\s*\|\s*(\d+)\s*([+\-]*)/);
                if (fileMatch) {
                    const filename = fileMatch[1].trim();
                    const changes = parseInt(fileMatch[2]) || 0;
                    const markers = fileMatch[3] || '';
                    
                    if (filename && !stats.files.includes(filename)) {
                        stats.files.push(filename);
                    }
                    
                    // Count + and - markers for more accurate stats
                    const additions = (markers.match(/\+/g) || []).length;
                    const deletions = (markers.match(/-/g) || []).length;
                    
                    // This is per-file, but for simplicity we'll aggregate
                    continue;
                }
            }
        }

        // Finalize message if not set
        if (!message && messageLines.length > 0) {
            message = messageLines.join('\n').trim();
        }

        return {
            sha: sha,
            shortSha: sha.substring(0, 7),
            message: message || 'No commit message',
            author: author,
            date: date,
            stats: stats.additions > 0 || stats.deletions > 0 || stats.files.length > 0 ? stats : null
        };
    }

    /**
     * Extracts repository name from file list
     * @private
     * @param {FileList} files - File list
     * @returns {string} Repository name
     */
    extractRepoName(files) {
        if (files.length === 0) return 'Unknown Repository';
        
        const path = files[0].webkitRelativePath;
        const parts = path.split('/');
        return parts[0] || 'Unknown Repository';
    }

    /**
     * Validates file size
     * @private
     * @param {File} file - File to validate
     * @returns {boolean} Whether file size is valid
     */
    validateFileSize(file) {
        return file.size <= this.maxFileSize;
    }

    /**
     * Gets file extension
     * @private
     * @param {string} filename - File name
     * @returns {string} File extension
     */
    getFileExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        return lastDot > -1 ? filename.substring(lastDot) : '';
    }

    /**
     * Checks if file type is supported
     * @private
     * @param {string} filename - File name
     * @returns {boolean} Whether file type is supported
     */
    isSupportedFileType(filename) {
        const extension = this.getFileExtension(filename);
        return this.supportedFormats.includes(extension);
    }

    /**
     * Creates a download link for data
     * @param {string} data - Data to download
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    downloadData(data, filename, mimeType = 'application/json') {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Exports repository analysis data
     * @param {Object} data - Analysis data
     * @param {string} format - Export format ('json', 'csv')
     */
    exportAnalysisData(data, format = 'json') {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `git-analysis-${timestamp}.${format}`;
        
        if (format === 'json') {
            this.downloadData(JSON.stringify(data, null, 2), filename, 'application/json');
        } else if (format === 'csv') {
            const csv = this.convertToCSV(data);
            this.downloadData(csv, filename, 'text/csv');
        }
    }

    /**
     * Converts analysis data to CSV format
     * @private
     * @param {Object} data - Analysis data
     * @returns {string} CSV content
     */
    convertToCSV(data) {
        if (!data.commits) return 'No commit data available';
        
        const headers = ['SHA', 'Message', 'Author', 'Email', 'Date', 'Additions', 'Deletions'];
        const rows = data.commits.map(commit => [
            commit.sha,
            `"${commit.message.replace(/"/g, '""')}"`,
            commit.author.name,
            commit.author.email,
            commit.date,
            commit.stats?.additions || 0,
            commit.stats?.deletions || 0
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileHandler;
} else {
    window.FileHandler = FileHandler;
}
