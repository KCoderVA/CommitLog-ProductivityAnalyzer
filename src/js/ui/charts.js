/**
 * Charts Module - Handles chart rendering and visualization
 * This module creates various charts and visualizations for the dashboard
 * using lightweight JavaScript charting (can be extended with libraries like Chart.js)
 */

class Charts {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#3498db',
            secondary: '#2ecc71',
            tertiary: '#e74c3c',
            quaternary: '#f39c12',
            accent: '#9b59b6',
            gray: '#95a5a6'
        };
    }

    /**
     * Creates a commit timeline chart
     * @param {Object} timelineData - Timeline data from data processor
     */
    createCommitTimelineChart(timelineData) {
        const container = document.getElementById('timeline-chart');
        if (!container || !timelineData.daily) return;

        try {
            // Create a simple bar chart for commit timeline
            const data = timelineData.daily.slice(-30); // Last 30 days
            
            if (data.length === 0) {
                container.innerHTML = '<p class="no-data">No timeline data available</p>';
                return;
            }

            const maxCommits = Math.max(...data.map(d => d.commits));
            const chartHeight = 200;
            
            const chartHTML = `
                <div class="timeline-chart">
                    <div class="chart-bars">
                        ${data.map(day => {
                            const height = maxCommits > 0 ? (day.commits / maxCommits) * chartHeight : 0;
                            return `
                                <div class="chart-bar" style="height: ${height}px" title="${day.date}: ${day.commits} commits">
                                    <div class="bar-value">${day.commits}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="chart-labels">
                        ${data.map(day => `
                            <div class="chart-label">${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            container.innerHTML = chartHTML;
            
        } catch (error) {
            console.error('Error creating timeline chart:', error);
            container.innerHTML = '<p class="chart-error">Error creating timeline chart</p>';
        }
    }

    /**
     * Creates a contributors chart
     * @param {Object} contributorsData - Contributors data from data processor
     */
    createContributorChart(contributorsData) {
        const container = document.getElementById('contributors-chart');
        if (!container || !contributorsData.list) return;

        try {
            const topContributors = contributorsData.list.slice(0, 10);
            
            if (topContributors.length === 0) {
                container.innerHTML = '<p class="no-data">No contributor data available</p>';
                return;
            }

            const maxCommits = Math.max(...topContributors.map(c => c.commits));
            
            const chartHTML = `
                <div class="contributors-chart">
                    ${topContributors.map((contributor, index) => {
                        const width = maxCommits > 0 ? (contributor.commits / maxCommits) * 100 : 0;
                        const color = this.getColorByIndex(index);
                        
                        return `
                            <div class="contributor-bar">
                                <div class="contributor-info">
                                    <span class="contributor-name">${contributor.name}</span>
                                    <span class="contributor-commits">${contributor.commits} commits</span>
                                </div>
                                <div class="contributor-progress">
                                    <div class="progress-bar" style="width: ${width}%; background-color: ${color}"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            container.innerHTML = chartHTML;
            
        } catch (error) {
            console.error('Error creating contributors chart:', error);
            container.innerHTML = '<p class="chart-error">Error creating contributors chart</p>';
        }
    }

    /**
     * Creates a file types chart
     * @param {Object} fileAnalysis - File analysis data from data processor
     */
    createFileTypeChart(fileAnalysis) {
        const container = document.getElementById('filetype-chart');
        if (!container || !fileAnalysis.fileTypeAnalysis) return;

        try {
            const topFileTypes = fileAnalysis.fileTypeAnalysis.slice(0, 8);
            
            if (topFileTypes.length === 0) {
                container.innerHTML = '<p class="no-data">No file type data available</p>';
                return;
            }

            // Create a simple donut chart representation
            const total = topFileTypes.reduce((sum, type) => sum + type.modifications, 0);
            
            const chartHTML = `
                <div class="filetype-chart">
                    <div class="donut-chart">
                        ${this.createDonutChart(topFileTypes, total)}
                    </div>
                    <div class="chart-legend">
                        ${topFileTypes.map((type, index) => {
                            const percentage = total > 0 ? ((type.modifications / total) * 100).toFixed(1) : 0;
                            const color = this.getColorByIndex(index);
                            
                            return `
                                <div class="legend-item">
                                    <div class="legend-color" style="background-color: ${color}"></div>
                                    <span class="legend-label">.${type.extension}</span>
                                    <span class="legend-value">${percentage}%</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            
            container.innerHTML = chartHTML;
            
        } catch (error) {
            console.error('Error creating file type chart:', error);
            container.innerHTML = '<p class="chart-error">Error creating file type chart</p>';
        }
    }

    /**
     * Creates a simple donut chart using CSS
     * @private
     * @param {Array} data - Data array
     * @param {number} total - Total value
     * @returns {string} HTML for donut chart
     */
    createDonutChart(data, total) {
        if (total === 0) return '<div class="no-data">No data</div>';
        
        let cumulativePercentage = 0;
        const segments = data.map((item, index) => {
            const percentage = (item.modifications / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            cumulativePercentage += percentage;
            
            const color = this.getColorByIndex(index);
            
            // Create SVG path for the segment
            return {
                percentage,
                startAngle,
                endAngle,
                color,
                label: item.extension
            };
        });
        
        // For simplicity, create a stacked horizontal bar representation
        return `
            <div class="stacked-bar">
                ${segments.map(segment => `
                    <div class="segment" 
                         style="width: ${segment.percentage}%; background-color: ${segment.color}"
                         title=".${segment.label}: ${segment.percentage.toFixed(1)}%">
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Creates a productivity trend chart
     * @param {Object} timelineData - Timeline data
     */
    createProductivityTrendChart(timelineData) {
        const container = document.getElementById('productivity-trend-chart');
        if (!container || !timelineData.daily) return;

        try {
            const data = timelineData.daily.slice(-14); // Last 14 days
            
            if (data.length === 0) {
                container.innerHTML = '<p class="no-data">No productivity data available</p>';
                return;
            }

            const maxProductivity = Math.max(...data.map(d => (d.additions + d.deletions)));
            const chartHeight = 150;
            
            const chartHTML = `
                <div class="productivity-chart">
                    <div class="chart-area">
                        ${data.map((day, index) => {
                            const productivity = day.additions + day.deletions;
                            const height = maxProductivity > 0 ? (productivity / maxProductivity) * chartHeight : 0;
                            const x = (index / (data.length - 1)) * 100;
                            
                            return `
                                <div class="chart-point" 
                                     style="left: ${x}%; bottom: ${height}px"
                                     title="${day.date}: ${productivity} changes">
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="chart-labels">
                        ${data.map(day => `
                            <div class="chart-label">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            container.innerHTML = chartHTML;
            
        } catch (error) {
            console.error('Error creating productivity trend chart:', error);
            container.innerHTML = '<p class="chart-error">Error creating productivity trend chart</p>';
        }
    }

    /**
     * Creates a commit size distribution chart
     * @param {Array} commits - Array of commits
     */
    createCommitSizeChart(commits) {
        const container = document.getElementById('commit-size-chart');
        if (!container || !commits) return;

        try {
            // Categorize commits by size
            const sizes = {
                'Small (1-10)': 0,
                'Medium (11-50)': 0,
                'Large (51-200)': 0,
                'XLarge (200+)': 0
            };

            commits.forEach(commit => {
                const size = (commit.stats?.additions || 0) + (commit.stats?.deletions || 0);
                
                if (size <= 10) sizes['Small (1-10)']++;
                else if (size <= 50) sizes['Medium (11-50)']++;
                else if (size <= 200) sizes['Large (51-200)']++;
                else sizes['XLarge (200+)']++;
            });

            const total = Object.values(sizes).reduce((sum, count) => sum + count, 0);
            
            if (total === 0) {
                container.innerHTML = '<p class="no-data">No commit size data available</p>';
                return;
            }

            const chartHTML = `
                <div class="commit-size-chart">
                    ${Object.entries(sizes).map(([label, count], index) => {
                        const percentage = (count / total) * 100;
                        const color = this.getColorByIndex(index);
                        
                        return `
                            <div class="size-category">
                                <div class="category-label">${label}</div>
                                <div class="category-bar">
                                    <div class="bar-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                                </div>
                                <div class="category-value">${count} (${percentage.toFixed(1)}%)</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            container.innerHTML = chartHTML;
            
        } catch (error) {
            console.error('Error creating commit size chart:', error);
            container.innerHTML = '<p class="chart-error">Error creating commit size chart</p>';
        }
    }

    /**
     * Gets color by index for consistent coloring
     * @private
     * @param {number} index - Color index
     * @returns {string} Color value
     */
    getColorByIndex(index) {
        const colorArray = Object.values(this.colors);
        return colorArray[index % colorArray.length];
    }

    /**
     * Clears all charts
     */
    clearCharts() {
        const chartContainers = [
            'timeline-chart',
            'contributors-chart',
            'filetype-chart',
            'productivity-trend-chart',
            'commit-size-chart'
        ];

        chartContainers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
            }
        });

        this.charts = {};
    }

    /**
     * Updates chart theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    updateTheme(theme) {
        if (theme === 'dark') {
            this.colors = {
                primary: '#5dade2',
                secondary: '#58d68d',
                tertiary: '#ec7063',
                quaternary: '#f7dc6f',
                accent: '#bb8fce',
                gray: '#aab7b8'
            };
        } else {
            this.colors = {
                primary: '#3498db',
                secondary: '#2ecc71',
                tertiary: '#e74c3c',
                quaternary: '#f39c12',
                accent: '#9b59b6',
                gray: '#95a5a6'
            };
        }
    }

    /**
     * Exports chart data as JSON
     * @returns {Object} Chart data
     */
    exportData() {
        return {
            charts: this.charts,
            timestamp: new Date().toISOString()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Charts;
} else {
    window.Charts = Charts;
}
