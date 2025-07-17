# Assets Directory

This directory contains static assets for the Git/GitHub Commit Log Productivity Analyzer.

## Structure

- `images/` - Images used in the application (logos, screenshots, etc.)
- `icons/` - Icon files (SVG, PNG, etc.)

## Usage

Assets can be referenced in HTML, CSS, and JavaScript files using relative paths:

```html
<!-- In HTML -->
<img src="src/assets/images/logo.png" alt="Logo">

<!-- In CSS -->
.icon {
    background-image: url('../assets/icons/github.svg');
}
```

## File Formats

Recommended file formats:
- **Icons**: SVG (preferred), PNG
- **Images**: PNG, JPG, WebP
- **Logos**: SVG (preferred), PNG

## Optimization

All assets should be optimized for web delivery:
- Images compressed appropriately
- SVGs minified
- Use appropriate file formats for content type

## Naming Convention

Use descriptive, kebab-case names:
- `github-icon.svg`
- `commit-chart-bg.png`
- `productivity-logo.png`
