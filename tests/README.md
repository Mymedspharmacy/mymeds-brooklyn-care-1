# MyMeds Test Suite

This folder contains all test files for the MyMeds application.

## Test Files

### API Tests
- `test-all-apis.cjs` - Comprehensive API endpoint testing
- `test-apis.cjs` - Basic API functionality tests
- `test-apis.js` - Alternative API test implementation

### Integration Tests
- `test-guest-checkout.cjs` - Guest checkout flow testing
- `test-smtp-service.cjs` - Email service testing
- `PATIENT_PORTAL_COMPREHENSIVE_TEST.cjs` - Patient portal comprehensive testing

### Test Runner
- `run-tests.cjs` - Unified test runner for all test suites

### Test Results
- `api-test-results.json` - Latest API test results

## Running Tests

### Using Test Runner (Recommended)
```bash
# Show available tests
node tests/run-tests.cjs help

# Run specific test suite
node tests/run-tests.cjs api
node tests/run-tests.cjs guest-checkout
node tests/run-tests.cjs smtp

# Run all tests
node tests/run-tests.cjs all
```

### Direct Execution
```bash
# Run comprehensive API tests
node tests/test-all-apis.cjs

# Run basic API tests
node tests/test-apis.cjs

# Test guest checkout
node tests/test-guest-checkout.cjs

# Test SMTP service
node tests/test-smtp-service.cjs

# Test patient portal
node tests/PATIENT_PORTAL_COMPREHENSIVE_TEST.cjs
```

## Test Categories

1. **Health Checks** - Server and database health
2. **Authentication** - User registration, login, logout
3. **User Management** - Profile management
4. **Products** - Product catalog and search
5. **Orders** - Order management
6. **Prescriptions** - Prescription handling
7. **Appointments** - Appointment scheduling
8. **Blogs** - Content management
9. **Contact** - Contact form handling
10. **Newsletter** - Newsletter subscription
11. **Payments** - Payment processing
12. **Reviews** - Product reviews
13. **Cart** - Shopping cart functionality
14. **Refill Requests** - Prescription refills
15. **Transfer Requests** - Prescription transfers
16. **Notifications** - User notifications
17. **Analytics** - Data analytics
18. **Patient Portal** - Patient-specific features
19. **Settings** - User settings
20. **Monitoring** - System monitoring
21. **OpenFDA** - Drug information integration
22. **WooCommerce** - E-commerce integration
23. **WordPress** - CMS integration

## Prerequisites

- Backend server running on port 4000
- Database connection (for full tests)
- Required environment variables configured

## Notes

- Some tests may fail in development environment due to missing database
- Test results are saved to `api-test-results.json`
- All tests use axios for HTTP requests
