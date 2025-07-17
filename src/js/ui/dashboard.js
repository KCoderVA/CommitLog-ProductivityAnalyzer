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
        // Initialize properties without creating instances yet
        this.gitAnalyzer = null;
        this.githubAPI = null;
        this.dataProcessor = null;
        this.charts = null;
        this.currentData = null;
        this.isAnalyzing = false;
    }

    /**
     * Initializes the dashboard
     */
    initialize() {
        console.log('Initializing Dashboard...');
        
        // Initialize dependencies now that all scripts should be loaded
        try {
            this.gitAnalyzer = window.GitAnalyzer ? new GitAnalyzer() : null;
            this.githubAPI = window.GitHubAPI ? new GitHubAPI() : null;
            this.dataProcessor = window.DataProcessor ? new DataProcessor() : null;
            this.charts = window.Charts ? new Charts() : null;
            
            console.log('Dashboard dependencies initialized:', {
                gitAnalyzer: !!this.gitAnalyzer,
                githubAPI: !!this.githubAPI,
                dataProcessor: !!this.dataProcessor,
                charts: !!this.charts,
                fileHandler: !!window.FileHandler
            });
        } catch (error) {
            console.error('Error initializing dashboard dependencies:', error);
        }
        
        this.setupEventListeners();
        this.setupUI();
        this.loadConfiguration();
    }

    /**
     * Sets up event listeners for UI interactions
     * @private
     */
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Local repository selection (offline version only)
        const selectLocalBtn = document.getElementById('select-local-repo');
        console.log('Select local button found:', !!selectLocalBtn);
        console.log('Current environment:', window.APP_ENVIRONMENT);
        console.log('FileHandler available:', !!window.FileHandler);
        
        if (selectLocalBtn && window.APP_ENVIRONMENT === 'offline') {
            console.log('Adding click listener to local repository button');
            selectLocalBtn.addEventListener('click', () => {
                console.log('Local repository button clicked!');
                this.selectLocalRepository();
            });
        } else if (selectLocalBtn) {
            console.log('Local button found but environment is not offline:', window.APP_ENVIRONMENT);
        } else {
            console.log('Local repository button not found in DOM');
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
        console.log('selectLocalRepository called');
        console.log('Current environment:', window.APP_ENVIRONMENT);
        console.log('FileHandler available:', !!window.FileHandler);
        
        // Check if we're in offline environment and have the necessary components
        if (window.APP_ENVIRONMENT !== 'offline') {
            const message = `Local repository analysis is only available in the offline version. Current environment: ${window.APP_ENVIRONMENT}`;
            console.error(message);
            this.showError(message);
            return;
        }

        if (!window.FileHandler) {
            const message = 'File handler not available. Please ensure you are using the offline version.';
            console.error(message);
            this.showError(message);
            return;
        }

        try {
            this.setAnalyzing(true);
            
            // Initialize file handler if not already done
            const fileHandler = new FileHandler();
            console.log('FileHandler initialized:', fileHandler);
            
            // Check browser capabilities
            console.log('showDirectoryPicker available:', 'showDirectoryPicker' in window);
            console.log('webkitdirectory supported:', 'webkitdirectory' in document.createElement('input'));
            
            this.showStatus('Opening file picker...');
            console.log('Opening file picker for local repository...');
            
            // Use the file handler to select repository
            const repositorySource = await fileHandler.selectGitRepository();
            console.log('Repository source selected:', repositorySource);
            
            if (!repositorySource) {
                // User cancelled selection
                console.log('User cancelled repository selection');
                this.hideStatus();
                return;
            }

            this.showStatus('Reading repository data...');
            const repositoryData = await fileHandler.readGitRepository(repositorySource);
            console.log('Repository data loaded:', repositoryData);
            
            if (!repositoryData.commits || repositoryData.commits.length === 0) {
                this.showError('No commits found in the selected repository.');
                return;
            }

            // Process the data using GitAnalyzer if available
            let processedData;
            if (this.gitAnalyzer) {
                // Pass the entire repository data object to GitAnalyzer
                const analysisResult = await this.gitAnalyzer.analyzeRepository(repositoryData);
                processedData = this.dataProcessor ? this.dataProcessor.processCommitData(analysisResult.commits, repositoryData) : repositoryData;
            } else if (this.dataProcessor) {
                // Fallback to direct processing
                processedData = this.dataProcessor.processCommitData(repositoryData.commits, repositoryData);
            } else {
                // Minimal processing if DataProcessor not available
                processedData = {
                    repository: repositoryData,
                    commits: repositoryData.commits || [],
                    summary: {
                        totalCommits: (repositoryData.commits || []).length,
                        contributors: 1,
                        totalFiles: 0,
                        totalAdditions: 0,
                        totalDeletions: 0,
                        netChanges: 0,
                        averageCommitSize: 0,
                        productivity: 'N/A',
                        dateRange: { startFormatted: 'N/A', endFormatted: 'N/A', days: 0 },
                        commitFrequency: { daily: 0 }
                    }
                };
            }

            this.currentData = processedData;
            this.displayResults(processedData);
            this.hideStatus();
            console.log('Local repository analysis completed successfully');
            
        } catch (error) {
            console.error('Error selecting local repository:', error);
            console.error('Error stack:', error.stack);
            
            // Provide specific error messages based on the error type
            let errorMessage = `Failed to analyze repository: ${error.message}`;
            
            if (error.name === 'AbortError') {
                errorMessage = 'Repository selection was cancelled by user.';
                console.log('User cancelled repository selection');
            } else if (error.message.includes('not a Git repository')) {
                errorMessage = 'The selected directory is not a Git repository. Please select a directory that contains a .git folder.';
            } else if (error.message.includes('Permission denied') || error.message.includes('access')) {
                errorMessage = 'Permission denied. Please ensure you have read access to the selected directory.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Your browser does not support local file access. Please try using a modern browser like Chrome, Edge, or Firefox.';
            }
            
            this.showError(errorMessage);
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
            
            if (!this.githubAPI) {
                throw new Error('GitHub API not available. Please refresh the page.');
            }
            
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
            const processedData = this.dataProcessor ? 
                this.dataProcessor.processCommitData(commits, repository) : 
                { repository, commits, summary: { totalCommits: commits.length } };
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
        
        // Store original data for filtering
        this.originalData = data;
        this.currentData = data;
        
        // Collapse repository selection section
        this.collapseRepositorySelection(data.repository);
        
        // Show date filter section
        this.showSection('date-filter-section');
        this.setupDateFilters();
        
        // Show the analysis sections
        this.showSection('summary-analysis');
        this.showSection('detailed-history');
        
        // Display results with current filter (initially all data)
        this.displayFilteredResults(data);
        
        // Scroll to date filter section
        document.getElementById('date-filter-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    /**
     * Displays filtered results based on current date filter
     * @param {Object} data - Filtered repository data
     */
    displayFilteredResults(data) {
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

        // Calculate date-filtered metrics (initially same as all-time)
        const filteredMetrics = this.dataProcessor ? 
            this.dataProcessor.calculateDateFilteredMetrics(this.currentData?.commits || []) :
            {
                filteredCommits: summary.totalCommits,
                filteredAdditions: summary.totalAdditions,
                filteredDeletions: summary.totalDeletions,
                filteredProductivity: summary.productivity
            };

        summaryContent.innerHTML = `
            <div class="repository-info">
                <h3>${repository.name || 'CommitLog_ProductivityDashboard'}</h3>
                ${repository.description ? `<p class="repo-description">${repository.description}</p>` : ''}
                ${repository.url ? `<p><a href="${repository.url}" target="_blank" class="repo-link">View on GitHub</a></p>` : ''}
            </div>
            
            <!-- First Row: Repository-wide Metrics (All Time) -->
            <div class="metrics-section">
                <h4>📊 Repository Overview (All Time)</h4>
                <div class="metrics-grid">
                    <div class="metric-card repository-metric">
                        <div class="metric-value">${summary.totalCommits.toLocaleString()}</div>
                        <div class="metric-label">Total Commits</div>
                    </div>
                    
                    <div class="metric-card repository-metric">
                        <div class="metric-value">${summary.repositorySize.value}${summary.repositorySize.unit}</div>
                        <div class="metric-label">Repository Size</div>
                    </div>
                    
                    <div class="metric-card repository-metric">
                        <div class="metric-value">${summary.totalFiles.toLocaleString()}</div>
                        <div class="metric-label">Total Files/Objects</div>
                    </div>
                    
                    <div class="metric-card repository-metric">
                        <div class="metric-value">${summary.totalLinesOfCode.toLocaleString()}</div>
                        <div class="metric-label">Total Lines of Code</div>
                    </div>
                </div>
            </div>

            <!-- Second Row: Date-filtered Metrics -->
            <div class="metrics-section">
                <h4>📅 Filtered Period Analysis</h4>
                <div class="metrics-grid">
                    <div class="metric-card filtered-metric">
                        <div class="metric-value" id="filtered-commits">${filteredMetrics.filteredCommits.toLocaleString()}</div>
                        <div class="metric-label">Commits in Period</div>
                    </div>
                    
                    <div class="metric-card filtered-metric">
                        <div class="metric-value" id="filtered-additions">+${filteredMetrics.filteredAdditions.toLocaleString()}</div>
                        <div class="metric-label">Lines Added</div>
                    </div>
                    
                    <div class="metric-card filtered-metric">
                        <div class="metric-value" id="filtered-deletions">-${filteredMetrics.filteredDeletions.toLocaleString()}</div>
                        <div class="metric-label">Lines Deleted</div>
                    </div>
                    
                    <div class="metric-card filtered-metric">
                        <div class="metric-value" id="filtered-productivity">${filteredMetrics.filteredProductivity}</div>
                        <div class="metric-label">Productivity Score</div>
                    </div>
                </div>
            </div>
            
            <div class="date-range">
                <h4>Analysis Period</h4>
                <p id="period-display">${summary.dateRange.startFormatted} - ${summary.dateRange.endFormatted}</p>
                <p>${summary.dateRange.days} days | ${summary.contributors} contributor(s) | Avg ${summary.commitFrequency.daily} commits/day</p>
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

        const commitsHtml = commits.slice(0, 50).map((commit, index) => `
            <div class="commit-item" data-commit-index="${index}">
                <div class="commit-header" onclick="this.parentElement.classList.toggle('expanded')">
                    <span class="commit-sha">${commit.shortSha}</span>
                    <span class="commit-author">${commit.author.name}</span>
                    <span class="commit-date">${commit.relativeDate}</span>
                    <span class="expand-icon">▶</span>
                </div>
                <div class="commit-message">${commit.messagePreview}</div>
                ${commit.stats ? `
                    <div class="commit-stats">
                        <span class="additions">+${commit.stats.additions || 0}</span>
                        <span class="deletions">-${commit.stats.deletions || 0}</span>
                        <span class="files">${commit.stats.files?.length || 0} files</span>
                    </div>
                ` : ''}
                
                <!-- Expandable commit details -->
                <div class="commit-details-expanded">
                    <div class="commit-full-message">
                        <h5>Full Commit Message:</h5>
                        <pre>${commit.message || commit.messagePreview}</pre>
                    </div>
                    
                    <div class="commit-metadata">
                        <div class="metadata-row">
                            <strong>SHA:</strong> ${commit.sha || commit.shortSha}
                        </div>
                        <div class="metadata-row">
                            <strong>Author:</strong> ${commit.author.name} &lt;${commit.author.email || 'unknown'}&gt;
                        </div>
                        <div class="metadata-row">
                            <strong>Date:</strong> ${commit.absoluteDate || commit.relativeDate}
                        </div>
                        ${commit.stats ? `
                            <div class="metadata-row">
                                <strong>Changes:</strong> +${commit.stats.additions || 0} additions, -${commit.stats.deletions || 0} deletions
                            </div>
                        ` : ''}
                    </div>
                    
                    ${commit.stats?.files ? `
                        <div class="commit-files">
                            <h5>Modified Files:</h5>
                            <ul>
                                ${commit.stats.files.slice(0, 10).map(file => `
                                    <li>${typeof file === 'string' ? file : (file.filename || file)}</li>
                                `).join('')}
                                ${commit.stats.files.length > 10 ? `<li><em>... and ${commit.stats.files.length - 10} more files</em></li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        detailsContent.innerHTML = `
            <div class="commits-header">
                <h4>Recent Commits (${Math.min(commits.length, 50)} of ${commits.length})</h4>
                <p class="commits-help">Click on any commit to view full details</p>
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
            if (!this.charts) {
                console.warn('Charts module not available, skipping chart creation');
                return;
            }
            
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
     * Updates the filtered metrics display based on date range
     * @param {Date} startDate - Start date for filtering
     * @param {Date} endDate - End date for filtering
     */
    updateFilteredMetrics(startDate = null, endDate = null) {
        if (!this.currentData || !this.dataProcessor) return;

        const filteredMetrics = this.dataProcessor.calculateDateFilteredMetrics(
            this.currentData.commits || [], 
            startDate, 
            endDate
        );

        // Update the filtered metrics display
        const filteredCommitsEl = document.getElementById('filtered-commits');
        const filteredAdditionsEl = document.getElementById('filtered-additions');
        const filteredDeletionsEl = document.getElementById('filtered-deletions');
        const filteredProductivityEl = document.getElementById('filtered-productivity');
        const periodDisplayEl = document.getElementById('period-display');

        if (filteredCommitsEl) filteredCommitsEl.textContent = filteredMetrics.filteredCommits.toLocaleString();
        if (filteredAdditionsEl) filteredAdditionsEl.textContent = `+${filteredMetrics.filteredAdditions.toLocaleString()}`;
        if (filteredDeletionsEl) filteredDeletionsEl.textContent = `-${filteredMetrics.filteredDeletions.toLocaleString()}`;
        if (filteredProductivityEl) filteredProductivityEl.textContent = filteredMetrics.filteredProductivity;

        // Update period display
        if (periodDisplayEl && startDate && endDate) {
            const startFormatted = startDate.toLocaleDateString();
            const endFormatted = endDate.toLocaleDateString();
            periodDisplayEl.textContent = `${startFormatted} - ${endFormatted} (Filtered)`;
        } else if (periodDisplayEl && this.currentData.summary) {
            periodDisplayEl.textContent = `${this.currentData.summary.dateRange.startFormatted} - ${this.currentData.summary.dateRange.endFormatted} (All Time)`;
        }

        // Update filter status
        const filterStatusEl = document.getElementById('filter-status-text');
        if (filterStatusEl) {
            if (startDate && endDate) {
                const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                filterStatusEl.textContent = `Showing ${filteredMetrics.filteredCommits} commits from ${days} day period`;
            } else {
                filterStatusEl.textContent = 'Showing all commits';
            }
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
     * Collapses the repository selection section and shows summary
     * @private
     * @param {Object} repository - Repository information
     */
    collapseRepositorySelection(repository) {
        const repoSection = document.getElementById('repo-selection');
        if (repoSection) {
            repoSection.classList.add('collapsed');
            
            // Add summary text
            const sectionHeader = repoSection.querySelector('.section-header');
            if (sectionHeader && !sectionHeader.querySelector('.section-summary')) {
                const summary = document.createElement('div');
                summary.className = 'section-summary';
                summary.textContent = `Selected: ${repository.name || 'Repository'} ${repository.url ? '(' + repository.url + ')' : ''}`;
                sectionHeader.appendChild(summary);
            }
        }
    }

    /**
     * Sets up date filter event listeners and initializes date inputs
     * @private
     */
    setupDateFilters() {
        // Set up quick filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickFilter(e.target.dataset.filter));
        });

        // Set up custom date range
        const applyButton = document.getElementById('apply-custom-filter');
        if (applyButton) {
            applyButton.addEventListener('click', () => this.handleCustomDateFilter());
        }

        // Set up reset button
        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetFilters());
        }

        // Initialize date inputs with repository date range
        this.initializeDateInputs();
    }

    /**
     * Initializes date inputs with repository's commit date range
     * @private
     */
    initializeDateInputs() {
        if (!this.originalData || !this.originalData.commits || this.originalData.commits.length === 0) {
            return;
        }

        const commits = this.originalData.commits;
        const dates = commits.map(commit => new Date(commit.date || commit.timestamp)).filter(date => !isNaN(date));
        
        if (dates.length === 0) return;

        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        const startInput = document.getElementById('start-date');
        const endInput = document.getElementById('end-date');

        if (startInput && endInput) {
            startInput.value = minDate.toISOString().split('T')[0];
            startInput.min = minDate.toISOString().split('T')[0];
            startInput.max = maxDate.toISOString().split('T')[0];
            
            endInput.value = maxDate.toISOString().split('T')[0];
            endInput.min = minDate.toISOString().split('T')[0];
            endInput.max = maxDate.toISOString().split('T')[0];
        }
    }

    /**
     * Handles quick filter selection
     * @private
     * @param {string} filterType - Filter type (all, 7days, 30days, etc.)
     */
    handleQuickFilter(filterType) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');

        // Calculate date range
        const now = new Date();
        let startDate = null;
        
        switch (filterType) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90days':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            case 'all':
            default:
                startDate = null;
                break;
        }

        this.applyDateFilter(startDate, null);
    }

    /**
     * Handles custom date range filter
     * @private
     */
    handleCustomDateFilter() {
        const startInput = document.getElementById('start-date');
        const endInput = document.getElementById('end-date');

        if (!startInput.value || !endInput.value) {
            alert('Please select both start and end dates');
            return;
        }

        const startDate = new Date(startInput.value);
        const endDate = new Date(endInput.value + 'T23:59:59'); // Include full end day

        if (startDate > endDate) {
            alert('Start date must be before end date');
            return;
        }

        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

        this.applyDateFilter(startDate, endDate);
    }

    /**
     * Applies date filter to commit data
     * @private
     * @param {Date|null} startDate - Start date filter
     * @param {Date|null} endDate - End date filter
     */
    applyDateFilter(startDate, endDate) {
        if (!this.originalData) return;

        // Update the filtered metrics display without changing the original data
        this.updateFilteredMetrics(startDate, endDate);

        // Filter commits for detailed history display
        let filteredCommits = [...this.originalData.commits];
        if (startDate || endDate) {
            filteredCommits = filteredCommits.filter(commit => {
                const commitDate = new Date(commit.date || commit.timestamp);
                if (isNaN(commitDate)) return false;

                if (startDate && commitDate < startDate) return false;
                if (endDate && commitDate > endDate) return false;
                return true;
            });
        }

        // Update detailed history with filtered commits
        if (this.dataProcessor) {
            const formattedCommits = this.dataProcessor.formatCommitsForDisplay 
                ? this.dataProcessor.formatCommitsForDisplay(filteredCommits)
                : filteredCommits;
            this.displayDetailedHistory(formattedCommits);
        } else {
            this.displayDetailedHistory(filteredCommits);
        }

        // Update status
        this.updateFilterStatus(startDate, endDate, filteredCommits.length);

        // Show reset button if filters are active
        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.style.display = (startDate || endDate) ? 'inline-block' : 'none';
        }
    }

    /**
     * Updates filter status display
     * @private
     * @param {Date|null} startDate - Start date
     * @param {Date|null} endDate - End date  
     * @param {number} commitCount - Number of commits after filtering
     */
    updateFilterStatus(startDate, endDate, commitCount) {
        const statusText = document.getElementById('filter-status-text');
        const resetButton = document.getElementById('reset-filters');

        if (!statusText) return;

        let statusMessage;
        if (!startDate && !endDate) {
            statusMessage = `Showing all ${commitCount.toLocaleString()} commits`;
            resetButton.style.display = 'none';
        } else {
            const startStr = startDate ? startDate.toLocaleDateString() : 'beginning';
            const endStr = endDate ? endDate.toLocaleDateString() : 'now';
            statusMessage = `Showing ${commitCount.toLocaleString()} commits from ${startStr} to ${endStr}`;
            resetButton.style.display = 'inline-block';
        }

        statusText.textContent = statusMessage;
    }

    /**
     * Resets all filters to show all commits
     * @private
     */
    resetFilters() {
        // Reset active button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');

        // Reset custom date inputs
        this.initializeDateInputs();

        // Apply no filter (show all)
        this.applyDateFilter(null, null);
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

// Manual initialization function - called after all scripts are loaded
window.initializeDashboard = function() {
    if (window.dashboardInstance) {
        console.warn('Dashboard already initialized');
        return window.dashboardInstance;
    }
    
    console.log('Initializing Dashboard after all scripts loaded...');
    const dashboard = new Dashboard();
    dashboard.initialize();
    
    // Make dashboard globally available for debugging
    window.dashboard = dashboard;
    window.dashboardInstance = dashboard;
    
    return dashboard;
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
} else {
    window.Dashboard = Dashboard;
}
