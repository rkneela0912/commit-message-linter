# Commit Message Linter ✅

[![GitHub release](https://img.shields.io/github/v/release/rkneela0912/commit-message-linter)](https://github.com/rkneela0912/commit-message-linter/releases) [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Enforce conventional commit message standards and provide helpful feedback to maintain clean git history and enable automated changelog generation.

## Why Use Commit Message Linter?

- **📏 Enforce Standards:** Ensure all commits follow conventional commits format
- **📖 Educational:** Provides helpful examples when validation fails
- **🤖 Automation-Ready:** Clean commit history enables automated changelogs
- **🎯 Customizable:** Define your own commit message patterns
- **💬 PR Feedback:** Posts helpful comments directly on pull requests

## Features

- Validates all commits in a pull request
- Supports conventional commits format by default
- Customizable regex patterns
- Helpful error messages with examples
- Configurable failure behavior
- Posts validation results as PR comments

## Quick Start

Create `.github/workflows/lint-commits.yml`:

```yaml
name: Lint Commit Messages

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  lint:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    
    steps:
      - name: Lint commit messages
        uses: rkneela0912/commit-message-linter@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Default Pattern

By default, validates against conventional commits:

```
type(scope): description
```

**Valid types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`, `revert`

**Examples:**
- ✅ `feat: add user authentication`
- ✅ `fix(api): resolve timeout issue`
- ✅ `docs: update README`
- ❌ `added new feature` (no type)
- ❌ `fix:missing space`

## Configuration

### Custom Pattern

Define your own commit message format:

```yaml
- uses: rkneela0912/commit-message-linter@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    pattern: '^(FEAT|FIX|DOCS): .{10,100}$'
```

### Custom Error Message

Provide helpful guidance when validation fails:

```yaml
- uses: rkneela0912/commit-message-linter@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    error_message: |
      ❌ Invalid commit message!
      
      Please use: TYPE: Description (10-100 chars)
      
      Valid types: FEAT, FIX, DOCS
      
      Example: FEAT: Add user dashboard
```

### Warning Mode

Don't fail the workflow, just warn:

```yaml
- uses: rkneela0912/commit-message-linter@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    fail_on_error: 'false'
```

## Inputs

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `github_token` | GitHub token for API access | - | ✅ Yes |
| `pattern` | Regex pattern for valid commits | Conventional commits | No |
| `error_message` | Custom error message | Default message | No |
| `fail_on_error` | Fail workflow on invalid commits | `true` | No |

## Outputs

| Output | Description |
|--------|-------------|
| `valid` | Whether all commits are valid (`true`/`false`) |
| `invalid_count` | Number of invalid commit messages |

## Examples

### Basic Usage

```yaml
name: Lint Commits
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  lint:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    steps:
      - uses: rkneela0912/commit-message-linter@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### With Custom Pattern

```yaml
- uses: rkneela0912/commit-message-linter@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    pattern: '^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,100}$'
```

### With Conditional Actions

```yaml
- name: Lint commits
  id: lint
  uses: rkneela0912/commit-message-linter@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}

- name: Comment on failure
  if: steps.lint.outputs.valid == 'false'
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '⚠️ Found ${{ steps.lint.outputs.invalid_count }} invalid commit message(s). Please review the commit history.'
      })
```

## Conventional Commits Format

The default pattern follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI configuration changes
- `revert`: Revert previous commit

## How It Works

1. Triggered when a PR is opened or updated
2. Fetches all commits in the PR
3. Validates each commit message against the pattern
4. Posts a comment on the PR if validation fails
5. Fails the workflow (optional) if invalid commits found

## Best Practices

### ✅ Do:
- Keep commit messages concise but descriptive
- Use present tense ("add" not "added")
- Start with lowercase after the colon
- Include scope when relevant
- Use imperative mood

### ❌ Don't:
- Use vague messages like "fix bug" or "update code"
- Include issue numbers in the subject (put in body)
- Exceed 100 characters in the subject line
- Use past tense

## Permissions

This action requires:

```yaml
permissions:
  pull-requests: write  # To post comments
  contents: read        # To read commits
```

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## License

[MIT License](LICENSE)

## Support

⭐ Star this repo if you find it helpful!

For issues or questions, [open an issue](https://github.com/rkneela0912/commit-message-linter/issues).

