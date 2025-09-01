# Backend Tests

This folder contains all test files for the MyMeds backend.

## 📁 Test Structure

### 🧪 Test Categories

1. **Unit Tests** - Individual function and module testing
2. **Integration Tests** - API endpoint and database integration testing
3. **Security Tests** - Authentication and authorization testing
4. **Performance Tests** - Load and stress testing
5. **Database Tests** - Database operations and migrations testing

## 🚀 Running Tests

### Prerequisites
- Node.js installed
- Database connection configured
- Environment variables set up
- Dependencies installed (`npm install`)

### Basic Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/auth.test.js

# Run tests in CI mode
npm run test:ci
```

### Test Configuration
Tests are configured using `jest.config.js` located in `scripts/config/`.

## 📋 Test Files

### Authentication Tests
- User registration and login
- JWT token validation
- Password hashing and verification
- Admin user authentication

### API Endpoint Tests
- Health check endpoints
- User management endpoints
- Product management endpoints
- Order processing endpoints
- Prescription management endpoints

### Database Tests
- Connection testing
- Migration testing
- Query performance testing
- Data integrity testing

### Security Tests
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

## 🔧 Test Utilities

### Test Helpers
- Database setup and teardown
- Mock data generation
- Authentication helpers
- API request helpers

### Test Data
- Sample user data
- Sample product data
- Sample order data
- Sample prescription data

## 📊 Test Coverage

The test suite aims for:
- **90%+ Code Coverage** - Comprehensive testing of all functions
- **100% Critical Path Coverage** - All essential user flows tested
- **Security Testing** - All security measures verified
- **Performance Testing** - Load testing under various conditions

## 🚨 Test Failures

### Common Issues
1. **Database Connection** - Ensure database is running and accessible
2. **Environment Variables** - Check all required env vars are set
3. **Dependencies** - Ensure all packages are installed
4. **Port Conflicts** - Check if test port is available

### Debugging
```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test with debugging
npm test -- --runInBand --detectOpenHandles

# Run tests with specific environment
NODE_ENV=test npm test
```

## 📝 Writing Tests

### Test Structure
```javascript
describe('User Authentication', () => {
  beforeEach(() => {
    // Setup test data
  });

  afterEach(() => {
    // Cleanup test data
  });

  it('should register a new user', async () => {
    // Test implementation
  });

  it('should login existing user', async () => {
    // Test implementation
  });
});
```

### Best Practices
1. **Descriptive Test Names** - Clear, descriptive test names
2. **Isolated Tests** - Each test should be independent
3. **Proper Setup/Teardown** - Clean test environment
4. **Mock External Dependencies** - Don't rely on external services
5. **Test Data Management** - Use consistent test data

## 🔒 Security Testing

### Authentication Tests
- JWT token generation and validation
- Password hashing and verification
- Session management
- Role-based access control

### Input Validation Tests
- SQL injection prevention
- XSS protection
- Input sanitization
- Rate limiting

### API Security Tests
- CORS configuration
- HTTPS enforcement
- Request validation
- Error handling

## 📈 Performance Testing

### Load Testing
- Concurrent user simulation
- Database query optimization
- Memory usage monitoring
- Response time analysis

### Stress Testing
- High load scenarios
- Database connection limits
- Memory leak detection
- Error handling under load

## 🛠️ Test Environment

### Configuration
- **Test Database** - Separate test database
- **Environment Variables** - Test-specific configuration
- **Mock Services** - External service mocking
- **Test Data** - Consistent test datasets

### Tools Used
- **Jest** - Test framework
- **Supertest** - API testing
- **Prisma** - Database testing
- **JWT** - Token testing

## 📚 Test Documentation

### API Testing
- Endpoint documentation
- Request/response examples
- Error scenarios
- Authentication requirements

### Database Testing
- Schema validation
- Migration testing
- Query performance
- Data integrity

### Security Testing
- Vulnerability assessment
- Penetration testing
- Security best practices
- Compliance requirements
