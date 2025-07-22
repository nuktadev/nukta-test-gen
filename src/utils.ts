import fs from "fs-extra";
import path from "path";

export function logger(message: string, verbose = false) {
  if (verbose) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  } else {
    console.log(message);
  }
}

export async function writeFileSafe(filePath: string, content: string): Promise<void> {
  try {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, "utf8");
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error}`);
  }
}

export function generateTestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");
}

export function generateMockData(type: string, field: string): any {
  const mockGenerators: Record<string, Record<string, () => any>> = {
    user: {
      name: () => `Test User ${generateTestId().substring(0, 8)}`,
      email: () => `test${generateTestId().substring(0, 8)}@example.com`,
      password: () => "password123",
      role: () => "user",
      status: () => "active"
    },
    auth: {
      email: () => `auth${generateTestId().substring(0, 8)}@example.com`,
      password: () => "password123",
      token: () => `token_${generateTestId()}`
    },
    course: {
      title: () => `Test Course ${generateTestId().substring(0, 8)}`,
      description: () => `Test course description ${generateTestId().substring(0, 8)}`,
      price: () => Math.floor(Math.random() * 1000) + 10,
      duration: () => Math.floor(Math.random() * 100) + 1
    },
    order: {
      amount: () => Math.floor(Math.random() * 1000) + 10,
      currency: () => "USD",
      status: () => "pending"
    }
  };

  const generator = mockGenerators[type]?.[field];
  return generator ? generator() : `mock_${field}_${generateTestId().substring(0, 8)}`;
}

export function generateInvalidData(type: string, field: string): any {
  const invalidGenerators: Record<string, Record<string, () => any>> = {
    user: {
      email: () => "invalid-email-format",
      password: () => 123,
      name: () => 456,
      age: () => "not-a-number"
    },
    auth: {
      email: () => "invalid@email",
      password: () => null,
      token: () => "invalid-token-format"
    }
  };

  const generator = invalidGenerators[type]?.[field];
  return generator ? generator() : null;
}

export function generateJestConfig(): string {
  return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/app.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};`;
}

export function generateTestSetup(): string {
  return `import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

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

afterEach(async () => {
  jest.clearAllMocks();
});

// Global test utilities
global.generateTestId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

global.createMockUser = async (userData = {}) => {
  const bcrypt = require('bcrypt');
  const User = mongoose.model('User');
  
  const defaultData = {
    email: \`test\${global.generateTestId().substring(0, 8)}@example.com\`,
    password: await bcrypt.hash('password123', 10),
    name: \`Test User \${global.generateTestId().substring(0, 8)}\`,
    role: 'user',
    status: 'active'
  };
  
  const user = new User({ ...defaultData, ...userData });
  return await user.save();
};

global.generateAuthToken = (user: any) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};`;
}

export function generatePackageJsonScripts(): Record<string, string> {
  return {
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose",
    "test:debug": "jest --detectOpenHandles --verbose --runInBand",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:auth": "jest --testPathPattern=auth",
    "test:performance": "jest --testPathPattern=performance"
  };
}

export function generateRequiredDependencies(): Record<string, string> {
  return {
    "jest": "^29.0.0",
    "supertest": "^6.0.0",
    "mongodb-memory-server": "^9.0.0",
    "@types/jest": "^29.0.0",
    "@types/supertest": "^2.0.0",
    "ts-jest": "^29.0.0"
  };
}

export function generateOptionalDependencies(): Record<string, string> {
  return {
    "faker": "^6.0.0",
    "@faker-js/faker": "^8.0.0",
    "testcontainers": "^9.0.0",
    "jest-extended": "^3.0.0",
    "jest-mock-extended": "^3.0.0"
  };
}
