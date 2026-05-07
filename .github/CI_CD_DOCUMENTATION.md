# CI/CD Pipeline Documentation

## Overview

This repository uses a comprehensive, enterprise-grade CI/CD pipeline with multiple automated workflows to ensure code quality, security, and reliability.

## Workflows

### 1. **CI/CD Pipeline** (`webpack.yml`)

The main continuous integration and deployment workflow.

**Triggers:**
- Push to `master` branch
- Pull requests to `master`
- Manual workflow dispatch
- Weekly schedule (Sundays at 00:00 UTC)

**Jobs:**
- **Code Quality & Linting**: TypeScript compilation, ESLint, Prettier formatting, bundle size analysis
- **Security Scanning**: npm audit, dependency review, secret scanning with TruffleHog
- **Build & Test Matrix**: Cross-platform builds (Ubuntu, Windows, macOS) with Node.js 18.x, 20.x, 22.x
- **Package Extension**: Creates VSIX package for VS Code marketplace
- **Performance Metrics**: Bundle size analysis, code statistics
- **Summary**: Comprehensive workflow status report

**Key Features:**
- ✅ Cross-platform testing
- ✅ Multi-version Node.js support
- ✅ Artifact uploads (builds, tests, VSIX)
- ✅ Code coverage reporting
- ✅ Concurrency control
- ✅ Security-first permissions

### 2. **CodeQL Security Analysis** (`codeql.yml`)

Advanced security scanning using GitHub's CodeQL engine.

**Triggers:**
- Push to `master` branch
- Pull requests to `master`
- Weekly schedule (Sundays at 03:00 UTC)
- Manual workflow dispatch

**Features:**
- Scans JavaScript and TypeScript code
- Security and quality query suites
- Automated vulnerability detection
- SARIF report generation

### 3. **Release Management** (`release.yml`)

Automated release creation and publishing.

**Triggers:**
- Git tags matching `v*.*.*`
- Manual workflow dispatch with version input

**Jobs:**
- Build release package
- Create GitHub release with changelog
- Publish to VS Code Marketplace (optional)

**Artifacts:**
- VSIX package (90-day retention)
- Release notes
- Changelog

### 4. **Performance Benchmarks** (`performance.yml`)

Tracks build performance and bundle size over time.

**Triggers:**
- Push to `master` branch
- Pull requests
- Weekly schedule (Saturdays at 00:00 UTC)
- Manual workflow dispatch

**Metrics:**
- Build time (development vs production)
- Bundle size analysis
- Dependency count
- Code complexity metrics

### 5. **PR Automation** (`pr-automation.yml`)

Automated pull request validation and enhancement.

**Triggers:**
- Pull request events (opened, synchronize, reopened, edited)

**Features:**
- Semantic PR title validation
- PR size analysis
- Automatic labeling
- Welcome comment for new contributors
- Dependency change detection

### 6. **Stale Issues & PRs** (`stale.yml`)

Manages inactive issues and pull requests.

**Triggers:**
- Daily schedule (00:00 UTC)
- Manual workflow dispatch

**Behavior:**
- Issues: Mark stale after 60 days, close after 7 more days
- PRs: Mark stale after 30 days, close after 14 more days
- Exempt labels: `pinned`, `security`, `bug`, `enhancement`, `in-progress`

### 7. **Documentation & Link Validation** (`documentation.yml`)

Ensures documentation quality and link validity.

**Triggers:**
- Changes to Markdown files
- Weekly schedule (Wednesdays at 00:00 UTC)
- Manual workflow dispatch

**Checks:**
- Markdown linting
- Link validation
- Spell checking

## Configuration Files

### Security

- **`.github/codeql-config.yml`**: CodeQL analysis configuration
- **`.github/dependabot.yml`**: Automated dependency updates

### Documentation

- **`.github/markdown-link-check-config.json`**: Link checker settings
- **`.github/spellcheck-config.yml`**: Spell check configuration
- **`.github/wordlist.txt`**: Custom dictionary
- **`.markdownlint.json`**: Markdown linting rules

### Automation

- **`.github/labeler.yml`**: PR auto-labeling rules

## Workflow Status Badges

Add these badges to your README to show workflow status (replace OWNER/REPO with your repository):

```markdown
![CI/CD Pipeline](https://github.com/OWNER/REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
![CodeQL](https://github.com/OWNER/REPO/workflows/CodeQL%20Security%20Analysis/badge.svg)
![Performance](https://github.com/OWNER/REPO/workflows/Performance%20Benchmarks/badge.svg)
```

## Manual Triggers

All workflows support manual triggering via GitHub Actions UI:
1. Go to **Actions** tab
2. Select the workflow
3. Click **Run workflow**
4. Choose branch and fill any required inputs

## Secrets Required

The following secrets should be configured in repository settings:

- `CODECOV_TOKEN`: Code coverage reporting (optional)
- `VSCE_TOKEN`: VS Code Marketplace publishing (for releases)

## Best Practices

### For Contributors

1. **Before Opening a PR:**
   - Run `npm run lint` to check code style
   - Run `npm run test` to ensure tests pass
   - Run `npm run esbuild` to verify build works

2. **PR Guidelines:**
   - Use semantic commit format: `type(scope): description`
   - Keep PRs focused (< 50 files, < 1000 lines)
   - Update documentation for new features
   - Add tests for new functionality

3. **Monitoring CI:**
   - Check all workflow jobs pass
   - Review code quality reports
   - Address security warnings
   - Verify build artifacts

### For Maintainers

1. **Release Process:**
   - Update version in `package.json`
   - Update `CHANGELOG.md`
   - Create git tag: `git tag v3.14.1`
   - Push tag: `git push origin v3.14.1`
   - Release workflow runs automatically

2. **Security:**
   - Review Dependabot PRs weekly
   - Monitor CodeQL alerts
   - Check npm audit results
   - Validate dependency changes

3. **Performance:**
   - Monitor bundle size trends
   - Review benchmark results
   - Optimize slow builds
   - Track dependency count

## Troubleshooting

### Build Failures

**Issue**: `npm ci` fails with ENOENT for local dependency

**Solution**: Use `npm install || npm install --legacy-peer-deps` as fallback

### Test Failures

**Issue**: Tests fail on specific platform

**Solution**: Check test logs, verify platform-specific code paths

### Artifact Upload Failures

**Issue**: Artifact upload times out

**Solution**: Reduce artifact size, increase timeout, or check network

## Performance Optimization

The CI/CD pipeline is optimized for:
- ⚡ Fast builds with npm caching
- 🔄 Parallel job execution
- 📦 Efficient artifact storage
- 🎯 Conditional job execution
- ⏱️ Timeout protection

## Maintenance

### Regular Tasks

- **Weekly**: Review Dependabot PRs
- **Monthly**: Check stale issues/PRs
- **Quarterly**: Review workflow efficiency
- **Annually**: Update Node.js versions

### Metrics to Monitor

- Build duration trends
- Test pass rate
- Security vulnerability count
- Bundle size changes
- Dependency count

## Support

For questions or issues with CI/CD:
- Open an issue with `ci` label
- Contact: chakroun.anas@outlook.com
- Documentation: https://docs.github.com/actions

---

**Last Updated**: January 2026  
**Maintained by**: Turbo Console Log Team
