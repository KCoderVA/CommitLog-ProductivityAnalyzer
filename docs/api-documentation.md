# API Documentation

## Core Modules

### GitAnalyzer (`src/js/core/git-analyzer.js`)
Handles local Git repository analysis.

#### Methods
- `analyzeRepository(repoPath)`: Analyzes a local Git repository
- `getCommitHistory()`: Retrieves commit history
- `calculateStats()`: Calculates productivity statistics

### GitHubAPI (`src/js/core/github-api.js`)
Manages GitHub API interactions.

#### Methods
- `fetchRepository(owner, repo)`: Fetches repository information
- `getCommits(owner, repo)`: Retrieves commit history from GitHub
- `getRateLimit()`: Checks API rate limits

### DataProcessor (`src/js/core/data-processor.js`)
Processes and formats repository data.

#### Methods
- `processCommitData(commits)`: Processes raw commit data
- `calculateProductivityMetrics(data)`: Calculates productivity metrics
- `formatForDisplay(data)`: Formats data for dashboard display

## UI Components

### Dashboard (`src/js/ui/dashboard.js`)
Main dashboard controller.

#### Methods
- `initialize()`: Initializes the dashboard
- `displaySummary(data)`: Shows summary analysis
- `displayDetails(data)`: Shows detailed commit history

### Charts (`src/js/ui/charts.js`)
Handles chart rendering and visualization.

#### Methods
- `createCommitChart(data)`: Creates commit frequency chart
- `createContributorChart(data)`: Creates contributor activity chart

## Configuration

### Offline Config (`config/offline-config.js`)
Configuration for offline version.

### Online Config (`config/online-config.js`)
Configuration for online version including GitHub API settings.

## Data Structures

### Commit Object
```javascript
{
  sha: "commit-hash",
  message: "commit message",
  author: {
    name: "Author Name",
    email: "author@email.com"
  },
  date: "2025-01-01T00:00:00Z",
  stats: {
    additions: 10,
    deletions: 5,
    files: ["file1.js", "file2.css"]
  }
}
```

### Repository Summary
```javascript
{
  totalCommits: 100,
  totalFiles: 50,
  totalAdditions: 1000,
  totalDeletions: 500,
  contributors: 5,
  dateRange: {
    start: "2024-01-01",
    end: "2025-01-01"
  }
}
```
