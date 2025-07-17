/**
 * Unit Tests for Data Processor
 * Tests the data processing functionality for commit analysis
 */

// Mock data for testing
const mockCommits = [
    {
        sha: 'abc123',
        message: 'Initial commit',
        author: {
            name: 'John Doe',
            email: 'john@example.com'
        },
        date: '2025-01-01T10:00:00Z',
        stats: {
            additions: 100,
            deletions: 0,
            files: ['README.md', 'index.html']
        }
    },
    {
        sha: 'def456',
        message: 'Add new feature',
        author: {
            name: 'Jane Smith',
            email: 'jane@example.com'
        },
        date: '2025-01-02T15:30:00Z',
        stats: {
            additions: 50,
            deletions: 10,
            files: ['feature.js', 'styles.css']
        }
    },
    {
        sha: 'ghi789',
        message: 'Fix bug in authentication',
        author: {
            name: 'John Doe',
            email: 'john@example.com'
        },
        date: '2025-01-03T09:15:00Z',
        stats: {
            additions: 20,
            deletions: 5,
            files: ['auth.js']
        }
    }
];

const mockRepository = {
    name: 'test-repo',
    description: 'A test repository',
    url: 'https://github.com/test/test-repo'
};

// Test suite for DataProcessor
function runDataProcessorTests() {
    console.log('Running DataProcessor tests...');
    
    const processor = new DataProcessor();
    
    // Test processCommitData
    console.log('Testing processCommitData...');
    const result = processor.processCommitData(mockCommits, mockRepository);
    
    // Verify structure
    if (!result.summary || !result.commits || !result.contributors) {
        console.error('❌ processCommitData: Missing required properties');
        return false;
    }
    
    // Test summary calculations
    console.log('Testing summary calculations...');
    const summary = result.summary;
    
    if (summary.totalCommits !== 3) {
        console.error('❌ Expected totalCommits to be 3, got:', summary.totalCommits);
        return false;
    }
    
    if (summary.totalAdditions !== 170) {
        console.error('❌ Expected totalAdditions to be 170, got:', summary.totalAdditions);
        return false;
    }
    
    if (summary.totalDeletions !== 15) {
        console.error('❌ Expected totalDeletions to be 15, got:', summary.totalDeletions);
        return false;
    }
    
    if (summary.contributors !== 2) {
        console.error('❌ Expected contributors to be 2, got:', summary.contributors);
        return false;
    }
    
    // Test contributors analysis
    console.log('Testing contributors analysis...');
    const contributors = result.contributors;
    
    if (contributors.list.length !== 2) {
        console.error('❌ Expected 2 contributors, got:', contributors.list.length);
        return false;
    }
    
    // Test that John Doe has 2 commits (more than Jane Smith's 1)
    const johnDoe = contributors.list.find(c => c.name === 'John Doe');
    if (!johnDoe || johnDoe.commits !== 2) {
        console.error('❌ Expected John Doe to have 2 commits, got:', johnDoe?.commits);
        return false;
    }
    
    // Test timeline creation
    console.log('Testing timeline creation...');
    const timeline = result.timeline;
    
    if (!timeline.daily || timeline.daily.length === 0) {
        console.error('❌ Timeline should have daily data');
        return false;
    }
    
    // Test date range calculation
    console.log('Testing date range calculation...');
    const dateRange = summary.dateRange;
    
    if (!dateRange.start || !dateRange.end) {
        console.error('❌ Date range should have start and end dates');
        return false;
    }
    
    if (dateRange.start !== '2025-01-01' || dateRange.end !== '2025-01-03') {
        console.error('❌ Expected date range 2025-01-01 to 2025-01-03, got:', dateRange.start, 'to', dateRange.end);
        return false;
    }
    
    console.log('✅ All DataProcessor tests passed!');
    return true;
}

// Test suite for productivity metrics
function runMetricsTests() {
    console.log('Running Metrics tests...');
    
    const processor = new DataProcessor();
    const metrics = processor.calculateProductivityMetrics(mockCommits);
    
    // Test average commit size calculation
    const expectedAvgCommitSize = Math.round((170 + 15) / 3); // (total additions + deletions) / commits
    if (metrics.averageCommitSize !== expectedAvgCommitSize) {
        console.error('❌ Expected average commit size to be', expectedAvgCommitSize, 'got:', metrics.averageCommitSize);
        return false;
    }
    
    // Test net changes calculation
    const expectedNetChanges = 170 - 15; // additions - deletions
    if (metrics.netChanges !== expectedNetChanges) {
        console.error('❌ Expected net changes to be', expectedNetChanges, 'got:', metrics.netChanges);
        return false;
    }
    
    // Test productivity score (should be a positive number)
    if (typeof metrics.productivity !== 'number' || metrics.productivity < 0) {
        console.error('❌ Expected productivity to be a positive number, got:', metrics.productivity);
        return false;
    }
    
    console.log('✅ All Metrics tests passed!');
    return true;
}

// Test suite for file analysis
function runFileAnalysisTests() {
    console.log('Running File Analysis tests...');
    
    const processor = new DataProcessor();
    const result = processor.processCommitData(mockCommits, mockRepository);
    const fileAnalysis = result.fileAnalysis;
    
    // Test file type analysis
    if (!fileAnalysis.fileTypeAnalysis || fileAnalysis.fileTypeAnalysis.length === 0) {
        console.error('❌ Expected file type analysis data');
        return false;
    }
    
    // Test most modified files
    if (!fileAnalysis.mostModifiedFiles || fileAnalysis.mostModifiedFiles.length === 0) {
        console.error('❌ Expected most modified files data');
        return false;
    }
    
    // Test total unique files count
    const expectedUniqueFiles = 5; // README.md, index.html, feature.js, styles.css, auth.js
    if (fileAnalysis.totalUniqueFiles !== expectedUniqueFiles) {
        console.error('❌ Expected', expectedUniqueFiles, 'unique files, got:', fileAnalysis.totalUniqueFiles);
        return false;
    }
    
    console.log('✅ All File Analysis tests passed!');
    return true;
}

// Test error handling
function runErrorHandlingTests() {
    console.log('Running Error Handling tests...');
    
    const processor = new DataProcessor();
    
    // Test with empty commits array
    try {
        const result = processor.processCommitData([], mockRepository);
        if (result.summary.totalCommits !== 0) {
            console.error('❌ Expected totalCommits to be 0 for empty array');
            return false;
        }
    } catch (error) {
        console.error('❌ Should handle empty commits array gracefully');
        return false;
    }
    
    // Test with malformed commit data
    try {
        const malformedCommits = [{ sha: 'test', message: 'test' }]; // Missing required fields
        const result = processor.processCommitData(malformedCommits, mockRepository);
        // Should not throw an error
    } catch (error) {
        console.error('❌ Should handle malformed data gracefully');
        return false;
    }
    
    console.log('✅ All Error Handling tests passed!');
    return true;
}

// Run all tests
function runAllDataProcessorTests() {
    console.log('=== DataProcessor Test Suite ===');
    
    const tests = [
        runDataProcessorTests,
        runMetricsTests,
        runFileAnalysisTests,
        runErrorHandlingTests
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
        try {
            if (test()) {
                passedTests++;
            }
        } catch (error) {
            console.error('❌ Test threw an error:', error);
        }
    }
    
    console.log(`\n=== Test Results ===`);
    console.log(`Passed: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed!');
        return true;
    } else {
        console.log('❌ Some tests failed');
        return false;
    }
}

// Export for use in test runners
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllDataProcessorTests,
        runDataProcessorTests,
        runMetricsTests,
        runFileAnalysisTests,
        runErrorHandlingTests,
        mockCommits,
        mockRepository
    };
}

// Auto-run tests if in browser
if (typeof window !== 'undefined' && window.DataProcessor) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllDataProcessorTests);
    } else {
        runAllDataProcessorTests();
    }
}
