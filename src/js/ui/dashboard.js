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
 * Dashboard Controller - Main UI controller for the productivity dashboard
 * This module handles the main dashboard functionality and user interactions.
 */

class Dashboard {
    constructor() {
        this.gitAnalyzer = new GitAnalyzer();
        this.githubAPI = new GitHubAPI();
        this.dataProcessor = new DataProcessor();
        this.charts = new Charts();
        this.currentData = null;
        this.isAnalyzing = false;
    }

    /**
     * Initializes the dashboard
     */
    initialize() {
        console.log('Initializing Dashboard...');
        this.setupEventListeners();
        this.setupUI();
        this.loadConfiguration();
    }

    /**
     * Sets up event listeners for UI interactions
     * @private
     */
    setupEventListeners() {
        // Local repository selection (offline version only)
        const selectLocalBtn = document.getElementById('select-local-repo');
        if (selectLocalBtn && window.APP_ENVIRONMENT === 'offline') {
            selectLocalBtn.addEventListener('click', () => this.selectLocalRepository());
        }

        // GitHub repository analysis
        const analyzeGitHubBtn = document.getElementById('analyze-github-repo');
        if (analyzeGitHubBtn) {
            analyzeGitHubBtn.addEventListener('click', () => this.analyzeGitHubRepository());
        }

        // GitHub URL input - allow Enter key
        const githubInput = document.getElementById('github-repo-url');
        if (githubInput) {
            githubInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzeGitHubRepository();
                }
            });
        }
    }

    /**
     * Sets up initial UI state
     * @private
     */
    setupUI() {
        // Hide analysis sections initially
        this.hideSection('summary-analysis');
        this.hideSection('detailed-history');
        
        // Set placeholder text based on version
        const githubInput = document.getElementById('github-repo-url');
        if (githubInput) {
            githubInput.placeholder = 'Enter GitHub repository URL (e.g., username/repository)';
        }
    }

    /**
     * Loads configuration based on environment
     * @private
     */
    loadConfiguration() {
        // Configuration will be loaded from config files
        // This can include API keys, rate limits, etc.
        console.log('Loading configuration...');
    }

    /**
     * Handles local repository selection
     */
    async selectLocalRepository() {
        // Check if we're in offline environment and have the necessary components
        if (window.APP_ENVIRONMENT !== 'offline') {
            this.showError('Local repository analysis is only available in the offline version.');
            return;
        }

        if (!window.FileHandler) {
            this.showError('File handler not available. Please ensure you are using the offline version.');
            return;
        }

        try {
            this.setAnalyzing(true);
            
            // Initialize file handler if not already done
            const fileHandler = new FileHandler();
            
            console.log('Opening file picker for local repository...');
            
            // Use the file handler to select repository
            const repositorySource = await fileHandler.selectGitRepository();
            
            if (!repositorySource) {
                // User cancelled selection
                return;
            }

            this.showStatus('Reading repository data...');
            const repositoryData = await fileHandler.readGitRepository(repositorySource);
            
            if (!repositoryData.commits || repositoryData.commits.length === 0) {
                this.showError('No commits found in the selected repository.');
                return;
            }

            // Process the data using GitAnalyzer if available
            let processedData;
            if (window.GitAnalyzer) {
                const gitAnalyzer = new GitAnalyzer();
                const analysisResult = await gitAnalyzer.analyzeRepository(repositoryData.path);
                processedData = this.dataProcessor.processCommitData(analysisResult.commits, repositoryData);
            } else {
                // Fallback to direct processing
                processedData = this.dataProcessor.processCommitData(repositoryData.commits, repositoryData);
            }

            this.currentData = processedData;
            this.displayResults(processedData);
            this.hideStatus();
            
        } catch (error) {
            console.error('Error selecting local repository:', error);
            this.showError(`Failed to analyze repository: ${error.message}`);
        } finally {
            this.setAnalyzing(false);
        }
    }

    /**
     * Analyzes a GitHub repository
     */
    async analyzeGitHubRepository() {
        const urlInput = document.getElementById('github-repo-url');
        const url = urlInput?.value.trim();
        
        if (!url) {
            this.showError('Please enter a GitHub repository URL');
            return;
        }

        try {
            this.setAnalyzing(true);
            this.showStatus('Analyzing GitHub repository...');
            
            // Parse the repository URL
            const { owner, repo } = this.githubAPI.parseRepoURL(url);
            console.log(`Analyzing repository: ${owner}/${repo}`);
            
            // Fetch repository information
            this.showStatus('Fetching repository information...');
            const repository = await this.githubAPI.fetchRepository(owner, repo);
            
            // Fetch commits with details
            this.showStatus('Fetching commit history...');
            const commits = await this.githubAPI.getAllCommitsWithDetails(owner, repo, {
                maxPages: 5 // Limit to prevent excessive API calls
            });
            
            if (commits.length === 0) {
                this.showError('No commits found in this repository');
                return;
            }

            // Process the data
            this.showStatus('Processing data...');
            const processedData = this.dataProcessor.processCommitData(commits, repository);
            this.currentData = processedData;
            
            // Display the results
            this.displayResults(processedData);
            this.hideStatus();
            
        } catch (error) {
            console.error('Error analyzing GitHub repository:', error);
            this.showError(`Failed to analyze repository: ${error.message}`);
        } finally {
            this.setAnalyzing(false);
        }
    }

    /**
     * Displays the analysis results
     * @param {Object} data - Processed repository data
     */
    displayResults(data) {
        console.log('Displaying results...');
        
        // Show the analysis sections
        this.showSection('summary-analysis');
        this.showSection('detailed-history');
        
        // Display summary
        this.displaySummary(data.summary, data.repository);
        
        // Display detailed history
        this.displayDetailedHistory(data.commits);
        
        // Display charts
        this.displayCharts(data);
        
        // Scroll to results
        document.getElementById('summary-analysis').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    /**
     * Displays the summary section
     * @param {Object} summary - Summary data
     * @param {Object} repository - Repository information
     */
    displaySummary(summary, repository) {
        const summaryContent = document.getElementById('summary-content');
        if (!summaryContent) return;

        summaryContent.innerHTML = `
            <div class="repository-info">
                <h3>${repository.name || 'Repository'}</h3>
                ${repository.description ? `<p class="repo-description">${repository.description}</p>` : ''}
                ${repository.url ? `<p><a href="${repository.url}" target="_blank" class="repo-link">View on GitHub</a></p>` : ''}
            </div>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${summary.totalCommits.toLocaleString()}</div>
                    <div class="metric-label">Total Commits</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${summary.contributors}</div>
                    <div class="metric-label">Contributors</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${summary.totalFiles.toLocaleString()}</div>
                    <div class="metric-label">Files Modified</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">+${summary.totalAdditions.toLocaleString()}</div>
                    <div class="metric-label">Lines Added</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">-${summary.totalDeletions.toLocaleString()}</div>
                    <div class="metric-label">Lines Deleted</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${summary.netChanges >= 0 ? '+' : ''}${summary.netChanges.toLocaleString()}</div>
                    <div class="metric-label">Net Changes</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${summary.averageCommitSize}</div>
                    <div class="metric-label">Avg Commit Size</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${summary.productivity}</div>
                    <div class="metric-label">Productivity Score</div>
                </div>
            </div>
            
            <div class="date-range">
                <h4>Analysis Period</h4>
                <p>${summary.dateRange.startFormatted} - ${summary.dateRange.endFormatted}</p>
                <p>${summary.dateRange.days} days | Avg ${summary.commitFrequency.daily} commits/day</p>
            </div>
        `;
    }

    /**
     * Displays the detailed commit history
     * @param {Array} commits - Array of formatted commits
     */
    displayDetailedHistory(commits) {
        const detailsContent = document.getElementById('commit-details');
        if (!detailsContent) return;

        const commitsHtml = commits.slice(0, 50).map(commit => `
            <div class="commit-item">
                <div class="commit-header">
                    <span class="commit-sha">${commit.shortSha}</span>
                    <span class="commit-author">${commit.author.name}</span>
                    <span class="commit-date">${commit.relativeDate}</span>
                </div>
                <div class="commit-message">${commit.messagePreview}</div>
                ${commit.stats ? `
                    <div class="commit-stats">
                        <span class="additions">+${commit.stats.additions || 0}</span>
                        <span class="deletions">-${commit.stats.deletions || 0}</span>
                        <span class="files">${commit.stats.files?.length || 0} files</span>
                    </div>
                ` : ''}
            </div>
        `).join('');

        detailsContent.innerHTML = `
            <div class="commits-header">
                <h4>Recent Commits (${Math.min(commits.length, 50)} of ${commits.length})</h4>
            </div>
            <div class="commits-list">
                ${commitsHtml}
            </div>
        `;
    }

    /**
     * Displays charts and visualizations
     * @param {Object} data - Processed data
     */
    displayCharts(data) {
        try {
            // Create chart containers if they don't exist
            this.ensureChartContainers();
            
            // Create various charts
            this.charts.createCommitTimelineChart(data.timeline);
            this.charts.createContributorChart(data.contributors);
            this.charts.createFileTypeChart(data.fileAnalysis);
            
        } catch (error) {
            console.error('Error creating charts:', error);
        }
    }

    /**
     * Ensures chart containers exist
     * @private
     */
    ensureChartContainers() {
        const summaryContent = document.getElementById('summary-content');
        if (!summaryContent) return;

        // Add chart containers if they don't exist
        if (!document.getElementById('charts-container')) {
            const chartsContainer = document.createElement('div');
            chartsContainer.id = 'charts-container';
            chartsContainer.className = 'charts-container';
            chartsContainer.innerHTML = `
                <div class="chart-section">
                    <h4>Commit Timeline</h4>
                    <div id="timeline-chart" class="chart"></div>
                </div>
                <div class="chart-section">
                    <h4>Top Contributors</h4>
                    <div id="contributors-chart" class="chart"></div>
                </div>
                <div class="chart-section">
                    <h4>File Types</h4>
                    <div id="filetype-chart" class="chart"></div>
                </div>
            `;
            summaryContent.appendChild(chartsContainer);
        }
    }

    /**
     * Shows a section
     * @private
     * @param {string} sectionId - Section ID
     */
    showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    }

    /**
     * Hides a section
     * @private
     * @param {string} sectionId - Section ID
     */
    hideSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    }

    /**
     * Sets analyzing state
     * @private
     * @param {boolean} analyzing - Whether currently analyzing
     */
    setAnalyzing(analyzing) {
        this.isAnalyzing = analyzing;
        
        // Disable/enable buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.disabled = analyzing;
        });
        
        // Update button text
        const analyzeBtn = document.getElementById('analyze-github-repo');
        if (analyzeBtn) {
            analyzeBtn.textContent = analyzing ? 'Analyzing...' : 'Analyze GitHub Repository';
        }
    }

    /**
     * Shows status message
     * @private
     * @param {string} message - Status message
     */
    showStatus(message) {
        this.removeMessages();
        
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message';
        statusDiv.textContent = message;
        
        const repoSection = document.getElementById('repo-selection');
        if (repoSection) {
            repoSection.appendChild(statusDiv);
        }
    }

    /**
     * Hides status message
     * @private
     */
    hideStatus() {
        this.removeMessages();
    }

    /**
     * Shows error message
     * @private
     * @param {string} message - Error message
     */
    showError(message) {
        this.removeMessages();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const repoSection = document.getElementById('repo-selection');
        if (repoSection) {
            repoSection.appendChild(errorDiv);
        }
    }

    /**
     * Removes all status/error messages
     * @private
     */
    removeMessages() {
        const messages = document.querySelectorAll('.status-message, .error-message');
        messages.forEach(msg => msg.remove());
    }

    /**
     * Gets current analysis data
     * @returns {Object} Current data
     */
    getCurrentData() {
        return this.currentData;
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    dashboard.initialize();
    
    // Make dashboard globally available for debugging
    window.dashboard = dashboard;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
} else {
    window.Dashboard = Dashboard;
}
