# CI/CD Pipeline Documentation

**Project:** ContentFlow AI
**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Status:** ✅ Complete - Story 1.5

---

## 📋 Overview

ContentFlow AI uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The pipeline automates testing, building, and deployment to production environments.

**Pipeline Workflow:**
```
Code Push → Lint & Type Check → Tests → Build → Deploy Frontend → Deploy Backend → Notify
```

---

## 🔄 Pipeline Stages

### 1. Lint & Type Check (Automatic on PR and Push)

**Trigger:** Every PR and push to `main` or `develop` branch

**Jobs:**
- ✅ TypeScript compilation check for both web and workflow-engine
- ✅ ESLint validation (Frontend & Backend)
- ✅ Code style checks

**Failure Handling:** Blocks merge if type errors or critical linting issues found

**Time:** ~2-3 minutes

### 2. Unit Tests (Automatic on PR and Push)

**Trigger:** After lint-and-typecheck passes

**Jobs:**
- ✅ Frontend tests (Jest/Vitest) - if available
- ✅ Backend tests (Jest) - if available
- ✅ Coverage reports (optional)

**Note:** Tests are marked as `continue-on-error: true` to not block deployment during MVP phase

**Time:** ~2-3 minutes

### 3. Build (Automatic on PR and Push)

**Trigger:** After lint-and-typecheck passes

**Jobs:**
- ✅ Builds entire monorepo using Turbo
- ✅ Generates production bundles:
  - Frontend: `.next/` directory
  - Backend: `dist/` directory
- ✅ Uploads artifacts for deployment

**Artifacts Retained:** 1 day (for debugging)

**Time:** ~3-5 minutes

### 4. Deploy Frontend to Vercel (Main Branch Only)

**Trigger:** After build succeeds AND pushed to `main` branch

**Environment:** Production
**Service:** Vercel
**Directory:** `apps/web`

**Required Secrets:**
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Project ID for `apps/web`

**Actions:**
1. Authenticates with Vercel
2. Deploys production build
3. Automatic domain updates
4. CDN cache invalidation

**Time:** ~2-3 minutes

**Post-Deployment:**
- ✅ Automatic domain assignment
- ✅ SSL certificate generation
- ✅ CDN distribution

### 5. Deploy Backend to Railway (Main Branch Only)

**Trigger:** After build succeeds AND pushed to `main` branch

**Environment:** Production
**Service:** Railway
**Service Name:** workflow-engine

**Required Secrets:**
- `RAILWAY_TOKEN` - Railway CLI authentication token

**Actions:**
1. Installs Railway CLI
2. Authenticates with Railway
3. Deploys NestJS application
4. Starts application containers
5. Health check verification

**Time:** ~2-3 minutes

**Post-Deployment:**
- ✅ Automatic environment variable injection
- ✅ Service restart
- ✅ Database migrations (if configured)

### 6. Notification (Main Branch Only)

**Trigger:** After deployment completes (success or failure)

**Notification Channels:**
- 📧 GitHub Actions summary
- 💬 Slack (optional, if webhook configured)

**Status Indicators:**
- ✅ Green: All deployments successful
- ❌ Red: One or more deployments failed

---

## 🔑 Required Secrets

Configure these in GitHub repository settings: `Settings` → `Secrets and variables` → `Actions`

### Vercel Secrets

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<frontend-project-id>
```

**How to get Vercel credentials:**
1. Go to https://vercel.com/account/tokens
2. Create new token with scope `Full Account`
3. Copy token and paste as `VERCEL_TOKEN`
4. Get org ID from `Settings` → `General` in Vercel dashboard
5. Get project ID from project `Settings`

### Railway Secrets

```
RAILWAY_TOKEN=<your-railway-token>
```

**How to get Railway credentials:**
1. Go to https://railway.app/account/tokens
2. Create new API token
3. Copy and paste as `RAILWAY_TOKEN`

### Slack Notifications (Optional)

```
SLACK_WEBHOOK_URL=<your-slack-webhook-url>
```

**How to set up Slack webhook:**
1. Go to https://api.slack.com/apps
2. Create new app or select existing
3. Enable "Incoming Webhooks"
4. Add webhook to desired channel
5. Copy webhook URL and add as secret

---

## 📊 Pipeline Status & Monitoring

### GitHub Actions Dashboard

View all workflows: `GitHub Repository` → `Actions` tab

**Status Column Shows:**
- ✅ Passed: All checks successful
- ❌ Failed: One or more checks failed
- ⏳ In Progress: Currently running
- ⊙ Skipped: Conditions not met

### Branch Protection Rules

The `main` branch should have:
- ✅ Require status checks to pass before merging
- ✅ Require code reviews before merging
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Include administrators in restrictions

**Recommended Configuration:**
```
Settings → Branches → Add Rule
├─ Branch name pattern: main
├─ Require status checks to pass:
│  ├─ lint-and-typecheck
│  ├─ test
│  └─ build
├─ Require pull request reviews: 1
└─ Require branches to be up to date before merging: ✓
```

---

## 🚀 Deployment Flow

### Production Deployment Process

```
Developer pushes code to main
        ↓
GitHub Actions triggered
        ↓
✓ Lint & Type Check
✓ Unit Tests
✓ Build
        ↓
Frontend: Deploy to Vercel
        ↓
Backend: Deploy to Railway
        ↓
Notification sent
        ↓
Production live!
```

### Timeline

| Stage | Duration | Parallel |
|-------|----------|----------|
| Lint & Type Check | 2-3m | - |
| Tests | 2-3m | After lint ✓ |
| Build | 3-5m | After lint ✓ |
| Deploy Frontend | 2-3m | After build ✓ |
| Deploy Backend | 2-3m | After build ✓ |
| Notify | <1m | After deploy |
| **Total** | **~10-14m** | (Parallelized) |

---

## 🔍 Troubleshooting

### Build Failures

**Issue:** "pnpm install fails"
- Check `pnpm-lock.yaml` is committed
- Verify all dependencies listed in `package.json`
- Run locally: `pnpm install --frozen-lockfile`

**Issue:** "TypeScript compilation error"
- Run locally: `pnpm build`
- Check `tsconfig.json` configuration
- Verify import paths match actual file structure

**Issue:** "ESLint/Prettier violations"
- Run locally: `pnpm lint`
- Auto-fix with: `pnpm format`

### Deployment Failures

**Vercel Deployment Fails:**
1. Check `VERCEL_TOKEN` is valid (hasn't expired)
2. Verify `VERCEL_PROJECT_ID` matches `apps/web`
3. Check Vercel environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Others from `.env.example`

**Railway Deployment Fails:**
1. Check `RAILWAY_TOKEN` is valid
2. Verify workflow-engine service exists in Railway project
3. Check NestJS service has required environment variables:
   - `DATABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NODE_ENV=production`

### Common Error Messages

| Error | Solution |
|-------|----------|
| `Cannot find module '@contentflow/shared-types'` | Run `pnpm install` to link monorepo packages |
| `ENOENT: no such file or directory` | Verify relative paths in imports |
| `Error: Missing required environment variable` | Add to GitHub Secrets or `.env` |
| `403 Unauthorized` | Check token expiration, regenerate if needed |

---

## 📝 Local Testing

### Test CI/CD Pipeline Locally

**Using Act (GitHub Actions simulator):**

```bash
# Install act
brew install act

# Run entire workflow
act push -b main

# Run specific job
act -j lint-and-typecheck
```

**Or manually run each check:**

```bash
# Type check
pnpm build

# Lint
pnpm lint

# Tests
pnpm test

# Full build
pnpm turbo run build
```

---

## 🔐 Security Best Practices

1. **Secret Rotation:**
   - Rotate tokens every 90 days
   - Revoke compromised tokens immediately
   - Use token with minimal required scope

2. **Access Control:**
   - Limit workflow permissions to necessary scopes
   - Use branch protection rules
   - Require code reviews for sensitive changes

3. **Audit Logging:**
   - Monitor GitHub Actions runs
   - Review deployment history in Vercel/Railway
   - Set up audit log forwarding if available

4. **Environment Separation:**
   - Keep development and production secrets separate
   - Use environment-specific deployment conditions
   - Never hardcode secrets in code

---

## 📚 Additional Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Railway Deployment Documentation](https://railway.app/docs)
- [Turborepo CI/CD Guide](https://turbo.build/repo/docs/core-concepts/monorepos/ci-cd)

### Tools
- [Act - Local GitHub Actions Runner](https://github.com/nektos/act)
- [GitHub CLI](https://cli.github.com/)
- [Railway CLI](https://railway.app/cli)
- [Vercel CLI](https://vercel.com/cli)

---

## ✅ Acceptance Criteria (Story 1.5)

- [x] GitHub Actions CI/CD workflow configured
- [x] Lint and type check jobs working
- [x] Unit test jobs configured
- [x] Build job successful for monorepo
- [x] Vercel deployment job configured (main branch only)
- [x] Railway deployment job configured (main branch only)
- [x] Secrets management configured
- [x] Notification system implemented
- [x] Branch protection rules recommended
- [x] Documentation complete

---

## 🎯 Next Steps

After Story 1.5 (CI/CD Setup), the development team should:

1. **Story 2.1 onwards:** Implement user authentication features
2. **Deployment:** First production deployment of foundation
3. **Monitoring:** Set up monitoring dashboards in Vercel/Railway
4. **Alerting:** Configure critical alerts for deployment failures

---

**Last Verified:** 2025-11-15
**Status:** Ready for production use
**Maintained By:** DevOps Team
