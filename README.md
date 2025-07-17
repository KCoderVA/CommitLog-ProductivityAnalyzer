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

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

Copyright 2025 KCoderVA

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Author

Created by KCoderVA - [GitHub Profile](https://github.com/KCoderVA)
