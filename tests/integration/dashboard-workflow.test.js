/**
 * Integration Tests for Dashboard Functionality
 * Tests the overall dashboard workflow and component interactions
 */

// Mock GitHub API responses
const mockGitHubRepository = {
    name: 'test-repo',
    full_name: 'testuser/test-repo',
    description: 'A test repository for integration testing',
    html_url: 'https://github.com/testuser/test-repo',
    default_branch: 'main',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    language: 'JavaScript',
    size: 1024,
    stargazers_count: 10,
    forks_count: 2
};

const mockGitHubCommits = [
    {
        sha: 'commit1hash',
        commit: {
            message: 'Initial repository setup',
            author: {
                name: 'Test User',
                email: 'test@example.com',
                date: '2025-01-10T10:00:00Z'
            }
        },
        author: {
            avatar_url: 'https://github.com/images/test-avatar.png'
        },
        html_url: 'https://github.com/testuser/test-repo/commit/commit1hash',
        stats: {
            additions: 150,
            deletions: 0,
            total: 150
        },
        files: [
            {
                filename: 'README.md',
                status: 'added',
                additions: 50,
                deletions: 0,
                changes: 50
            },
            {
                filename: 'package.json',
                status: 'added',
                additions: 30,
                deletions: 0,
                changes: 30
            },
            {
                filename: 'src/index.js',
                status: 'added',
                additions: 70,
                deletions: 0,
                changes: 70
            }
        ]
    },
    {
        sha: 'commit2hash',
        commit: {
            message: 'Add authentication module\n\nImplemented user login and logout functionality',
            author: {
                name: 'Test User',
                email: 'test@example.com',
                date: '2025-01-12T14:30:00Z'
            }
        },
        author: {
            avatar_url: 'https://github.com/images/test-avatar.png'
        },
        html_url: 'https://github.com/testuser/test-repo/commit/commit2hash',
        stats: {
            additions: 120,
            deletions: 15,
            total: 135
        },
        files: [
            {
                filename: 'src/auth.js',
                status: 'added',
                additions: 100,
                deletions: 0,
                changes: 100
            },
            {
                filename: 'src/index.js',
                status: 'modified',
                additions: 20,
                deletions: 15,
                changes: 35
            }
        ]
    }
];

// Mock successful API responses
function mockFetch(url) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let data;
            
            if (url.includes('/repos/testuser/test-repo') && !url.includes('/commits')) {
                data = mockGitHubRepository;
            } else if (url.includes('/commits')) {
                if (url.includes('/commits/commit1hash')) {
                    data = mockGitHubCommits[0];
                } else if (url.includes('/commits/commit2hash')) {
                    data = mockGitHubCommits[1];
                } else {
                    data = mockGitHubCommits;
                }
            } else if (url.includes('/rate_limit')) {
                data = {
                    rate: {
                        remaining: 5000,
                        limit: 5000,
                        reset: Math.floor(Date.now() / 1000) + 3600
                    }
                };
            }
            
            resolve({
                ok: true,
                status: 200,
                headers: new Map([
                    ['x-ratelimit-remaining', '4999'],
                    ['x-ratelimit-reset', String(Math.floor(Date.now() / 1000) + 3600)]
                ]),
                json: () => Promise.resolve(data)
            });
        }, 100); // Simulate network delay
    });
}

// Integration test for complete GitHub repository analysis workflow
async function testGitHubAnalysisWorkflow() {
    console.log('Testing GitHub Analysis Workflow...');
    
    // Mock fetch for this test
    const originalFetch = window.fetch;
    window.fetch = mockFetch;
    
    try {
        // Initialize components
        const githubAPI = new GitHubAPI();
        const dataProcessor = new DataProcessor();
        
        // Test repository parsing
        const repoInfo = githubAPI.parseRepoURL('https://github.com/testuser/test-repo');
        if (repoInfo.owner !== 'testuser' || repoInfo.repo !== 'test-repo') {
            console.error('❌ Repository URL parsing failed');
            return false;
        }
        
        // Test repository fetching
        const repository = await githubAPI.fetchRepository('testuser', 'test-repo');
        if (!repository || repository.name !== 'test-repo') {
            console.error('❌ Repository fetching failed');
            return false;
        }
        
        // Test commits fetching
        const commits = await githubAPI.getCommits('testuser', 'test-repo');
        if (!commits || commits.length !== 2) {
            console.error('❌ Commits fetching failed, expected 2 commits, got:', commits?.length);
            return false;
        }
        
        // Test detailed commit fetching
        const detailedCommit = await githubAPI.getCommitDetails('testuser', 'test-repo', 'commit1hash');
        if (!detailedCommit || !detailedCommit.stats || detailedCommit.stats.additions !== 150) {
            console.error('❌ Detailed commit fetching failed');
            return false;
        }
        
        // Test data processing
        const processedData = dataProcessor.processCommitData(
            [detailedCommit, mockGitHubCommits[1]], 
            repository
        );
        
        if (!processedData.summary || processedData.summary.totalCommits !== 2) {
            console.error('❌ Data processing failed');
            return false;
        }
        
        console.log('✅ GitHub Analysis Workflow test passed!');
        return true;
        
    } catch (error) {
        console.error('❌ GitHub Analysis Workflow test failed:', error);
        return false;
    } finally {
        // Restore original fetch
        window.fetch = originalFetch;
    }
}

// Test dashboard UI integration
async function testDashboardUIIntegration() {
    console.log('Testing Dashboard UI Integration...');
    
    // Create mock DOM elements
    const mockDocument = {
        getElementById: (id) => {
            const mockElement = {
                addEventListener: () => {},
                style: {},
                innerHTML: '',
                textContent: '',
                value: 'testuser/test-repo',
                disabled: false,
                appendChild: () => {},
                scrollIntoView: () => {}
            };
            return mockElement;
        },
        addEventListener: () => {},
        readyState: 'complete',
        createElement: () => ({
            innerHTML: '',
            className: '',
            style: {},
            appendChild: () => {},
            remove: () => {}
        }),
        querySelectorAll: () => [],
        documentElement: {
            setAttribute: () => {},
            style: { setProperty: () => {} },
            classList: { add: () => {} }
        },
        head: { appendChild: () => {} },
        body: { appendChild: () => {}, removeChild: () => {} }
    };
    
    // Mock the global document temporarily
    const originalDocument = global.document || window.document;
    if (typeof global !== 'undefined') {
        global.document = mockDocument;
    } else {
        window.document = mockDocument;
    }
    
    try {
        // Test dashboard initialization
        const dashboard = new Dashboard();
        dashboard.initialize();
        
        // Test setting analyzing state
        dashboard.setAnalyzing(true);
        if (!dashboard.isAnalyzing) {
            console.error('❌ Dashboard analyzing state not set correctly');
            return false;
        }
        
        // Test data display
        const mockData = {
            repository: mockGitHubRepository,
            summary: {
                totalCommits: 2,
                totalAdditions: 270,
                totalDeletions: 15,
                contributors: 1,
                totalFiles: 3,
                netChanges: 255,
                averageCommitSize: 142,
                productivity: 8.5,
                dateRange: {
                    start: '2025-01-10',
                    end: '2025-01-12',
                    startFormatted: '1/10/2025',
                    endFormatted: '1/12/2025',
                    days: 3
                },
                commitFrequency: {
                    daily: '0.67',
                    weekly: '4.67',
                    monthly: '20.00'
                }
            },
            commits: mockGitHubCommits.map(commit => ({
                ...commit,
                shortSha: commit.sha.substring(0, 7),
                formattedDate: new Date(commit.commit.author.date).toLocaleString(),
                relativeDate: '3 days ago',
                messagePreview: commit.commit.message.split('\n')[0]
            }))
        };
        
        dashboard.displayResults(mockData);
        
        console.log('✅ Dashboard UI Integration test passed!');
        return true;
        
    } catch (error) {
        console.error('❌ Dashboard UI Integration test failed:', error);
        return false;
    } finally {
        // Restore original document
        if (typeof global !== 'undefined') {
            global.document = originalDocument;
        } else {
            window.document = originalDocument;
        }
    }
}

// Test error handling in API calls
async function testErrorHandling() {
    console.log('Testing Error Handling...');
    
    // Mock fetch that returns errors
    const errorFetch = (url) => {
        return Promise.resolve({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            json: () => Promise.resolve({ message: 'Not Found' })
        });
    };
    
    const originalFetch = window.fetch;
    window.fetch = errorFetch;
    
    try {
        const githubAPI = new GitHubAPI();
        
        // Test repository not found
        try {
            await githubAPI.fetchRepository('nonexistent', 'repo');
            console.error('❌ Should have thrown an error for non-existent repository');
            return false;
        } catch (error) {
            if (!error.message.includes('GitHub API error')) {
                console.error('❌ Wrong error message:', error.message);
                return false;
            }
        }
        
        // Test invalid URL parsing
        try {
            githubAPI.parseRepoURL('invalid-url');
            console.error('❌ Should have thrown an error for invalid URL');
            return false;
        } catch (error) {
            if (!error.message.includes('Invalid GitHub repository URL')) {
                console.error('❌ Wrong error message for invalid URL:', error.message);
                return false;
            }
        }
        
        console.log('✅ Error Handling test passed!');
        return true;
        
    } catch (error) {
        console.error('❌ Error Handling test failed:', error);
        return false;
    } finally {
        window.fetch = originalFetch;
    }
}

// Test configuration loading and application
function testConfigurationIntegration() {
    console.log('Testing Configuration Integration...');
    
    try {
        // Test online configuration
        if (typeof OnlineConfig !== 'undefined') {
            const rateLimitConfig = getOnlineConfigValue('github.rateLimit.requestsPerHour');
            if (rateLimitConfig !== 60) {
                console.error('❌ Online config value retrieval failed');
                return false;
            }
            
            // Test setting config value
            setOnlineConfigValue('ui.theme', 'dark');
            const themeValue = getOnlineConfigValue('ui.theme');
            if (themeValue !== 'dark') {
                console.error('❌ Online config value setting failed');
                return false;
            }
        }
        
        // Test offline configuration
        if (typeof OfflineConfig !== 'undefined') {
            const maxFileSize = getOfflineConfigValue('fileHandler.maxFileSize');
            if (maxFileSize !== 50 * 1024 * 1024) {
                console.error('❌ Offline config value retrieval failed');
                return false;
            }
        }
        
        console.log('✅ Configuration Integration test passed!');
        return true;
        
    } catch (error) {
        console.error('❌ Configuration Integration test failed:', error);
        return false;
    }
}

// Test charts integration
function testChartsIntegration() {
    console.log('Testing Charts Integration...');
    
    try {
        const charts = new Charts();
        
        // Mock DOM elements for charts
        const mockChartContainer = {
            innerHTML: '',
            appendChild: () => {}
        };
        
        global.document = global.document || {};
        global.document.getElementById = () => mockChartContainer;
        
        // Test timeline chart creation
        const timelineData = {
            daily: [
                { date: '2025-01-10', commits: 1, additions: 150, deletions: 0 },
                { date: '2025-01-12', commits: 1, additions: 120, deletions: 15 }
            ]
        };
        
        charts.createCommitTimelineChart(timelineData);
        
        // Test contributors chart creation
        const contributorsData = {
            list: [
                { name: 'Test User', commits: 2, additions: 270, deletions: 15 }
            ]
        };
        
        charts.createContributorChart(contributorsData);
        
        // Test file types chart creation
        const fileAnalysisData = {
            fileTypeAnalysis: [
                { extension: 'js', modifications: 2, files: 2 },
                { extension: 'md', modifications: 1, files: 1 }
            ]
        };
        
        charts.createFileTypeChart(fileAnalysisData);
        
        console.log('✅ Charts Integration test passed!');
        return true;
        
    } catch (error) {
        console.error('❌ Charts Integration test failed:', error);
        return false;
    }
}

// Run all integration tests
async function runAllIntegrationTests() {
    console.log('=== Integration Test Suite ===');
    
    const tests = [
        testGitHubAnalysisWorkflow,
        testDashboardUIIntegration,
        testErrorHandling,
        testConfigurationIntegration,
        testChartsIntegration
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test();
            if (result) {
                passedTests++;
            }
        } catch (error) {
            console.error('❌ Test threw an error:', error);
        }
    }
    
    console.log(`\n=== Integration Test Results ===`);
    console.log(`Passed: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All integration tests passed!');
        return true;
    } else {
        console.log('❌ Some integration tests failed');
        return false;
    }
}

// Export for use in test runners
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllIntegrationTests,
        testGitHubAnalysisWorkflow,
        testDashboardUIIntegration,
        testErrorHandling,
        testConfigurationIntegration,
        testChartsIntegration,
        mockGitHubRepository,
        mockGitHubCommits
    };
}

// Auto-run tests if in browser and all dependencies are available
if (typeof window !== 'undefined' && 
    window.Dashboard && 
    window.GitHubAPI && 
    window.DataProcessor && 
    window.Charts) {
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllIntegrationTests);
    } else {
        runAllIntegrationTests();
    }
}
