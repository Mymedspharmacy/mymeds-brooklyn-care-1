# 🚀 GitHub Actions Setup Guide

This guide will help you set up the CI/CD pipeline for MyMeds Pharmacy using GitHub Actions.

## 📋 Prerequisites

- GitHub repository with admin access
- Railway account for backend deployment
- Vercel account for frontend deployment
- Slack workspace (optional, for notifications)

## 🔑 Required Secrets

### 1. Railway Token (RAILWAY_TOKEN)

**Purpose**: Deploy backend to Railway

**Steps to get**:
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your profile → Account Settings
3. Go to "Tokens" tab
4. Click "Create Token"
5. Give it a name (e.g., "MyMeds Backend Deployment")
6. Copy the token

**Add to GitHub**:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `RAILWAY_TOKEN`
4. Value: Paste your Railway token

### 2. Vercel Token (VERCEL_TOKEN)

**Purpose**: Deploy frontend to Vercel

**Steps to get**:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile → Settings
3. Go to "Tokens" tab
4. Click "Create Token"
5. Give it a name (e.g., "MyMeds Frontend Deployment")
6. Copy the token

**Add to GitHub**:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `VERCEL_TOKEN`
4. Value: Paste your Vercel token

### 3. Vercel Organization ID (VERCEL_ORG_ID)

**Purpose**: Identify which Vercel organization to deploy to

**Steps to get**:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Look at the URL: `https://vercel.com/dashboard/org/[ORG_ID]`
3. Copy the `[ORG_ID]` part

**Add to GitHub**:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `VERCEL_ORG_ID`
4. Value: Paste your organization ID

### 4. Vercel Project ID (VERCEL_PROJECT_ID)

**Purpose**: Identify which Vercel project to deploy to

**Steps to get**:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → General
4. Copy the "Project ID"

**Add to GitHub**:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `VERCEL_PROJECT_ID`
4. Value: Paste your project ID

### 5. Slack Webhook URL (SLACK_WEBHOOK_URL) - Optional

**Purpose**: Send deployment notifications to Slack

**Steps to get**:
1. Go to [Slack Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Give it a name and select your workspace
4. Go to "Incoming Webhooks"
5. Toggle "Activate Incoming Webhooks" to On
6. Click "Add New Webhook to Workspace"
7. Select a channel and click "Allow"
8. Copy the webhook URL

**Add to GitHub**:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Paste your webhook URL

## 🏗️ Project Setup

### 1. Railway Backend Setup

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the root directory to `backend`
5. Add environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   NEW_RELIC_LICENSE_KEY=your_new_relic_key
   ```

### 2. Vercel Frontend Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set the root directory to `/` (root)
5. Set build command: `npm run build`
6. Set output directory: `dist`
7. Add environment variables as needed

## 🔄 Workflow Triggers

The CI/CD pipeline will automatically run:

- **On Pull Requests**: Runs tests and security scans
- **On push to `develop`**: Deploys to staging environment
- **On push to `main`**: Deploys to production environment

## 📊 Monitoring

### 1. GitHub Actions
- Go to your repository → Actions tab
- Monitor workflow runs and deployment status
- Check logs for any errors

### 2. Railway
- Monitor backend deployment status
- Check logs and performance metrics
- Set up alerts for downtime

### 3. Vercel
- Monitor frontend deployment status
- Check analytics and performance
- Set up preview deployments for PRs

## 🚨 Troubleshooting

### Common Issues

#### 1. "Secret not found" errors
- Ensure all required secrets are added to your repository
- Check secret names match exactly (case-sensitive)
- Verify you have admin access to the repository

#### 2. Deployment failures
- Check the specific error in the GitHub Actions logs
- Verify your Railway/Vercel tokens are valid
- Ensure your projects exist and are accessible

#### 3. Build failures
- Check if all dependencies are properly installed
- Verify build commands work locally
- Check for TypeScript or linting errors

### Getting Help

1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are properly configured
3. Test deployment manually first
4. Check Railway and Vercel dashboards for project status

## 🎯 Next Steps

1. **Set up all required secrets** in your GitHub repository
2. **Configure Railway** for backend deployment
3. **Configure Vercel** for frontend deployment
4. **Test the pipeline** by pushing to the `develop` branch
5. **Monitor deployments** and set up alerts

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Slack API Documentation](https://api.slack.com/)

---

Once you've set up all the secrets, your CI/CD pipeline will automatically:
- ✅ Run tests on every PR
- ✅ Deploy to staging when pushing to `develop`
- ✅ Deploy to production when pushing to `main`
- ✅ Run security scans and performance tests
- ✅ Send notifications to Slack (if configured)




