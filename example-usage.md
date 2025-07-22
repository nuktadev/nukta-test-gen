# nuktatestify Enhanced Usage Guide

## Overview

This guide demonstrates how to use the enhanced nuktatestify CLI to generate comprehensive, production-ready tests for your PassPE backend project.

## Installation

```bash
npm install -g nuktatestify
```

2. **Navigate to your PassPE backend project:**

   ```bash
   cd passpe-backend
   ```

3. **Install required testing dependencies:**
   ```bash
   npm install --save-dev jest supertest mongodb-memory-server @types/jest @types/supertest ts-jest
   ```

---

## Basic Usage

```bash
nuktatestify --src src/app --out tests --verbose
```

This will:

- Scan all routes in `src/app`
- Generate basic test files in `tests/`
- Include status code and response validation

### 2. **Generate Comprehensive Tests (Recommended)**

```bash
# Generate comprehensive tests with all features
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
```

This will generate:

- ✅ Modular test structure mirroring your codebase
- ✅ Authentication tests for protected routes
- ✅ Validation tests for input validation
- ✅ Error handling tests
- ✅ Integration tests with MongoDB
- ✅ Performance tests
- ✅ Test fixtures and helper utilities
- ✅ 85% coverage threshold

### 3. **Generate Tests for Specific Modules**

```bash
# Generate tests for authentication module only
nuktatestify \
  --src src/app/modules/auth \
  --out tests/auth \
  --modular \
  --auth-tests \
  --validation-tests \
  --verbose

# Generate tests for user management
nuktatestify \
  --src src/app/modules/user \
  --out tests/user \
  --modular \
  --auth-tests \
  --validation-tests \
  --integration-tests \
  --verbose
```

### 4. **Dry Run (Preview Mode)**

```bash
# Preview what would be generated without creating files
nuktatestify \
  --src src/app \
  --out tests \
  --modular \
  --auth-tests \
  --validation-tests \
  --error-tests \
  --integration-tests \
  --dry-run \
  --verbose
```

---

## Generated Test Structure

After running the CLI, you'll get a comprehensive test structure:

```
passpe-backend/
├── tests/
│   ├── setup.ts                    # Global test setup
│   ├── jest.config.js              # Jest configuration
│   ├── helpers/
│   │   ├── testHelper.js           # Test utilities
│   │   └── mockData.js             # Mock data generators
│   ├── fixtures/
│   │   └── testData.js             # Test fixtures
│   ├── auth/
│   │   ├── auth.route.test.js      # Authentication tests
│   │   └── auth.integration.test.js # Integration tests
│   ├── user/
│   │   ├── user.model.test.js      # User model tests
│   │   └── user.type.test.js       # Type validation tests
│   ├── package/
│   │   ├── package.route.test.js   # Package route tests
│   │   └── package.service.test.js # Service layer tests
│   ├── course/
│   │   ├── courses.route.test.js   # Course route tests
│   │   └── courses.integration.test.js # Integration tests
│   └── ... (other modules)
```

---

## Example Generated Test Files

### 1. **Authentication Test Example**

```javascript
// tests/auth/auth.route.test.js
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
      // Create test user first
      const user = await createTestUser({
        email: 'test@example.com',
        password: 'password123'
      });

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.data.accessToken;
    });

    it('should require valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Email or Password is incorrect');
    });

    it('should return access token on successful login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
    });

    it('should set refresh token cookie', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('set-cookie');
      expect(response.headers['set-cookie'][0]).toContain('refreshToken');
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

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login - Error Handling', () => {
    it('should handle blocked user status', async () => {
      // Create a blocked user
      await createTestUser({
        email: 'blocked@example.com',
        password: 'password123',
        status: 'blocked'
      });

      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'blocked@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Suspended');
    });

    it('should handle declined user status', async () => {
      // Create a declined user
      await createTestUser({
        email: 'declined@example.com',
        password: 'password123',
        status: 'declined'
      });

      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'declined@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Email or Password is incorrect');
    });
  });

  describe('POST /auth/login - Performance', () => {
    it('should respond within acceptable time limit', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // 1 second limit
      expect(response.status).toBeLessThan(500);
    });

    it('should handle concurrent login requests', async () => {
      const concurrentRequests = 5;
      const promises = Array(concurrentRequests).fill(null).map(() =>
        request(app)
          .post('/auth/login')
          .set('Content-Type', 'application/json')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });
  });
});
```

### 2. **Integration Test Example**

```javascript
// tests/auth/auth.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Auth Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let app: any;
  let authToken: string;

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

  describe('Complete Authentication Flow', () => {
    it('should perform complete authentication workflow', async () => {
      // 1. Register a new user
      const registerResponse = await request(app)
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          role: 'student'
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.data).toHaveProperty('user');
      expect(registerResponse.body.data.user.email).toBe('newuser@example.com');

      // 2. Login with the new user
      const loginResponse = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      authToken = loginResponse.body.data.accessToken;

      // 3. Access protected route
      const protectedResponse = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json');

      expect(protectedResponse.status).toBe(200);
      expect(protectedResponse.body.data).toHaveProperty('email', 'newuser@example.com');

      // 4. Change password
      const changePasswordResponse = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(changePasswordResponse.status).toBe(200);

      // 5. Login with new password
      const newLoginResponse = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'newuser@example.com',
          password: 'newpassword123'
        });

      expect(newLoginResponse.status).toBe(200);
    });
  });
});
```

---

## Running the Generated Tests

### 1. **Add Test Scripts to package.json**

```json
{
  "scripts": {
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose",
    "test:debug": "jest --detectOpenHandles --verbose --runInBand",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:auth": "jest --testPathPattern=auth",
    "test:performance": "jest --testPathPattern=performance"
  }
}
```

### 2. **Run Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test types
npm run test:auth
npm run test:integration
npm run test:performance

# Run tests for specific modules
npx jest tests/auth/
npx jest tests/user/
```

### 3. **Test Coverage Report**

```bash
npm run test:coverage
```

This will generate a coverage report showing:

- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

---

## Customization and Best Practices

### 1. **Custom Test Helpers**

Edit `tests/helpers/testHelper.js` to add custom utilities:

```javascript
// tests/helpers/testHelper.js
class TestHelper {
  // ... existing methods ...

  static async createTestStudent(studentData = {}) {
    const defaultData = {
      email: `student${this.generateTestId().substring(0, 8)}@example.com`,
      password: await bcrypt.hash("password123", 10),
      name: `Test Student ${this.generateTestId().substring(0, 8)}`,
      role: "student",
      status: "active",
      studentId: `STU${this.generateTestId().substring(0, 8)}`,
    };

    const Student = mongoose.model("Student");
    const student = new Student({ ...defaultData, ...studentData });
    return await student.save();
  }

  static async createTestInstructor(instructorData = {}) {
    const defaultData = {
      email: `instructor${this.generateTestId().substring(0, 8)}@example.com`,
      password: await bcrypt.hash("password123", 10),
      name: `Test Instructor ${this.generateTestId().substring(0, 8)}`,
      role: "instructor",
      status: "active",
      specialization: "Computer Science",
    };

    const Instructor = mongoose.model("Instructor");
    const instructor = new Instructor({ ...defaultData, ...instructorData });
    return await instructor.save();
  }

  static async createTestCourse(courseData = {}) {
    const defaultData = {
      title: `Test Course ${this.generateTestId().substring(0, 8)}`,
      description: `Test course description ${this.generateTestId().substring(0, 8)}`,
      price: Math.floor(Math.random() * 1000) + 10,
      duration: Math.floor(Math.random() * 100) + 1,
      instructor: await this.createTestInstructor().then((i) => i._id),
      category: "Programming",
      status: "active",
    };

    const Course = mongoose.model("Course");
    const course = new Course({ ...defaultData, ...courseData });
    return await course.save();
  }
}
```

### 2. **Custom Test Fixtures**

Edit `tests/fixtures/testData.js` to add domain-specific test data:

```javascript
// tests/fixtures/testData.js
const fixtures = {
  // ... existing fixtures ...

  students: [
    {
      email: "student1@example.com",
      password: "password123",
      name: "John Student",
      role: "student",
      studentId: "STU001",
      enrollmentDate: new Date("2024-01-01"),
    },
    {
      email: "student2@example.com",
      password: "password123",
      name: "Jane Student",
      role: "student",
      studentId: "STU002",
      enrollmentDate: new Date("2024-01-15"),
    },
  ],

  instructors: [
    {
      email: "instructor1@example.com",
      password: "password123",
      name: "Dr. Smith",
      role: "instructor",
      specialization: "Computer Science",
      experience: 5,
    },
    {
      email: "instructor2@example.com",
      password: "password123",
      name: "Prof. Johnson",
      role: "instructor",
      specialization: "Mathematics",
      experience: 8,
    },
  ],

  courses: [
    {
      title: "Introduction to Programming",
      description: "Learn the basics of programming",
      price: 99.99,
      duration: 30,
      category: "Programming",
      level: "Beginner",
    },
    {
      title: "Advanced Web Development",
      description: "Master modern web development",
      price: 199.99,
      duration: 60,
      category: "Web Development",
      level: "Advanced",
    },
  ],

  packages: [
    {
      name: "Basic Package",
      description: "Basic learning package",
      price: 49.99,
      duration: 30,
      features: ["Basic courses", "Email support"],
    },
    {
      name: "Premium Package",
      description: "Premium learning package",
      price: 99.99,
      duration: 90,
      features: ["All courses", "Priority support", "Live sessions"],
    },
  ],
};
```

### 3. **Environment Variables for Testing**

Create `.env.test` file:

```env
# Test Environment Variables
NODE_ENV=test
JWT_SECRET=test-secret-key
MONGODB_URI=mongodb://localhost:27017/passpe-test
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=admin123
```

---

## Advanced Usage Scenarios

### 1. **Testing with Real Database**

```bash
# Use real MongoDB for integration tests
nuktatestify \
  --src src/app \
  --out tests \
  --modular \
  --integration-tests \
  --database-type mongodb \
  --mock-database false \
  --verbose
```

### 2. **Performance Testing**

```bash
# Generate performance tests
nuktatestify \
  --src src/app \
  --out tests \
  --performance-tests \
  --test-timeout 30000 \
  --verbose
```

### 3. **Security Testing**

```bash
# Generate security-focused tests
nuktatestify \
  --src src/app \
  --out tests \
  --include-security \
  --include-rate-limiting \
  --verbose
```

---

## Troubleshooting

### Common Issues and Solutions

1. **MongoDB Connection Issues**

   ```bash
   # Ensure MongoDB is running
   sudo systemctl start mongod

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Jest Configuration Issues**

   ```bash
   # Clear Jest cache
   npx jest --clearCache

   # Run with verbose output
   npx jest --verbose
   ```

3. **TypeScript Compilation Issues**

   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit

   # Install missing types
   npm install --save-dev @types/node @types/express
   ```

4. **Test Timeout Issues**
   ```bash
   # Increase timeout for slow tests
   npx jest --testTimeout=30000
   ```

---

## Next Steps

1. **Review Generated Tests**: Go through the generated tests and customize them for your specific business logic
2. **Add Custom Test Cases**: Extend the generated tests with domain-specific scenarios
3. **Set Up CI/CD**: Integrate tests into your CI/CD pipeline
4. **Monitor Coverage**: Track test coverage and maintain high standards
5. **Performance Testing**: Add load testing for critical endpoints
6. **Security Testing**: Implement security-focused test cases

---

This enhanced CLI will generate production-ready, comprehensive tests that follow senior testing best practices for your PassPE backend project!
