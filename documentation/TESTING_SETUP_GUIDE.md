# 🧪 Testing Setup Guide

This guide covers the comprehensive testing infrastructure setup for MyMeds Pharmacy, including Jest, React Testing Library, API testing, monitoring, CI/CD, and load testing.

## 📋 Table of Contents

1. [Frontend Testing Setup](#frontend-testing-setup)
2. [Backend Testing Setup](#backend-testing-setup)
3. [Monitoring Setup](#monitoring-setup)
4. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
5. [Load Testing Setup](#load-testing-setup)
6. [Running Tests](#running-tests)
7. [Test Coverage](#test-coverage)
8. [Troubleshooting](#troubleshooting)

## 🎯 Frontend Testing Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Install testing dependencies
npm install

# Verify Jest installation
npx jest --version
```

### Configuration Files
- `jest.config.js` - Jest configuration
- `src/test/setup.ts` - Test environment setup
- `src/test/mocks/` - API mocking with MSW
- `src/test/utils/test-utils.tsx` - Test utilities

### Running Frontend Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## 🔧 Backend Testing Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Prisma CLI

### Installation
```bash
cd backend

# Install testing dependencies
npm install

# Verify Jest installation
npx jest --version
```

### Configuration Files
- `backend/jest.config.js` - Jest configuration
- `backend/src/test/setup.ts` - Test environment setup
- `backend/src/test/utils/test-utils.ts` - Test utilities
- `backend/env.test.example` - Test environment template

### Environment Setup
```bash
cd backend

# Copy test environment template
cp env.test.example .env.test

# Update .env.test with your test database credentials
# Ensure TEST_DATABASE_URL points to a test database
```

### Database Setup
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations on test database
npx prisma db push --accept-data-loss
```

### Running Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## 📊 Monitoring Setup

### New Relic APM

#### 1. Account Setup
1. Create account at [New Relic](https://newrelic.com)
2. Get your license key from the account settings

#### 2. Environment Variables
```bash
# Add to your production environment
NEW_RELIC_LICENSE_KEY="your-license-key-here"
NEW_RELIC_HOST_DISPLAY_NAME="MyMeds Pharmacy Backend"
NEW_RELIC_LOG_LEVEL="info"
```

#### 3. Configuration
- `backend/newrelic.js` - New Relic configuration
- Automatically loaded in `backend/src/index.ts`

#### 4. Features Enabled
- ✅ Application Performance Monitoring
- ✅ Error tracking and alerting
- ✅ Database query monitoring
- ✅ Distributed tracing
- ✅ Custom metrics
- ✅ Application logging

## 🚀 CI/CD Pipeline Setup

### GitHub Actions

#### 1. Repository Secrets
Add these secrets to your GitHub repository:

```bash
# Railway deployment
RAILWAY_TOKEN="your-railway-token"

# Vercel deployment
VERCEL_TOKEN="your-vercel-token"
VERCEL_ORG_ID="your-vercel-org-id"
VERCEL_PROJECT_ID="your-vercel-project-id"

# Slack notifications
SLACK_WEBHOOK_URL="your-slack-webhook-url"

# New Relic
NEW_RELIC_LICENSE_KEY="your-new-relic-license-key"
```

#### 2. Pipeline Features
- ✅ Automated testing on PR and push
- ✅ Security scanning with Trivy
- ✅ Staging deployment (develop branch)
- ✅ Production deployment (main branch)
- ✅ Performance testing with Lighthouse CI
- ✅ Load testing with Artillery
- ✅ Slack notifications
- ✅ Deployment summaries

#### 3. Workflow Triggers
- **Push to main**: Production deployment
- **Push to develop**: Staging deployment
- **Pull requests**: Testing and security scanning

## 📈 Load Testing Setup

### Artillery

#### 1. Installation
```bash
# Global installation
npm install -g artillery

# Or local installation
npm install artillery --save-dev
```

#### 2. Configuration Files
- `load-tests/artillery-config.yml` - Load test configuration
- `load-tests/processors.js` - Custom test data generators

#### 3. Running Load Tests
```bash
# Run against production
artillery run load-tests/artillery-config.yml

# Run against staging
artillery run load-tests/artillery-config.yml --environment staging

# Run with custom target
artillery run load-tests/artillery-config.yml --target https://your-domain.com
```

#### 4. Test Scenarios
- **Public Pages**: Homepage, About, Services, Contact
- **Shop Browsing**: Product listing, product details
- **User Authentication**: Login, registration
- **API Health Checks**: Health endpoints

#### 5. Load Phases
- **Warm up**: 5 users/second for 1 minute
- **Ramp up**: 10 users/second for 2 minutes
- **Sustained load**: 20 users/second for 5 minutes
- **Peak load**: 50 users/second for 2 minutes
- **Cool down**: 5 users/second for 1 minute

## 🏃‍♂️ Running Tests

### Quick Start
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# Load tests
artillery run load-tests/artillery-config.yml

# Performance tests
npm run lighthouse
```

### Test Commands Reference

#### Frontend
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
npm run test:ci       # CI mode
npm run lint          # Linting
npm run build         # Build
```

#### Backend
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
npm run test:ci       # CI mode
npm run test:unit     # Unit tests only
npm run test:integration # Integration tests only
```

#### Load Testing
```bash
# Basic load test
artillery run load-tests/artillery-config.yml

# Custom environment
artillery run load-tests/artillery-config.yml --environment staging

# Custom target
artillery run load-tests/artillery-config.yml --target https://staging.example.com

# Generate HTML report
artillery run --output artillery-report.json load-tests/artillery-config.yml
artillery report artillery-report.json
```

## 📊 Test Coverage

### Coverage Targets
- **Frontend**: 70% minimum
- **Backend**: 70% minimum
- **Overall**: 70% minimum

### Coverage Reports
```bash
# Frontend coverage
npm run test:coverage
# View: coverage/lcov-report/index.html

# Backend coverage
cd backend && npm run test:coverage
# View: backend/coverage/lcov-report/index.html
```

### Coverage Configuration
- Excludes test files and build artifacts
- Includes all source code
- Generates HTML and LCOV reports
- Uploads to Codecov in CI

## 🔍 Troubleshooting

### Common Issues

#### 1. Jest Configuration
```bash
# Clear Jest cache
npx jest --clearCache

# Run with verbose output
npx jest --verbose
```

#### 2. Database Connection
```bash
# Check database connection
cd backend
npx prisma db push --accept-data-loss

# Reset test database
npm run test:integration
```

#### 3. MSW Issues
```bash
# Clear MSW cache
# Restart test runner
npm run test:watch
```

#### 4. New Relic Issues
```bash
# Check environment variables
echo $NEW_RELIC_LICENSE_KEY

# Verify configuration
node -e "console.log(require('./newrelic.js'))"
```

#### 5. Load Test Issues
```bash
# Check network connectivity
curl -I https://your-domain.com

# Verify Artillery installation
artillery --version

# Run with debug output
artillery run --debug load-tests/artillery-config.yml
```

### Performance Issues

#### 1. Slow Tests
- Reduce test database operations
- Use mocks for external services
- Optimize test data generation

#### 2. Memory Issues
- Clean up test data after each test
- Use `afterEach` and `afterAll` hooks
- Monitor memory usage in CI

#### 3. Load Test Failures
- Check target application health
- Verify network connectivity
- Adjust load test parameters

## 📚 Additional Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/docs/)
- [Artillery Documentation](https://www.artillery.io/docs/)
- [New Relic Documentation](https://docs.newrelic.com/)
- [GitHub Actions](https://docs.github.com/en/actions)

### Best Practices
- Write tests before implementing features (TDD)
- Use descriptive test names
- Test edge cases and error conditions
- Keep tests independent and isolated
- Use meaningful test data
- Mock external dependencies
- Test user interactions, not implementation details

### Monitoring and Alerts
- Set up New Relic alerts for error rates
- Monitor test execution times
- Track coverage trends
- Set up Slack notifications for test failures
- Monitor CI/CD pipeline health

---

## 🎉 Next Steps

1. **Run the test suite** to verify everything is working
2. **Set up New Relic** monitoring in production
3. **Configure GitHub Actions** with your secrets
4. **Set up load testing** against your staging environment
5. **Monitor performance** and adjust thresholds as needed

For questions or issues, check the troubleshooting section or create an issue in the repository.





