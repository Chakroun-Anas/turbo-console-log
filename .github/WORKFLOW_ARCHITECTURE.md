# CI/CD Workflow Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GitHub Repository Events                         │
│  (Push, PR, Schedule, Tag, Manual Dispatch)                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Workflow Orchestration                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │  webpack   │  │   CodeQL   │  │  Release   │  │Performance │   │
│  │  (Main)    │  │ (Security) │  │(Publish)   │  │(Benchmark) │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
│                                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                    │
│  │    PR      │  │   Stale    │  │    Docs    │                    │
│  │(Automation)│  │(Management)│  │(Validation)│                    │
│  └────────────┘  └────────────┘  └────────────┘                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 📋 Workflow Dependency Graph

```
Main CI/CD Pipeline (webpack.yml)
├── Code Quality (Runs First)
│   ├── TypeScript Check
│   ├── Linting
│   └── Format Check
│
├── Security Scanning (Parallel)
│   ├── npm Audit
│   ├── Dependency Review
│   └── Secret Detection
│
├── Build & Test Matrix (After Quality)
│   ├── Ubuntu (Node 18, 20, 22)
│   ├── Windows (Node 18, 20, 22)
│   └── macOS (Node 18, 20, 22)
│
├── Package (After Build)
│   └── VSIX Creation
│
├── Metrics (After Build)
│   ├── Bundle Size
│   └── Code Stats
│
└── Summary (After All)
    └── Status Report
```

## 🔄 Workflow Triggers

### Automatic Triggers

| Workflow | Push | PR | Schedule | Tag | Manual |
|----------|------|-----|----------|-----|--------|
| webpack.yml | ✅ master | ✅ master | ✅ Weekly | ❌ | ✅ |
| codeql.yml | ✅ master | ✅ master | ✅ Weekly | ❌ | ✅ |
| release.yml | ❌ | ❌ | ❌ | ✅ v*.*.* | ✅ |
| performance.yml | ✅ master | ✅ master | ✅ Weekly | ❌ | ✅ |
| pr-automation.yml | ❌ | ✅ master | ❌ | ❌ | ❌ |
| stale.yml | ❌ | ❌ | ✅ Daily | ❌ | ✅ |
| documentation.yml | ✅ *.md | ✅ *.md | ✅ Weekly | ❌ | ✅ |

### Schedule Details

- **Daily** (00:00 UTC): Stale issue management
- **Weekly** (00:00 UTC Sunday): Main CI/CD, CodeQL
- **Weekly** (03:00 UTC Sunday): CodeQL focused scan
- **Weekly** (00:00 UTC Saturday): Performance benchmarks
- **Weekly** (00:00 UTC Wednesday): Documentation validation

## 🎯 Job Flow - Main Pipeline (webpack.yml)

```
┌──────────────────┐
│  Trigger Event   │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         code-quality (10 min)           │
│  • Checkout                             │
│  • Setup Node 22.x                      │
│  • Install deps (with fallback)         │
│  • TypeScript check                     │
│  • Format check                         │
│  • Bundle analysis                      │
└────────┬────────────────────────────────┘
         │
         ├──────────────┬──────────────────┐
         ▼              ▼                  ▼
┌──────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│   security   │ │ build-and-test   │ │                      │
│   (15 min)   │ │    (20 min)      │ │  Matrix (9 jobs):    │
│              │ │                  │ │  • Ubuntu x3         │
│ • npm audit  │ │ • Checkout       │ │  • Windows x3        │
│ • Dep review │ │ • Setup Node     │ │  • macOS x3          │
│ • Secrets    │ │ • Install        │ │                      │
└──────────────┘ │ • Build Dev      │ │  Each:               │
                 │ • Build Prod     │ │  • Build             │
                 │ • Verify         │ │  • Test              │
                 │ • Test           │ │  • Coverage          │
                 │ • Coverage       │ │  • Artifacts         │
                 │ • Artifacts      │ └──────────────────────┘
                 └────────┬─────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   package    │ │   metrics    │ │   summary    │
│   (10 min)   │ │   (10 min)   │ │   (5 min)    │
│              │ │              │ │              │
│ • Package    │ │ • Bundle     │ │ • Status     │
│ • Create     │ │ • Stats      │ │ • Report     │
│   VSIX       │ │ • Analysis   │ └──────────────┘
└──────────────┘ └──────────────┘
```

## 🔐 Security Layers

```
┌────────────────────────────────────────┐
│        Application Security            │
├────────────────────────────────────────┤
│                                        │
│  Layer 1: Code Analysis                │
│  ├─ CodeQL (JavaScript/TypeScript)     │
│  └─ Static Analysis                    │
│                                        │
│  Layer 2: Dependency Security          │
│  ├─ npm audit (vulnerabilities)        │
│  ├─ Dependency Review (PRs)            │
│  └─ Dependabot (updates)               │
│                                        │
│  Layer 3: Secret Protection            │
│  └─ TruffleHog (secret detection)      │
│                                        │
│  Layer 4: Permissions                  │
│  ├─ Minimal GITHUB_TOKEN scope         │
│  └─ Read-only by default               │
│                                        │
└────────────────────────────────────────┘
```

## 📦 Artifact Management

```
Build Artifacts (14 days)
├── extension-build
│   ├── out/extension.js
│   ├── package.json
│   ├── README.md
│   └── CHANGELOG.md
│
Test Results (7 days)
├── test-results-Linux-node22.x
├── test-results-Windows-node22.x
└── test-results-macOS-node22.x
    ├── coverage/
    └── *.log

Release Artifacts (90 days)
└── vsix-package
    └── turbo-console-log-*.vsix
```

## 🎨 Developer Experience Flow

```
┌──────────────┐
│  Developer   │
│  Opens PR    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│  PR Automation Triggers             │
├─────────────────────────────────────┤
│  1. Welcome comment posted          │
│  2. Semantic title validation       │
│  3. PR size analysis                │
│  4. Auto-labeling applied           │
│  5. Dependency check                │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Main CI/CD Runs                    │
├─────────────────────────────────────┤
│  1. Code quality checks             │
│  2. Security scanning               │
│  3. Cross-platform builds           │
│  4. Test execution                  │
│  5. Artifact generation             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Results & Feedback                 │
├─────────────────────────────────────┤
│  • Status badges                    │
│  • Job summaries                    │
│  • Coverage reports                 │
│  • Build artifacts                  │
│  • Performance metrics              │
└─────────────────────────────────────┘
```

## 🚀 Release Process

```
┌──────────────┐
│  Developer   │
│  Creates Tag │
│  v3.14.1     │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Release Workflow Triggers          │
└──────┬──────────────────────────────┘
       │
       ├──────────────────────┐
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│ Build Release│      │ Create GitHub│
│   Package    │      │   Release    │
│              │      │              │
│ • Install    │      │ • Changelog  │
│ • Build      │      │ • Notes      │
│ • Package    │      │ • VSIX       │
│   VSIX       │      │   Upload     │
└──────┬───────┘      └──────┬───────┘
       │                     │
       │      ┌──────────────┘
       │      │
       ▼      ▼
┌─────────────────────────────────────┐
│  Publish to Marketplace (Optional)  │
└─────────────────────────────────────┘
```

## 📊 Metrics & Monitoring

### Tracked Metrics

1. **Build Performance**
   - Development build time
   - Production build time
   - Bundle size (raw, KB, MB)

2. **Code Quality**
   - TypeScript files count
   - Total lines of code
   - Average lines per file
   - Dependency count

3. **Test Coverage**
   - Unit test coverage %
   - Integration test coverage %
   - Failed/passed test ratio

4. **Security**
   - Vulnerability count (critical, high, medium, low)
   - Secret exposure attempts
   - Outdated dependencies

### Performance Baselines

```
Target Metrics:
├── Build Time: < 30 seconds
├── Bundle Size: < 5 MB
├── Test Coverage: > 80%
├── Security Alerts: 0 critical
└── Dependency Updates: < 7 days old
```

## 🔧 Maintenance Schedule

```
Daily:
└── Stale issue management

Weekly:
├── Monday: Dependabot PRs
├── Sunday: Full CI/CD, CodeQL
├── Saturday: Performance benchmarks
└── Wednesday: Documentation validation

Monthly:
├── Review workflow efficiency
├── Update Node.js versions
└── Clean old artifacts

Quarterly:
└── Major dependency updates

Annually:
└── Workflow architecture review
```

## 🎯 Success Criteria

✅ **Quality**: All checks pass on every commit
✅ **Security**: Zero critical vulnerabilities
✅ **Performance**: Build time < 30s, bundle < 5MB
✅ **Coverage**: Test coverage > 80%
✅ **Automation**: 100% PR automation
✅ **Documentation**: All links valid, no spelling errors
✅ **Maintenance**: Dependencies updated weekly

---

**Architecture Version**: 1.0.0
**Last Updated**: January 2026
**Maintained by**: Turbo Console Log Team
