# Git/GitHub Commit Log Productivity Analyzer

A comprehensive dashboard for analyzing Git repository commit logs and productivity metrics.

## Project Overview

This project provides both online and offline versions of a productivity analyzer that extracts insights from Git repositories through commit log history, comments, and details.

## Features

- **Repository Analysis**: Support for both local Git repositories and GitHub repositories
- **Productivity Metrics**: Analyze file impacts, line changes, new files, deletions, and more
- **Interactive Dashboard**: User-friendly interface with three main sections
- **Dual Deployment**: Offline version and GitHub Pages hosted version

## Project Structure

```
CommitLog_ProductivityDashboard/
├── index.html                              # Unified entry point (auto-detects environment)
├── README.md
├── .gitignore
├── docs/                                   # Documentation
├── src/                                    # Source code
│   ├── js/                                # JavaScript modules
│   ├── css/                               # Stylesheets
│   └── assets/                            # Images and icons
├── config/                                # Configuration files
└── tests/                                 # Test files
```

## Usage

### Universal Entry Point
The `index.html` file automatically detects whether it's running:
- **Locally** (file:// protocol) - Enables offline features including local Git repository analysis
- **On GitHub Pages** - Optimized for GitHub.io hosting
- **On other servers** - Standard online mode

### Offline Mode (Local Usage)
1. Download or clone the repository
2. Open `index.html` in your web browser
3. Select a local Git repository folder OR enter a GitHub repository URL
4. View the analysis results in the dashboard

### Online Mode (GitHub Pages)
1. Visit the GitHub Pages hosted version
2. Enter a GitHub repository URL for analysis
3. View the analysis results in the dashboard

*Note: Local repository analysis is automatically disabled in online mode*

## Development

This project uses vanilla JavaScript, HTML, and CSS for maximum compatibility and performance.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Created by KCoderVA - [GitHub Profile](https://github.com/KCoderVA)
