# Testing Guide for URL Shortener API

This guide explains how to run the tests for the URL Shortener API.

## Types of Tests

### Unit Tests

Unit tests verify individual components in isolation:

- Service tests: Test business logic in isolation
- Controller tests: Test API endpoints with mocked services
- Entity tests: Validate entity structure
- DTO tests: Validate data transfer object validation

### Integration Tests

Integration tests verify that components work together correctly:

- API endpoints with actual database interactions
- Complete request/response flows
- Error handling across components

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### Integration Tests

```bash
# Run all e2e/integration tests
npm run test:e2e
```

## Test Structure

- `src/**/*.spec.ts` - Unit tests located alongside the files they test
- `test/*.e2e-spec.ts` - Integration/E2E tests
- `test/url-shortener.integration.spec.ts` - Specific integration tests for URL shortener

## Test Database

Integration tests use an in-memory SQLite database to avoid affecting your development or production database.

## Coverage Report

Run `npm run test:cov` to generate a coverage report. This will show which parts of the codebase are covered by tests.