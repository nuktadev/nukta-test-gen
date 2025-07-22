export interface RouteInfo {
  method: string;
  path: string;
  handler: string;
  file: string;
  middleware?: string[];
  isAuthenticated?: boolean;
  hasPermissions?: string[];
  validationSchema?: string;
  expectedStatusCodes?: number[];
  description?: string;
  tags?: string[];
}

export interface GeneratorOptions {
  outputDir: string;
  testFileExt: "test.js" | "spec.js";
  useMockData: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  modular?: boolean;
  srcRoot?: string;
  includeAuthTests?: boolean;
  includeValidationTests?: boolean;
  includeErrorTests?: boolean;
  includeIntegrationTests?: boolean;
  includePerformanceTests?: boolean;
  testFramework?: "jest" | "mocha";
  databaseType?: "mongodb" | "postgresql" | "mysql";
  mockDatabase?: boolean;
  generateFixtures?: boolean;
  generateHelpers?: boolean;
  coverageThreshold?: number;
}

export interface TestTemplate {
  name: string;
  template: string;
  description: string;
}

export interface MockData {
  [key: string]: any;
}

export interface TestCase {
  name: string;
  method: string;
  path: string;
  body?: any;
  headers?: Record<string, string>;
  expectedStatus: number;
  expectedResponse?: any;
  description: string;
  tags: string[];
}

export interface DatabaseConfig {
  type: "mongodb" | "postgresql" | "mysql";
  connectionString?: string;
  databaseName?: string;
  collections?: string[];
  tables?: string[];
}

export interface AuthConfig {
  tokenType: "jwt" | "session" | "api-key";
  tokenLocation: "header" | "cookie" | "body";
  tokenName: string;
  refreshToken?: boolean;
}
