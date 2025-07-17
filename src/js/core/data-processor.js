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
 * Data Processor - Processes and formats repository data
 * This module handles the processing of commit data from various sources
 * and calculates productivity metrics for display.
 */

class DataProcessor {
    constructor() {
        this.processedData = null;
    }

    /**
     * Processes raw commit data and calculates metrics
     * @param {Array} commits - Array of commit objects
     * @param {Object} repository - Repository information
     * @returns {Object} Processed data with metrics
     */
    processCommitData(commits, repository = {}) {
        console.log(`Processing ${commits.length} commits...`);
        
        const metrics = this.calculateProductivityMetrics(commits);
        const timeline = this.createCommitTimeline(commits);
        const contributors = this.analyzeContributors(commits);
        const fileAnalysis = this.analyzeFileChanges(commits);
        
        this.processedData = {
            repository,
            summary: metrics,
            timeline,
            contributors,
            fileAnalysis,
            commits: this.formatCommitsForDisplay(commits)
        };

        return this.processedData;
    }

    /**
     * Calculates summary metrics for a filtered set of commits
     * @param {Array} commits - Array of commit objects
     * @param {Object} repository - Repository information
     * @returns {Object} Summary metrics
     */
    calculateSummary(commits, repository = {}) {
        return this.calculateProductivityMetrics(commits);
    }

    /**
     * Calculates comprehensive productivity metrics
     * @param {Array} commits - Array of commit objects
     * @returns {Object} Calculated metrics
     */
    calculateProductivityMetrics(commits) {
        const totalCommits = commits.length;
        
        let totalAdditions = 0;
        let totalDeletions = 0;
        let totalFiles = new Set();
        let commitDates = [];
        
        commits.forEach(commit => {
            if (commit.stats) {
                totalAdditions += commit.stats.additions || 0;
                totalDeletions += commit.stats.deletions || 0;
                
                if (commit.stats.files) {
                    if (Array.isArray(commit.stats.files)) {
                        commit.stats.files.forEach(file => {
                            if (typeof file === 'string') {
                                totalFiles.add(file);
                            } else if (file.filename) {
                                totalFiles.add(file.filename);
                            }
                        });
                    }
                }
            }
            
            if (commit.date) {
                commitDates.push(new Date(commit.date));
            }
        });

        const dateRange = this.calculateDateRange(commitDates);
        const commitFrequency = this.calculateCommitFrequency(commitDates, dateRange);
        const contributors = this.getUniqueContributors(commits);
        
        // Estimate repository storage size (simplified calculation)
        const estimatedRepoSize = this.estimateRepositorySize(totalAdditions, totalFiles.size);
        
        // Estimate total lines of code (current state)
        const estimatedTotalLOC = Math.max(0, totalAdditions - totalDeletions);
        
        return {
            totalCommits,
            totalAdditions,
            totalDeletions,
            netChanges: totalAdditions - totalDeletions,
            totalFiles: totalFiles.size,
            contributors: contributors.length,
            dateRange,
            commitFrequency,
            averageCommitSize: totalCommits > 0 ? Math.round((totalAdditions + totalDeletions) / totalCommits) : 0,
            productivity: this.calculateProductivityScore(totalCommits, totalAdditions, totalDeletions, dateRange.days),
            repositorySize: estimatedRepoSize,
            totalLinesOfCode: estimatedTotalLOC
        };
    }

    /**
     * Estimates repository storage size based on lines of code and file count
     * @param {number} totalLines - Total lines added
     * @param {number} fileCount - Number of files
     * @returns {Object} Size estimate with value and unit
     */
    estimateRepositorySize(totalLines, fileCount) {
        // Rough estimation: average 50 characters per line, plus overhead
        const avgCharsPerLine = 50;
        const bytesPerChar = 2; // UTF-8 encoding
        const fileOverhead = 1024; // Average file metadata overhead
        
        const contentSize = totalLines * avgCharsPerLine * bytesPerChar;
        const metadataSize = fileCount * fileOverhead;
        const gitOverhead = contentSize * 0.3; // Git repository overhead
        
        const totalBytes = contentSize + metadataSize + gitOverhead;
        
        if (totalBytes < 1024) {
            return { value: Math.round(totalBytes), unit: 'B' };
        } else if (totalBytes < 1024 * 1024) {
            return { value: Math.round(totalBytes / 1024), unit: 'KB' };
        } else {
            return { value: Math.round(totalBytes / (1024 * 1024)), unit: 'MB' };
        }
    }

    /**
     * Calculates metrics for date-filtered commits
     * @param {Array} commits - Filtered commits array
     * @param {Date} startDate - Filter start date
     * @param {Date} endDate - Filter end date
     * @returns {Object} Date-filtered metrics
     */
    calculateDateFilteredMetrics(commits, startDate = null, endDate = null) {
        let filteredCommits = commits;
        
        if (startDate || endDate) {
            filteredCommits = commits.filter(commit => {
                const commitDate = new Date(commit.date);
                if (startDate && commitDate < startDate) return false;
                if (endDate && commitDate > endDate) return false;
                return true;
            });
        }
        
        const filteredCommitCount = filteredCommits.length;
        let filteredAdditions = 0;
        let filteredDeletions = 0;
        
        filteredCommits.forEach(commit => {
            if (commit.stats) {
                filteredAdditions += commit.stats.additions || 0;
                filteredDeletions += commit.stats.deletions || 0;
            }
        });
        
        const dateRange = startDate && endDate ? {
            start: startDate,
            end: endDate,
            days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        } : null;
        
        return {
            filteredCommits: filteredCommitCount,
            filteredAdditions,
            filteredDeletions,
            filteredProductivity: this.calculateProductivityScore(
                filteredCommitCount, 
                filteredAdditions, 
                filteredDeletions, 
                dateRange ? dateRange.days : 1
            ),
            dateRange
        };
    }

    /**
     * Creates a timeline of commit activity
     * @param {Array} commits - Array of commit objects
     * @returns {Object} Timeline data
     */
    createCommitTimeline(commits) {
        const timeline = {};
        
        commits.forEach(commit => {
            if (commit.date) {
                const date = new Date(commit.date).toISOString().split('T')[0];
                
                if (!timeline[date]) {
                    timeline[date] = {
                        date,
                        commits: 0,
                        additions: 0,
                        deletions: 0,
                        authors: new Set()
                    };
                }
                
                timeline[date].commits++;
                timeline[date].additions += commit.stats?.additions || 0;
                timeline[date].deletions += commit.stats?.deletions || 0;
                timeline[date].authors.add(commit.author.email);
            }
        });

        // Convert Set to count for authors
        Object.values(timeline).forEach(day => {
            day.authors = day.authors.size;
        });

        return {
            daily: Object.values(timeline).sort((a, b) => new Date(a.date) - new Date(b.date)),
            summary: this.summarizeTimeline(timeline)
        };
    }

    /**
     * Analyzes contributor activity and productivity
     * @param {Array} commits - Array of commit objects
     * @returns {Object} Contributor analysis
     */
    analyzeContributors(commits) {
        const contributors = {};
        
        commits.forEach(commit => {
            const email = commit.author.email;
            const name = commit.author.name;
            
            if (!contributors[email]) {
                contributors[email] = {
                    name,
                    email,
                    commits: 0,
                    additions: 0,
                    deletions: 0,
                    firstCommit: commit.date,
                    lastCommit: commit.date,
                    files: new Set()
                };
            }
            
            const contributor = contributors[email];
            contributor.commits++;
            contributor.additions += commit.stats?.additions || 0;
            contributor.deletions += commit.stats?.deletions || 0;
            
            // Update date range
            if (new Date(commit.date) < new Date(contributor.firstCommit)) {
                contributor.firstCommit = commit.date;
            }
            if (new Date(commit.date) > new Date(contributor.lastCommit)) {
                contributor.lastCommit = commit.date;
            }
            
            // Track files modified
            if (commit.stats?.files) {
                commit.stats.files.forEach(file => {
                    const filename = typeof file === 'string' ? file : file.filename;
                    if (filename) contributor.files.add(filename);
                });
            }
        });

        // Convert to array and calculate additional metrics
        const contributorArray = Object.values(contributors).map(contributor => ({
            ...contributor,
            files: contributor.files.size,
            averageCommitSize: contributor.commits > 0 ? 
                Math.round((contributor.additions + contributor.deletions) / contributor.commits) : 0,
            activeDays: this.calculateActiveDays(contributor.firstCommit, contributor.lastCommit)
        }));

        return {
            list: contributorArray.sort((a, b) => b.commits - a.commits),
            summary: this.summarizeContributors(contributorArray)
        };
    }

    /**
     * Analyzes file changes and patterns
     * @param {Array} commits - Array of commit objects
     * @returns {Object} File analysis
     */
    analyzeFileChanges(commits) {
        const fileStats = {};
        const fileTypes = {};
        
        commits.forEach(commit => {
            if (commit.stats?.files) {
                commit.stats.files.forEach(file => {
                    const filename = typeof file === 'string' ? file : file.filename;
                    if (!filename) return;
                    
                    // Track file statistics
                    if (!fileStats[filename]) {
                        fileStats[filename] = {
                            filename,
                            modifications: 0,
                            additions: 0,
                            deletions: 0,
                            authors: new Set()
                        };
                    }
                    
                    const stats = fileStats[filename];
                    stats.modifications++;
                    stats.authors.add(commit.author.email);
                    
                    if (typeof file === 'object') {
                        stats.additions += file.additions || 0;
                        stats.deletions += file.deletions || 0;
                    }
                    
                    // Track file types
                    const extension = this.getFileExtension(filename);
                    if (!fileTypes[extension]) {
                        fileTypes[extension] = {
                            extension,
                            files: new Set(),
                            modifications: 0,
                            additions: 0,
                            deletions: 0
                        };
                    }
                    
                    fileTypes[extension].files.add(filename);
                    fileTypes[extension].modifications++;
                    if (typeof file === 'object') {
                        fileTypes[extension].additions += file.additions || 0;
                        fileTypes[extension].deletions += file.deletions || 0;
                    }
                });
            }
        });

        // Convert to arrays and calculate metrics
        const mostModifiedFiles = Object.values(fileStats)
            .map(file => ({
                ...file,
                authors: file.authors.size
            }))
            .sort((a, b) => b.modifications - a.modifications)
            .slice(0, 20);

        const fileTypeAnalysis = Object.values(fileTypes)
            .map(type => ({
                ...type,
                files: type.files.size
            }))
            .sort((a, b) => b.modifications - a.modifications);

        return {
            mostModifiedFiles,
            fileTypeAnalysis,
            totalUniqueFiles: Object.keys(fileStats).length
        };
    }

    /**
     * Formats commits for display in the dashboard
     * @param {Array} commits - Array of commit objects
     * @returns {Array} Formatted commits
     */
    formatCommitsForDisplay(commits) {
        return commits.map(commit => {
            const fullMessage = commit.message || '';
            const firstLine = fullMessage.split('\n')[0];
            const messagePreview = firstLine.length > 80 ? 
                firstLine.substring(0, 77) + '...' : 
                firstLine;
            
            return {
                ...commit,
                shortSha: (commit.sha || '').substring(0, 7),
                formattedDate: new Date(commit.date).toLocaleString(),
                relativeDate: this.getRelativeDate(commit.date),
                absoluteDate: new Date(commit.date).toLocaleString(),
                message: fullMessage, // Preserve full message
                messagePreview: messagePreview, // Short preview for list view
                stats: commit.stats ? {
                    ...commit.stats,
                    totalChanges: (commit.stats.additions || 0) + (commit.stats.deletions || 0)
                } : null
            };
        });
    }

    /**
     * Calculates date range from commit dates
     * @private
     * @param {Array} dates - Array of Date objects
     * @returns {Object} Date range information
     */
    calculateDateRange(dates) {
        if (dates.length === 0) {
            return { start: null, end: null, days: 0 };
        }

        const start = new Date(Math.min(...dates));
        const end = new Date(Math.max(...dates));
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
            days,
            startFormatted: start.toLocaleDateString(),
            endFormatted: end.toLocaleDateString()
        };
    }

    /**
     * Calculates commit frequency metrics
     * @private
     * @param {Array} dates - Array of Date objects
     * @param {Object} dateRange - Date range object
     * @returns {Object} Frequency metrics
     */
    calculateCommitFrequency(dates, dateRange) {
        if (dateRange.days === 0) return { daily: 0, weekly: 0, monthly: 0 };

        const totalCommits = dates.length;
        
        return {
            daily: (totalCommits / dateRange.days).toFixed(2),
            weekly: (totalCommits / (dateRange.days / 7)).toFixed(2),
            monthly: (totalCommits / (dateRange.days / 30)).toFixed(2)
        };
    }

    /**
     * Gets unique contributors from commits
     * @private
     * @param {Array} commits - Array of commit objects
     * @returns {Array} Array of unique contributor emails
     */
    getUniqueContributors(commits) {
        const contributors = new Set();
        commits.forEach(commit => {
            if (commit.author?.email) {
                contributors.add(commit.author.email);
            }
        });
        return Array.from(contributors);
    }

    /**
     * Calculates a productivity score
     * @private
     * @param {number} commits - Number of commits
     * @param {number} additions - Lines added
     * @param {number} deletions - Lines deleted
     * @param {number} days - Number of days
     * @returns {number} Productivity score
     */
    calculateProductivityScore(commits, additions, deletions, days) {
        if (days === 0) return 0;
        
        const commitScore = commits / days * 10;
        const changeScore = (additions + deletions) / days / 100;
        
        return Math.round((commitScore + changeScore) * 10) / 10;
    }

    /**
     * Gets file extension from filename
     * @private
     * @param {string} filename - File name
     * @returns {string} File extension
     */
    getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'no-extension';
    }

    /**
     * Gets relative date string
     * @private
     * @param {string} dateString - ISO date string
     * @returns {string} Relative date
     */
    getRelativeDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }

    /**
     * Calculates active days for a contributor
     * @private
     * @param {string} firstCommit - First commit date
     * @param {string} lastCommit - Last commit date
     * @returns {number} Number of active days
     */
    calculateActiveDays(firstCommit, lastCommit) {
        const start = new Date(firstCommit);
        const end = new Date(lastCommit);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    /**
     * Summarizes timeline data
     * @private
     * @param {Object} timeline - Timeline object
     * @returns {Object} Timeline summary
     */
    summarizeTimeline(timeline) {
        const days = Object.values(timeline);
        const totalDays = days.length;
        
        if (totalDays === 0) return {};
        
        const avgCommitsPerDay = days.reduce((sum, day) => sum + day.commits, 0) / totalDays;
        const maxCommitsDay = days.reduce((max, day) => day.commits > max.commits ? day : max, days[0]);
        
        return {
            totalActiveDays: totalDays,
            averageCommitsPerDay: Math.round(avgCommitsPerDay * 100) / 100,
            mostActiveDay: maxCommitsDay
        };
    }

    /**
     * Summarizes contributor data
     * @private
     * @param {Array} contributors - Array of contributor objects
     * @returns {Object} Contributor summary
     */
    summarizeContributors(contributors) {
        if (contributors.length === 0) return {};
        
        const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0);
        const topContributor = contributors[0]; // Already sorted by commits
        
        return {
            total: contributors.length,
            topContributor: topContributor.name,
            topContributorCommits: topContributor.commits,
            topContributorPercentage: Math.round((topContributor.commits / totalCommits) * 100)
        };
    }

    /**
     * Gets the processed data
     * @returns {Object} Processed data
     */
    getProcessedData() {
        return this.processedData;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataProcessor;
} else {
    window.DataProcessor = DataProcessor;
}
