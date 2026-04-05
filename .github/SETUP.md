# CI/CD Setup Guide

Dokumentácia pre GitHub Actions CI/CD a Vercel deployment.

## 📋 Obsah

- [GitHub Actions](#github-actions)
- [Vercel Setup](#vercel-setup)
- [Environment Variables](#environment-variables)
- [Workflows](#workflows)

## 🔧 GitHub Actions

### Workflows

#### 1. **CI Pipeline** (`.github/workflows/ci.yml`)

Spúšťa sa pri každom push/PR na `main` alebo `develop` branch.

**Jobs:**

- ✅ **Lint & TypeScript Check** - ESLint + TypeScript validation
- 🏗️ **Build** - Next.js production build
- 🧪 **E2E Tests** - Playwright tests na všetkých browseroch
- 💡 **Lighthouse** - Performance audit
- 🔒 **Security Audit** - npm audit
- ✅ **All Checks Pass** - Final validation

**Artifacts:**

- Build output (`.next/`)
- Playwright report
- Test results

#### 2. **Deploy** (`.github/workflows/deploy.yml`)

Production deployment na Vercel pri merge do `main`.

**Steps:**

1. Run all tests
2. Build production bundle
3. Deploy to Vercel Production
4. Comment PR with deployment URL

#### 3. **Preview** (`.github/workflows/preview.yml`)

Preview deployment pre pull requests.

**Steps:**

1. Run lint & type checks
2. Build preview
3. Deploy to Vercel Preview
4. Comment PR with preview URL

### Diagram

```
┌─────────────┐
│  Push/PR    │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│   CI Workflow        │
├──────────────────────┤
│ • ESLint             │
│ • TypeScript Check   │
│ • Format Check       │
│ • Build              │
│ • E2E Tests          │
│ • Lighthouse         │
│ • Security Audit     │
└──────┬───────────────┘
       │
       ▼
   ┌───────┐
   │ Pass? │
   └───┬───┘
       │
   Yes │ No
       │ └─────> ❌ Fail PR
       │
       ▼
┌──────────────┐
│ Merge to     │
│ main         │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Deploy Workflow  │
├──────────────────┤
│ • Run Tests      │
│ • Build          │
│ • Deploy Vercel  │
└──────────────────┘
       │
       ▼
   🚀 Production
```

## 🚀 Vercel Setup

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project

```bash
vercel link
```

### 4. Get Project Info

```bash
vercel project ls
```

### 5. Deploy

```bash
# Preview
vercel

# Production
vercel --prod
```

## 🔐 Environment Variables

### GitHub Secrets

Potrebné secrets pre GitHub Actions:

```
VERCEL_TOKEN          # Vercel API token
VERCEL_ORG_ID         # Organization ID
VERCEL_PROJECT_ID     # Project ID
```

### Ako získať Vercel credentials:

1. **VERCEL_TOKEN:**

   ```bash
   # Navigate to: https://vercel.com/account/tokens
   # Create new token with appropriate scope
   ```

2. **VERCEL_ORG_ID & VERCEL_PROJECT_ID:**

   ```bash
   vercel link
   # Copy values from .vercel/project.json
   ```

3. **Add to GitHub:**
   ```
   Repository → Settings → Secrets and variables → Actions → New secret
   ```

### Environment Variables Structure

```env
# Vercel
VERCEL_TOKEN=your_token_here
VERCEL_ORG_ID=team_xxxxx
VERCEL_PROJECT_ID=prj_xxxxx

# Next.js
NEXT_TELEMETRY_DISABLED=1
```

## 📝 vercel.json Configuration

```json
{
  "version": 2,
  "name": "mental-filter",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "headers": [...],
  "rewrites": [...],
  "regions": ["cdg1"]
}
```

### Key Features:

- ✅ PWA Service Worker caching
- ✅ Manifest.json headers
- ✅ Security headers (CSP, XSS, Frame protection)
- ✅ Static asset caching
- ✅ CDN region configuration
- ✅ Function memory limits

## 🎯 Workflow Triggers

### CI Workflow

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

### Deploy Workflow

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch: # Manual trigger
```

### Preview Workflow

```yaml
on:
  pull_request:
    branches: [main, develop]
```

## 🧪 Testing Strategy

### Local Testing

```bash
# Run all checks locally before push
npm run lint
npm run format:check
npx tsc --noEmit
npm run build
npm run test:e2e
```

### CI Testing

1. **Lint & Type Check** - Fast feedback (1-2 min)
2. **Build** - Verify production build (2-3 min)
3. **E2E Tests** - Comprehensive testing (5-10 min)
4. **Lighthouse** - Performance metrics (2-3 min)
5. **Security** - Vulnerability scan (1 min)

### Test Matrix

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    os: [ubuntu-latest]
```

## 📊 Monitoring & Reports

### Artifacts Available:

1. **Build Output** - `.next/` directory (7 days)
2. **Playwright Report** - Test results + screenshots (30 days)
3. **Test Results** - JUnit XML reports (30 days)

### View Reports:

```bash
# Playwright report
npm run test:e2e:report

# Or download from GitHub Actions artifacts
```

## 🔄 Deployment Flow

### Pull Request:

```
1. Create PR
2. CI runs automatically
3. Preview deployment created
4. Comment with preview URL
5. Review + test preview
6. Merge when approved
```

### Production:

```
1. Merge to main
2. CI validation
3. Production build
4. Deploy to Vercel
5. Live at production URL
```

## 🐛 Troubleshooting

### Build Fails:

```bash
# Check locally
npm run build

# Check types
npx tsc --noEmit

# Check dependencies
npm ci
```

### Tests Fail:

```bash
# Run tests locally
npm run test:e2e

# Debug mode
npx playwright test --debug

# UI mode
npm run test:e2e:ui
```

### Deployment Fails:

```bash
# Check Vercel logs
vercel logs

# Re-deploy
vercel --prod --force
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Playwright CI/CD](https://playwright.dev/docs/ci)

## ✅ Checklist

Before pushing:

- [ ] Code is formatted (`npm run format`)
- [ ] No lint errors (`npm run lint`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm run test:e2e`)
- [ ] Git secrets configured
- [ ] Vercel project linked

## 🎉 Quick Start

```bash
# 1. Setup repository
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/mental-filter.git
git push -u origin main

# 2. Configure GitHub secrets
# (See Environment Variables section)

# 3. Link Vercel
vercel link

# 4. Push and watch CI run
git push
```

Done! 🚀
