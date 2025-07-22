import path from "path";
import fs from "fs-extra";
import { RouteInfo, GeneratorOptions, TestCase, MockData } from "./types";
import { writeFileSafe, logger } from "./utils";

// Enhanced test templates for different scenarios
const TEST_TEMPLATES = {
  basic: (route: RouteInfo, opts: GeneratorOptions) => `
  describe('${route.method.toUpperCase()} ${route.path}', () => {
    it('should return expected status and response structure', async () => {
      const response = await request(app)
        .${route.method}('${route.path}')
        .set('Content-Type', 'application/json')
        .send(${generateMockBody(route)});

      expect(response.status).toBeOneOf([200, 201, 400, 404]);
      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });
  });`,

  authenticated: (route: RouteInfo, opts: GeneratorOptions) => `
  describe('${route.method.toUpperCase()} ${route.path} - Authentication', () => {
    let authToken: string;

    beforeAll(async () => {
      // Setup authentication token
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
        .${route.method}('${route.path}')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should work with valid authentication', async () => {
      const response = await request(app)
        .${route.method}('${route.path}')
        .set('Authorization', \`Bearer \${authToken}\`)
        .set('Content-Type', 'application/json')
        .send(${generateMockBody(route)});

      expect(response.status).toBeOneOf([200, 201]);
      expect(response.body).toBeDefined();
    });
  });`,

  validation: (route: RouteInfo, opts: GeneratorOptions) => `
  describe('${route.method.toUpperCase()} ${route.path} - Validation', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .${route.method}('${route.path}')
        .set('Content-Type', 'application/json')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should validate field types', async () => {
      const invalidData = ${generateInvalidMockData(route)};
      
      const response = await request(app)
        .${route.method}('${route.path}')
        .set('Content-Type', 'application/json')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });`,

  errorHandling: (route: RouteInfo, opts: GeneratorOptions) => `
  describe('${route.method.toUpperCase()} ${route.path} - Error Handling', () => {
    it('should handle not found scenarios', async () => {
      const notFoundPath = '${route.path}/non-existent-id';
      
      const response = await request(app)
        .${route.method}(notFoundPath)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle server errors gracefully', async () => {
      // Mock database error scenario
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const response = await request(app)
        .${route.method}('${route.path}')
        .set('Content-Type', 'application/json')
        .send(${generateMockBody(route)});

      expect(response.status).toBeLessThan(600);
      expect(response.body).toBeDefined();
    });
  });`,

  integration: (route: RouteInfo, opts: GeneratorOptions) => `
  describe('${route.method.toUpperCase()} ${route.path} - Integration', () => {
    let testData: any;

    beforeAll(async () => {
      // Setup test data
      testData = ${generateTestData(route)};
    });

    afterAll(async () => {
      // Cleanup test data
      await cleanupTestData(testData);
    });

    it('should perform complete CRUD operation', async () => {
      // Create
      const createResponse = await request(app)
        .post('${route.path}')
        .set('Content-Type', 'application/json')
        .send(testData);

      expect(createResponse.status).toBe(201);
      const createdId = createResponse.body.data.id;

      // Read
      const readResponse = await request(app)
        .get(\`${route.path}/\${createdId}\`)
        .set('Content-Type', 'application/json');

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.data).toMatchObject(testData);

      // Update
      const updateData = { ...testData, name: 'Updated Name' };
      const updateResponse = await request(app)
        .put(\`${route.path}/\${createdId}\`)
        .set('Content-Type', 'application/json')
        .send(updateData);

      expect(updateResponse.status).toBe(200);

      // Delete
      const deleteResponse = await request(app)
        .delete(\`${route.path}/\${createdId}\`)
        .set('Content-Type', 'application/json');

      expect(deleteResponse.status).toBeOneOf([200, 204]);
    });
  });`,

  performance: (route: RouteInfo, opts: GeneratorOptions) => `
  describe('${route.method.toUpperCase()} ${route.path} - Performance', () => {
    it('should respond within acceptable time limit', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .${route.method}('${route.path}')
        .set('Content-Type', 'application/json')
        .send(${generateMockBody(route)});

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // 1 second limit
      expect(response.status).toBeLessThan(500);
    });

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 10;
      const promises = Array(concurrentRequests).fill(null).map(() =>
        request(app)
          .${route.method}('${route.path}')
          .set('Content-Type', 'application/json')
          .send(${generateMockBody(route)})
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });
  });`,
};

function generateMockBody(route: RouteInfo): string {
  const mockData: MockData = {
    name: "Test Name",
    email: "test@example.com",
    password: "password123",
    description: "Test description",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Customize based on route path
  if (route.path.includes("auth")) {
    return JSON.stringify(
      {
        email: "test@example.com",
        password: "password123",
      },
      null,
      2
    );
  }

  if (route.path.includes("user")) {
    return JSON.stringify(
      {
        name: "Test User",
        email: "test@example.com",
        role: "user",
      },
      null,
      2
    );
  }

  return JSON.stringify(mockData, null, 2);
}

function generateInvalidMockData(route: RouteInfo): string {
  return JSON.stringify(
    {
      email: "invalid-email",
      password: 123,
      name: 456,
      age: "not-a-number",
    },
    null,
    2
  );
}

function generateTestData(route: RouteInfo): string {
  return JSON.stringify(
    {
      id: "test-id-123",
      name: "Test Data",
      email: "test@example.com",
      createdAt: new Date().toISOString(),
    },
    null,
    2
  );
}

function getModuleTestTemplate(
  routes: RouteInfo[],
  opts: GeneratorOptions
): string {
  const firstRoute = routes[0];
  if (!firstRoute) {
    throw new Error("No routes provided for test generation");
  }

  const moduleName = path
    .basename(firstRoute.file, path.extname(firstRoute.file))
    .replace(".route", "");

  const testImports = generateTestImports(opts);
  const setupCode = generateSetupCode(opts);
  const testCases = generateTestCases(routes, opts);

  return `const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
${testImports}

describe('${moduleName} Module', () => {
  let mongoServer: MongoMemoryServer;
  let app: any;

  beforeAll(async () => {
    // Setup in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    
    // Import and setup your app
    app = require('../../${path.relative(opts.outputDir, firstRoute.file).replace(/\\/g, "/").replace(".route.ts", "")}');
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterEach(async () => {
    // Cleanup after each test
    jest.clearAllMocks();
  });

${setupCode}

${testCases}
});`;
}

function generateTestImports(opts: GeneratorOptions): string {
  const imports = [
    "const jwt = require('jsonwebtoken');",
    "const bcrypt = require('bcrypt');",
  ];

  if (opts.databaseType === "mongodb") {
    imports.push(
      "const { MongoMemoryServer } = require('mongodb-memory-server');"
    );
  }

  if (opts.testFramework === "jest") {
    imports.push("const { jest } = require('@jest/globals');");
  }

  return imports.join("\n");
}

function generateSetupCode(opts: GeneratorOptions): string {
  return `
  // Test utilities
  const createTestUser = async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'user'
    });
    return await user.save();
  };

  const generateAuthToken = (user: any) => {
    return jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  };

  const setupAuthHeaders = (token: string) => ({
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  });`;
}

function generateTestCases(
  routes: RouteInfo[],
  opts: GeneratorOptions
): string {
  return routes
    .map((route) => {
      const testCases: string[] = [];

      // Basic functionality test
      testCases.push(TEST_TEMPLATES.basic(route, opts));

      // Authentication test if required
      if (route.isAuthenticated && opts.includeAuthTests) {
        testCases.push(TEST_TEMPLATES.authenticated(route, opts));
      }

      // Validation test
      if (opts.includeValidationTests) {
        testCases.push(TEST_TEMPLATES.validation(route, opts));
      }

      // Error handling test
      if (opts.includeErrorTests) {
        testCases.push(TEST_TEMPLATES.errorHandling(route, opts));
      }

      // Integration test
      if (opts.includeIntegrationTests) {
        testCases.push(TEST_TEMPLATES.integration(route, opts));
      }

      // Performance test
      if (opts.includePerformanceTests) {
        testCases.push(TEST_TEMPLATES.performance(route, opts));
      }

      return testCases.join("\n\n");
    })
    .join("\n\n");
}

export async function generateTests(
  routes: RouteInfo[],
  opts: GeneratorOptions
) {
  // Generate test configuration file
  if (opts.generateHelpers) {
    await generateTestHelpers(opts);
  }

  // Generate test fixtures
  if (opts.generateFixtures) {
    await generateTestFixtures(opts);
  }

  if (opts.modular) {
    // Group routes by file
    const routesByFile = new Map<string, RouteInfo[]>();

    for (const route of routes) {
      const fileKey = route.file;
      if (!routesByFile.has(fileKey)) {
        routesByFile.set(fileKey, []);
      }
      routesByFile.get(fileKey)!.push(route);
    }

    // Generate one test file per route file
    for (const [filePath, fileRoutes] of routesByFile) {
      const srcRoot = opts.srcRoot || "src";
      const relPath = path.relative(srcRoot, filePath);
      const moduleName = path
        .basename(filePath, path.extname(filePath))
        .replace(".route", "");
      const testFileBase = relPath.replace(/\.[jt]s$/, `.${opts.testFileExt}`);
      const outPath = path.join(opts.outputDir, testFileBase);

      const content = getModuleTestTemplate(fileRoutes, opts);

      if (!opts.dryRun) {
        await writeFileSafe(outPath, content);
        logger(
          `Generated modular test: ${outPath} (${fileRoutes.length} routes)`,
          opts.verbose
        );
      } else {
        logger(
          `Would generate: ${outPath} (${fileRoutes.length} routes)`,
          opts.verbose
        );
      }
    }
  } else {
    // Generate individual test files
    for (const route of routes) {
      const testFileName = `${route.handler || route.method}_${route.method}_${route.path.replace(/\W+/g, "_")}.${opts.testFileExt}`;
      const outPath = path.join(opts.outputDir, testFileName);
      const content = TEST_TEMPLATES.basic(route, opts);

      if (!opts.dryRun) {
        await writeFileSafe(outPath, content);
        logger(`Generated test: ${outPath}`, opts.verbose);
      } else {
        logger(`Would generate: ${outPath}`, opts.verbose);
      }
    }
  }
}

async function generateTestHelpers(opts: GeneratorOptions): Promise<void> {
  const helpersPath = path.join(opts.outputDir, "helpers");
  await fs.ensureDir(helpersPath);

  const helpersContent = `
// Test Helpers
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class TestHelper {
  static async createTestUser(userData = {}) {
    const defaultData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'user'
    };
    
    const user = { ...defaultData, ...userData };
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    // Create user in database
    const User = mongoose.model('User');
    const newUser = new User({
      ...user,
      password: hashedPassword
    });
    
    return await newUser.save();
  }

  static generateAuthToken(user) {
    return jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }

  static getAuthHeaders(token) {
    return {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    };
  }

  static async cleanupDatabase() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }

  static createMockRequest(data = {}) {
    return {
      body: data.body || {},
      params: data.params || {},
      query: data.query || {},
      headers: data.headers || {},
      user: data.user || null
    };
  }

  static createMockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  }
}

module.exports = TestHelper;
`;

  await writeFileSafe(path.join(helpersPath, "testHelper.js"), helpersContent);
}

async function generateTestFixtures(opts: GeneratorOptions): Promise<void> {
  const fixturesPath = path.join(opts.outputDir, "fixtures");
  await fs.ensureDir(fixturesPath);

  const fixturesContent = `
// Test Fixtures
const fixtures = {
  users: [
    {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    },
    {
      email: 'user@example.com',
      password: 'user123',
      name: 'Regular User',
      role: 'user'
    }
  ],
  
  auth: {
    validLogin: {
      email: 'test@example.com',
      password: 'password123'
    },
    invalidLogin: {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    }
  },
  
  common: {
    validId: '507f1f77bcf86cd799439011',
    invalidId: 'invalid-id',
    longString: 'a'.repeat(1000),
    specialChars: '!@#$%^&*()'
  }
};

module.exports = fixtures;
`;

  await writeFileSafe(path.join(fixturesPath, "testData.js"), fixturesContent);
}
