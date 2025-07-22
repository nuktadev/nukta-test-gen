# nuktatestify

[![npm version](https://img.shields.io/npm/v/nuktatestify.svg)](https://www.npmjs.com/package/nuktatestify)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 🚀 **Generate comprehensive, production-ready Jest test cases for Express.js APIs with MongoDB support!**

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Advanced Usage](#advanced-usage)
- [Test Types](#test-types)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### 🎯 **Core Features**

- 🔍 **Intelligent route scanning** with middleware detection
- 📝 **Comprehensive test generation** for all HTTP methods
- ✅ **Multiple test types**: Unit, Integration, Authentication, Validation, Error Handling, Performance
- 🗂️ **Modular test structure** mirroring your codebase
- 🔒 **Security-focused testing** with authentication and authorization
- ⚡ **Performance testing** with load and stress tests

### 🛠️ **Advanced Features**

- 🗄️ **MongoDB integration** with in-memory database for testing
- 🔐 **JWT authentication testing** with token management
- 📊 **Test coverage reporting** with configurable thresholds
- 🎭 **Mock data generation** with realistic test data
- 🧪 **Test fixtures and helpers** for reusable test utilities
- 📈 **Performance benchmarking** with response time validation
- 🛡️ **Security testing** for common vulnerabilities

### 🎨 **Developer Experience**

- 🎯 **Smart route analysis** with middleware detection
- 📋 **Detailed logging** with verbose mode
- 🔍 **Dry-run capability** to preview generated tests
- 📝 **Comprehensive documentation** and examples
- 🚀 **Zero-config setup** with sensible defaults

---

## Installation

### Global Installation (Recommended)

```bash
npm install -g nuktatestify
```

### Local Installation

```bash
npm install --save-dev nuktatestify
```

---

## Quick Start

Navigate to your Express.js project root and run:

```bash
# Basic usage
nuktatestify

# With verbose logging
nuktatestify --verbose

# Modular structure with all test types
nuktatestify --modular --auth-tests --validation-tests --error-tests --integration-tests --verbose
```

---

## Advanced Usage

### Command Line Options

| Option                 | Description                                      | Default   |
| ---------------------- | ------------------------------------------------ | --------- |
| `--src, -s`            | Source directory to scan                         | `src`     |
| `--out, -o`            | Output directory for test files                  | `tests`   |
| `--ext, -e`            | Test file extension (`test.js` or `spec.js`)     | `test.js` |
| `--modular, -m`        | Generate modular test structure                  | `false`   |
| `--auth-tests`         | Include authentication tests                     | `true`    |
| `--validation-tests`   | Include validation tests                         | `true`    |
| `--error-tests`        | Include error handling tests                     | `true`    |
| `--integration-tests`  | Include integration tests                        | `true`    |
| `--performance-tests`  | Include performance tests                        | `false`   |
| `--database-type`      | Database type (`mongodb`, `postgresql`, `mysql`) | `mongodb` |
| `--generate-fixtures`  | Generate test fixtures                           | `true`    |
| `--generate-helpers`   | Generate test helper utilities                   | `true`    |
| `--coverage-threshold` | Minimum test coverage (0-100)                    | `80`      |
| `--dry-run`            | Preview without writing files                    | `false`   |
| `--verbose`            | Enable verbose logging                           | `false`   |

### Example Commands

```bash
# Generate comprehensive tests for MongoDB project
nuktatestify \
  --src src/app \
  --out tests \
  --modular \
  --auth-tests \
  --validation-tests \
  --error-tests \
  --integration-tests \
  --performance-tests \
  --database-type mongodb \
  --generate-fixtures \
  --generate-helpers \
  --coverage-threshold 85 \
  --verbose

# Generate tests for specific modules only
nuktatestify \
  --src src/app/modules/auth \
  --out tests/auth \
  --modular \
  --auth-tests \
  --verbose

# Dry run to preview generated tests
nuktatestify \
  --src src/app \
  --out tests \
  --modular \
  --dry-run \
  --verbose
```

---

## Test Types

### 1. **Basic Functionality Tests**

- HTTP method validation
- Response status code checks
- Response structure validation
- Content-Type verification

### 2. **Authentication Tests**

- JWT token validation
- Authentication middleware testing
- Unauthorized access prevention
- Token refresh functionality

### 3. **Validation Tests**

- Required field validation
- Data type validation
- Input sanitization
- Custom validation rules

### 4. **Error Handling Tests**

- 404 Not Found scenarios
- 400 Bad Request handling
- 500 Internal Server Error
- Graceful error responses

### 5. **Integration Tests**

- Complete CRUD operations
- Database interactions
- External service integration
- End-to-end workflows

### 6. **Performance Tests**

- Response time validation
- Concurrent request handling
- Memory usage monitoring
- Load testing scenarios

---

## Configuration

### Jest Configuration

The tool generates a comprehensive Jest configuration:

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
    "!src/app.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
```

### Test Setup

Generated test setup with MongoDB in-memory server:

```typescript
// tests/setup.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

---

## Best Practices

### 1. **Test Organization**

```
tests/
├── setup.ts                 # Global test setup
├── helpers/
│   ├── testHelper.js        # Test utilities
│   └── mockData.js          # Mock data generators
├── fixtures/
│   └── testData.js          # Test fixtures
├── auth/
│   ├── auth.test.js         # Authentication tests
│   └── auth.integration.js  # Integration tests
├── user/
│   ├── user.test.js         # User module tests
│   └── user.performance.js  # Performance tests
└── __mocks__/               # Jest mocks
```

### 2. **Test Structure**

```javascript
describe("Module Name", () => {
  // Setup and teardown
  beforeAll(async () => {
    // Setup test environment
  });

  afterAll(async () => {
    // Cleanup
  });

  beforeEach(async () => {
    // Reset state before each test
  });

  // Test groups
  describe("Authentication", () => {
    // Auth-related tests
  });

  describe("Validation", () => {
    // Validation tests
  });

  describe("Error Handling", () => {
    // Error scenarios
  });
});
```

### 3. **Mock Data Management**

```javascript
// Use realistic test data
const mockUser = {
  email: "test@example.com",
  password: "password123",
  name: "Test User",
  role: "user",
};

// Generate unique data for each test
const uniqueEmail = `test${Date.now()}@example.com`;
```

### 4. **Database Testing**

```javascript
// Use in-memory database for tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

// Clean up after each test
afterEach(async () => {
  await cleanupDatabase();
});
```

---

## Examples

### Generated Test Example

```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Auth Module', () => {
  let mongoServer: MongoMemoryServer;
  let app: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    app = require('../../src/app');
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('POST /auth/login - Authentication', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: process.env.TEST_USER_EMAIL || 'test@example.com',
          password: process.env.TEST_USER_PASSWORD || 'password123'
        });

      authToken = loginResponse.body.data.accessToken;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should work with valid authentication', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBeOneOf([200, 201]);
      expect(response.body).toBeDefined();
    });
  });

  describe('POST /auth/login - Validation', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should validate field types', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 123
      };

      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});
```

---

## FAQ

**Q: Does it work with TypeScript projects?**

- Yes! It fully supports TypeScript with proper type definitions and ts-jest configuration.

**Q: Can I customize the generated tests?**

- Absolutely! The generated tests are fully customizable. You can modify templates, add custom test cases, and extend functionality.

**Q: Does it support other databases?**

- Currently optimized for MongoDB, but supports PostgreSQL and MySQL with basic configurations.

**Q: How do I handle environment variables in tests?**

- The tool generates test setup that handles environment variables and provides fallbacks for testing.

**Q: Can I run specific test types?**

- Yes! Use Jest's test patterns: `npm run test:auth`, `npm run test:integration`, etc.

**Q: How do I add custom test utilities?**

- The tool generates a `helpers/` directory where you can add custom test utilities and mock data.

---

## Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/nuktadev/nuktatestify.git
cd nuktatestify
npm install
npm run build
npm link
```

---

## License

[MIT](LICENSE) - feel free to use this project in any way you want.

---

## Support

- 📧 **Email**: support@nukta.dev
- 🐛 **Issues**: [GitHub Issues](https://github.com/nuktadev/nuktatestify/issues)
- 📖 **Documentation**: [Full Documentation](comming soon...)

---

**Made with ❤️ by the Nukta Nur**
