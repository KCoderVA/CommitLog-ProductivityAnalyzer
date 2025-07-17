/**
 * Copyright 2025 KCoderVA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Git Analyzer - Handles local Git repository analysis
 * This module provides functionality to analyze local Git repositories
 * and extract commit history and productivity metrics.
 */

class GitAnalyzer {
    constructor() {
        this.repository = null;
        this.commits = [];
        this.stats = {};
    }

    /**
     * Analyzes a local Git repository
     * @param {string|Object} repoPathOrData - Path to the Git repository or repository data object
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeRepository(repoPathOrData) {
        try {
            let repoPath, repoData;
            
            if (typeof repoPathOrData === 'string') {
                repoPath = repoPathOrData;
                repoData = null;
            } else {
                repoPath = repoPathOrData.path || repoPathOrData.name || 'Unknown';
                repoData = repoPathOrData;
            }
            
            console.log(`Analyzing repository at: ${repoPath}`);
            
            // Note: In a real implementation, this would use Node.js or a Git library
            // For browser-based offline version, we'll work with data provided by FileHandler
            
            this.repository = {
                path: repoPath,
                name: this.extractRepoName(repoPath),
                ...repoData // Include any additional data from FileHandler
            };

            // Load commit history (enhanced to work with FileHandler data)
            await this.loadCommitHistory();
            this.calculateStats();
            
            return {
                repository: this.repository,
                commits: this.commits,
                stats: this.stats
            };
        } catch (error) {
            console.error('Error analyzing repository:', error);
            throw new Error(`Failed to analyze repository: ${error.message}`);
        }
    }

    /**
     * Loads commit history from the Git repository
     * @private
     */
    async loadCommitHistory() {
        console.log('Loading commit history...');
        
        // Note: This is a simplified browser-based implementation
        // For full Git parsing, we'd need to read Git objects directly
        // For now, we'll try to get as much data as possible from reflogs and other files
        
        try {
            // Try to read from the repository data if it was provided by FileHandler
            if (this.repository && this.repository.commits) {
                this.commits = this.repository.commits;
                console.log(`Loaded ${this.commits.length} commits from repository data`);
            } else {
                // Fallback to enhanced mock data that better represents real data
                console.warn('No repository commit data available, using enhanced mock data');
                this.commits = this.generateEnhancedMockData();
            }
            
            // Enhance commits with stats if missing
            for (const commit of this.commits) {
                if (!commit.stats) {
                    commit.stats = this.estimateCommitStats(commit);
                }
            }
            
        } catch (error) {
            console.error('Error loading commit history:', error);
            // Use fallback data
            this.commits = this.generateEnhancedMockData();
        }
    }

    /**
     * Generates enhanced mock data for development/fallback
     * @private
     */
    generateEnhancedMockData() {
        const commits = [];
        const baseDate = new Date();
        
        // Generate commits that roughly match our actual repository
        const commitData = [
            { msg: 'Add date filter functionality with collapsible repository section', additions: 471, deletions: 0, files: 4 },
            { msg: 'Fix Dashboard initialization timing issue', additions: 479, deletions: 4, files: 7 },
            { msg: 'Fix Dashboard dependency initialization issues', additions: 238, deletions: 10, files: 2 },
            { msg: 'Resume work after system crash: Add enhanced debugging', additions: 383, deletions: 3, files: 3 },
            { msg: 'fix: Correct version numbering to reflect development stage', additions: 41, deletions: 18, files: 4 },
            { msg: 'docs: Add temporary files policy reference to README', additions: 1, deletions: 0, files: 1 },
            { msg: 'docs: Establish permanent temporary files policy', additions: 79, deletions: 2, files: 2 },
            { msg: 'feat: Configure project for GitHub Pages deployment', additions: 6, deletions: 3, files: 2 },
            { msg: 'feat: Comprehensive project file improvements', additions: 319, deletions: 96, files: 3 },
            { msg: 'refactor: Remove obsolete Commit_Productivity_Dashboard.html', additions: 1, deletions: 73, files: 2 },
            { msg: 'license: Change project license to Apache 2.0', additions: 340, deletions: 1, files: 11 },
            { msg: 'docs: Add comprehensive CHANGELOG.md', additions: 107, deletions: 0, files: 1 },
            { msg: 'Initial commit: Create Git/GitHub Commit Log Productivity Analyzer', additions: 6319, deletions: 0, files: 23 }
        ];
        
        commitData.forEach((data, index) => {
            const commitDate = new Date(baseDate.getTime() - (index * 10 * 60 * 1000)); // 10 minutes apart
            commits.push({
                sha: `commit${index.toString().padStart(3, '0')}`,
                message: data.msg,
                author: {
                    name: 'Developer',
                    email: 'dev@example.com'
                },
                date: commitDate.toISOString(),
                stats: {
                    additions: data.additions,
                    deletions: data.deletions,
                    files: Array(data.files).fill(0).map((_, i) => `file${i}.js`)
                }
            });
        });
        
        return commits;
    }

    /**
     * Estimates commit stats for commits missing stats
     * @private
     */
    estimateCommitStats(commit) {
        // Basic estimation based on commit message
        const message = commit.message.toLowerCase();
        let additions = 50; // Default
        let deletions = 0;
        
        if (message.includes('initial') || message.includes('create')) {
            additions = 200;
        } else if (message.includes('refactor') || message.includes('remove')) {
            additions = 20;
            deletions = 50;
        } else if (message.includes('fix') || message.includes('bug')) {
            additions = 30;
            deletions = 10;
        } else if (message.includes('feat') || message.includes('add')) {
            additions = 100;
            deletions = 5;
        }
        
        return {
            additions,
            deletions,
            files: ['file.js'] // Generic filename
        };
    }

    /**
     * Calculates productivity statistics
     * @private
     */
    calculateStats() {
        const totalCommits = this.commits.length;
        const totalAdditions = this.commits.reduce((sum, commit) => sum + (commit.stats?.additions || 0), 0);
        const totalDeletions = this.commits.reduce((sum, commit) => sum + (commit.stats?.deletions || 0), 0);
        
        const contributors = new Set(this.commits.map(commit => commit.author.email)).size;
        const files = new Set();
        this.commits.forEach(commit => {
            if (commit.stats?.files) {
                commit.stats.files.forEach(file => files.add(file));
            }
        });

        this.stats = {
            totalCommits,
            totalAdditions,
            totalDeletions,
            totalFiles: files.size,
            contributors,
            dateRange: this.getDateRange()
        };
    }

    /**
     * Gets the date range of commits
     * @private
     * @returns {Object} Date range object
     */
    getDateRange() {
        if (this.commits.length === 0) {
            return { start: null, end: null };
        }

        const dates = this.commits.map(commit => new Date(commit.date));
        const start = new Date(Math.min(...dates));
        const end = new Date(Math.max(...dates));

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    }

    /**
     * Extracts repository name from path
     * @private
     * @param {string} path - Repository path
     * @returns {string} Repository name
     */
    extractRepoName(path) {
        const parts = path.split(/[\/\\]/);
        return parts[parts.length - 1] || 'Unknown Repository';
    }

    /**
     * Gets commit history
     * @returns {Array} Array of commit objects
     */
    getCommitHistory() {
        return this.commits;
    }

    /**
     * Gets repository statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return this.stats;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitAnalyzer;
} else {
    window.GitAnalyzer = GitAnalyzer;
}
