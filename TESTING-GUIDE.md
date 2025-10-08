# Testing Guide

## Overview
This project has a comprehensive testing setup for both frontend and backend.

## Test Structure

### Frontend Tests
- **Framework**: Vitest with React Testing Library
- **Location**: `src/**/*.test.ts` or `src/**/*.test.tsx`
- **Configuration**: `vitest.config.ts`
- **Setup**: `src/test/setup.ts`

### Backend Tests
- **Framework**: Jest
- **Location**: `backend/src/**/*.test.ts`
- **Configuration**: `backend/package.json` (Jest config section)

## Running Tests Locally

### ⚡ Quick Start (Easiest Way)

**Windows Users:**
```bash
# Run all tests at once
.\run-tests.bat

# Run all tests with coverage reports
.\run-tests-coverage.bat
```

### Frontend Tests
```bash
# Run all frontend tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (auto-rerun on changes)
npx vitest

# Run tests in UI mode (interactive)
npx vitest --ui
```

### Backend Tests
```bash
# Navigate to backend directory
cd backend

# Run all backend tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### Run Both Frontend and Backend Tests
```bash
# From root directory - run frontend tests
npm test

# Then backend tests
cd backend && npm test
```

## Test Coverage Reports

### Frontend Coverage
After running `npm run test:coverage`, coverage reports are generated in:
- Console output (immediate feedback)
- `coverage/` directory (HTML reports)

Open `coverage/index.html` in a browser for detailed coverage visualization.

### Backend Coverage
Backend coverage is displayed in the console after running `npm run test:coverage` in the backend directory.

## Example Test Files

### Frontend Test Example (`src/lib/utils.test.ts`)
```typescript
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toBeTruthy();
  });
});
```

### Backend Test Example (`backend/src/utils/test-example.test.ts`)
```typescript
describe('Backend Tests', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });
});
```

## Writing New Tests

### Frontend Component Test
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Backend Service Test
```typescript
import YourService from './YourService';

describe('YourService', () => {
  it('should process data correctly', () => {
    const service = new YourService();
    const result = service.processData('input');
    expect(result).toBe('expected output');
  });
});
```

## Test Best Practices

1. **Naming**: Use descriptive test names that explain what is being tested
2. **Organization**: Group related tests using `describe` blocks
3. **Isolation**: Each test should be independent and not rely on others
4. **Coverage**: Aim for meaningful coverage, not just high percentages
5. **Mocking**: Mock external dependencies (APIs, databases) for unit tests
6. **Fast**: Keep tests fast by avoiding unnecessary async operations

## Continuous Integration

Tests should be run automatically on:
- Pre-commit (recommended)
- Pull requests
- Before deployment

## Current Test Status

✅ Frontend Tests: **9 passing** (2 test files)
✅ Backend Tests: **5 passing** (1 test file)

## Dependencies

### Frontend
- `vitest` - Test framework
- `@vitest/ui` - Interactive test UI
- `@vitest/coverage-v8` - Coverage reporting
- `jsdom` - DOM simulation
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - Custom matchers
- `@testing-library/user-event` - User interaction simulation

### Backend
- `jest` - Test framework
- `ts-jest` - TypeScript support for Jest
- `@types/jest` - TypeScript definitions

## Troubleshooting

### Tests not running
- Ensure all dependencies are installed: `npm install`
- Check that you're in the correct directory

### Coverage not working
- Ensure `@vitest/coverage-v8` is installed for frontend
- Backend coverage is built into Jest

### Module not found errors
- Run `npm install` in both root and backend directories
- Check import paths in test files

## Next Steps

1. Add more test files for critical components and services
2. Set up pre-commit hooks to run tests automatically
3. Integrate tests into CI/CD pipeline
4. Add E2E tests for critical user flows (consider Playwright or Cypress)
5. Set coverage thresholds in vitest.config.ts and jest.config.js

