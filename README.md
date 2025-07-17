# Git/GitHub Commit Log Productivity Analyzer

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/Version-0.1.12-green.svg)](./CHANGELOG.md)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen.svg)](https://kcoderva.github.io/CommitLog-ProductivityAnalyzer/)
[![Repository](https://img.shields.io/badge/GitHub-Repository-black.svg)](https://github.com/KCoderVA/CommitLog-ProductivityAnalyzer)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26.svg?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6.svg?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

A comprehensive, unified dashboard for analyzing Git repository commit logs and extracting detailed productivity metrics from both local repositories and GitHub.com repositories. This project provides a single, intelligent HTML dashboard that automatically adapts to its environment (offline/online) and delivers powerful repository analysis capabilities. Extract insights from commit logs, analyze productivity patterns, and visualize development metrics through an intuitive interface.

## ✨ Key Features

### 🎨 **Interactive Dashboard**
- Real-time data visualization with charts and graphs
- GitHub.com hosted index.html file (via https://kcoderva.github.io/CommitLog-ProductivityAnalyzer/)
- Responsive design for all devices 
- Three main analysis sections:
  - **Repository Summary**: High-level overview and statistics
  - **Detailed History**: Comprehensive commit timeline
  - **Productivity Metrics**: In-depth analysis and trends
  - 
### 🔍 **Repository Analysis**
- **Local Git Repositories**: Direct analysis of local `.git` folders (offline mode)
- **GitHub Repositories**: Remote analysis via GitHub API (online/offline modes)
- **Automatic Detection**: Smart environment detection for seamless operation

### 📊 **Productivity Metrics**
- Commit frequency and patterns analysis
- File impact analysis (additions, deletions, modifications)
- Line change statistics and trends
- Developer productivity insights
- Time-based activity patterns
- Repository growth tracking



### 🌐 **Deployment Flexibility**
- **Unified Entry Point**: Single `index.html` for all environments
- **Offline Mode**: Full functionality for local repositories
- **GitHub Pages Ready**: Optimized for web hosting
- **Cross-Platform**: Works on Windows, macOS, Linux

## 📁 Project Structure

```
CommitLog_ProductivityDashboard/
├── 📄 index.html                           # Unified entry point with environment detection
├── 📄 README.md                            # Project documentation
├── 📄 LICENSE                              # Apache 2.0 license
├── 📄 CHANGELOG.md                         # Version history and changes
├── 📄 .gitignore                           # Git ignore patterns
├── 📄 *.code-workspace                     # VS Code workspace configuration
├── 📁 config/                              # Environment configurations
│   ├── offline-config.js                  # Settings for offline mode
│   └── online-config.js                   # Settings for online/hosted mode
├── 📁 src/                                 # Source code
│   ├── 📁 js/                             # JavaScript modules
│   │   ├── 📁 core/                       # Core functionality
│   │   │   ├── data-processor.js          # Data processing and analysis
│   │   │   ├── git-analyzer.js            # Local Git repository analysis
│   │   │   └── github-api.js              # GitHub API integration
│   │   ├── 📁 ui/                         # User interface
│   │   │   ├── dashboard.js               # Main dashboard controller
│   │   │   └── charts.js                  # Data visualization
│   │   └── 📁 utils/                      # Utility functions
│   │       ├── file-handler.js            # File system operations
│   │       └── helpers.js                 # General helper functions
│   ├── 📁 css/                            # Stylesheets
│   │   ├── main.css                       # Core styles and reset
│   │   ├── dashboard.css                  # Dashboard-specific styles
│   │   └── responsive.css                 # Mobile and responsive design
│   └── 📁 assets/                         # Static assets
│       ├── 📁 images/                     # Images and screenshots
│       ├── 📁 icons/                      # Icon files (SVG, PNG)
│       └── README.md                      # Asset usage guidelines
├── 📁 docs/                               # Documentation
│   ├── user-guide.md                      # User manual and instructions
│   └── api-documentation.md               # Developer API reference
└── 📁 tests/                              # Testing framework
    ├── 📁 unit/                           # Unit tests
    ├── 📁 integration/                    # Integration tests
    └── README.md                          # Testing documentation
```

## 🚀 Getting Started

### Universal Entry Point
The `index.html` file is the single entry point that automatically detects its environment and adapts accordingly:

- **🏠 Local/Offline Mode** (`file://` protocol)
  - Enables local Git repository folder selection
  - Full offline functionality without internet dependency
  - Direct filesystem access for `.git` repository analysis

- **🌐 GitHub Pages Mode** (`.github.io` domains)
  - Optimized for GitHub Pages hosting
  - GitHub repository URL analysis via API
  - Responsive web interface

- **☁️ Online Mode** (other web servers)
  - Standard web hosting compatibility
  - GitHub API integration for remote repositories
  - Cross-origin request handling

### 🏠 Offline/Local Usage
1. **Clone or Download**: Get the repository to your local machine
   ```bash
   git clone https://github.com/KCoderVA/CommitLog_ProductivityDashboard.git
   ```
2. **Open Dashboard**: Double-click `index.html` or open in your browser
3. **Analyze Repositories**:
   - **Local**: Click "Select Local Git Repository" to browse for a `.git` folder
   - **Remote**: Enter any GitHub repository URL (e.g., `https://github.com/user/repo`)
4. **View Results**: Explore the generated analysis in the dashboard sections

### 🌐 Online/Hosted Usage
1. **Visit Website**: Go to the hosted version URL
2. **GitHub Analysis**: Enter a GitHub repository URL for analysis
3. **Explore Data**: View comprehensive productivity metrics and visualizations

*Note: Local repository analysis is automatically disabled in online mode for security*

## 🛠️ Technical Architecture

### Frontend Technology Stack
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with Flexbox/Grid and responsive design
- **Vanilla JavaScript (ES6+)**: Modular architecture without framework dependencies
- **Dynamic Module Loading**: Environment-specific script loading

### Key Design Principles
- **Progressive Enhancement**: Core functionality works everywhere
- **Mobile-First Design**: Responsive across all device sizes
- **Modular Architecture**: Separation of concerns with clean interfaces
- **Environment Agnostic**: Single codebase adapts to deployment context
- **Performance Optimized**: Minimal dependencies and efficient loading

## 🤝 Development & Contributing

### Getting Started with Development
1. **Fork the Repository** on GitHub
2. **Clone Your Fork** to your local machine
3. **Create a Feature Branch**: `git checkout -b feature/your-feature-name`
4. **Make Your Changes** following the project coding standards
5. **Test Thoroughly** using both offline and online modes
6. **Submit a Pull Request** with a clear description

### Coding Standards
- **Apache 2.0 License Headers**: Include in all new source files
- **JSDoc Comments**: Document all functions and classes
- **Semantic Versioning**: Follow SemVer for version updates
- **Conventional Commits**: Use standardized commit message format
- **Responsive Design**: Ensure mobile compatibility for UI changes
- **Temporary Files Policy**: Always add temporary development files to .gitignore (see [Development Guidelines](docs/development-guidelines.md))

### Project Development Tools
- **VS Code Workspace**: Pre-configured development environment
- **Git**: Version control with semantic versioning
- **Testing Framework**: Unit and integration test structure
- **Documentation**: Comprehensive docs for users and developers

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
