# Development Guidelines

## Temporary Files Policy

### Rule: Automatic .gitignore Addition
**Any temporary files created during development MUST be immediately added to .gitignore**

### Examples of Temporary Files:
- Migration logs: `*-migration.txt`, `*-migration.log`
- Debug files: `debug*.txt`, `debug*.log`
- Development notes: `dev-notes*.txt`, `scratch*.txt`
- AI assistant outputs: `ai-*.txt`, `copilot-*.txt`
- Backup files: `*.backup`, `*.bak`, `*.orig`
- Test files: `test*.log`, `temp-*.txt`

### Implementation:
1. **Before creating**: Check if pattern exists in .gitignore
2. **After creating**: Add specific pattern if not covered
3. **Use broad patterns**: Cover future scenarios with wildcards
4. **Document reasoning**: Add comments explaining the pattern

### .gitignore Section:
All temporary files should be added to the "Development and Migration Temporary Files" section in .gitignore with descriptive comments.

### Examples:
```gitignore
# Branch migration and development logs
branch-migration-log.txt
migration-*.txt
*-migration.log

# AI assistant temporary outputs
copilot-*.txt
assistant-*.log
```

This ensures clean repositories and prevents accidental commits of temporary development artifacts.
