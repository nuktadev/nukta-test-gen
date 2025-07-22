#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import { scanRoutes } from "./routeScanner";
import { generateTests } from "./testGenerator";
import { GeneratorOptions } from "./types";
import { logger } from "./utils";

const program = new Command();

program
  .name("nuktatestify")
  .description(
    "Generate comprehensive Jest test cases for Express.js APIs with MongoDB support"
  )
  .version("1.0.1")
  .option("-s, --src <dir>", "Source directory to scan", "src")
  .option("-o, --out <dir>", "Output directory for test files", "tests")
  .option(
    "-e, --ext <ext>",
    "Test file extension (test.ts|test.js|spec.ts|spec.js)",
    "test.ts"
  )
  .option("--mock", "Include mock data in tests", false)
  .option(
    "--dry-run",
    "Show what would be generated without writing files",
    false
  )
  .option("--verbose", "Enable verbose logging", false)
  .option(
    "--modular, -m",
    "Generate test files in a modular folder structure",
    false
  )
  .option(
    "--auth-tests",
    "Include authentication and authorization tests",
    true
  )
  .option("--validation-tests", "Include input validation tests", true)
  .option("--error-tests", "Include error handling tests", true)
  .option(
    "--integration-tests",
    "Include integration tests with database",
    true
  )
  .option("--performance-tests", "Include performance and load tests", false)
  .option(
    "--test-framework <framework>",
    "Test framework to use (jest|mocha)",
    "jest"
  )
  .option(
    "--database-type <type>",
    "Database type (mongodb|postgresql|mysql)",
    "mongodb"
  )
  .option(
    "--mock-database",
    "Use mock database instead of real connection",
    false
  )
  .option("--generate-fixtures", "Generate test fixtures and sample data", true)
  .option("--generate-helpers", "Generate test helper utilities", true)
  .option(
    "--coverage-threshold <number>",
    "Minimum test coverage threshold (0-100)",
    "80"
  )
  .option("--include-crud", "Generate complete CRUD operation tests", true)
  .option(
    "--include-security",
    "Include security-related tests (SQL injection, XSS, etc.)",
    false
  )
  .option("--include-rate-limiting", "Include rate limiting tests", false)
  .option("--test-timeout <ms>", "Test timeout in milliseconds", "10000")
  .action(async (opts: any) => {
    const srcDir = path.resolve(process.cwd(), opts.src);
    const outDir = path.resolve(process.cwd(), opts.out);

    // Determine the correct file extension
    let testFileExt: "test.ts" | "test.js" | "spec.ts" | "spec.js";
    switch (opts.ext) {
      case "spec.ts":
        testFileExt = "spec.ts";
        break;
      case "spec.js":
        testFileExt = "spec.js";
        break;
      case "test.js":
        testFileExt = "test.js";
        break;
      case "test.ts":
      default:
        testFileExt = "test.ts";
        break;
    }

    const generatorOpts: GeneratorOptions = {
      outputDir: outDir,
      testFileExt,
      useMockData: opts.mock,
      dryRun: opts.dryRun,
      verbose: opts.verbose,
      modular: opts.modular,
      srcRoot: opts.modular ? srcDir : undefined,
      includeAuthTests: opts.authTests,
      includeValidationTests: opts.validationTests,
      includeErrorTests: opts.errorTests,
      includeIntegrationTests: opts.integrationTests,
      includePerformanceTests: opts.performanceTests,
      testFramework: opts.testFramework,
      databaseType: opts.databaseType,
      mockDatabase: opts.mockDatabase,
      generateFixtures: opts.generateFixtures,
      generateHelpers: opts.generateHelpers,
      coverageThreshold: parseInt(opts.coverageThreshold),
    };

    logger("🚀 Starting enhanced test generation...", opts.verbose);
    logger(`📁 Scanning routes in ${srcDir}...`, opts.verbose);

    const routes = await scanRoutes(srcDir, opts.verbose);

    logger(`✅ Found ${routes.length} routes`, opts.verbose);

    if (routes.length === 0) {
      logger("❌ No routes found. Please check your source directory.", true);
      process.exit(1);
    }

    // Log route summary
    if (opts.verbose) {
      const methodCounts = routes.reduce(
        (acc: Record<string, number>, route) => {
          acc[route.method] = (acc[route.method] || 0) + 1;
          return acc;
        },
        {}
      );

      logger("📊 Route Summary:", opts.verbose);
      Object.entries(methodCounts).forEach(([method, count]) => {
        logger(`   ${method.toUpperCase()}: ${count} routes`, opts.verbose);
      });

      const authRoutes = routes.filter((r) => r.isAuthenticated).length;
      const protectedRoutes = routes.filter((r) =>
        r.middleware?.includes("hasPermission")
      ).length;

      logger(`🔐 Authentication required: ${authRoutes} routes`, opts.verbose);
      logger(
        `🛡️  Permission protected: ${protectedRoutes} routes`,
        opts.verbose
      );
    }

    logger("🧪 Generating comprehensive tests...", opts.verbose);
    await generateTests(routes, generatorOpts);

    if (!opts.dryRun) {
      logger("✅ Test generation completed!", true);
      logger("📝 Next steps:", true);
      logger("   1. Install required dependencies:", true);
      logger(
        "      npm install --save-dev jest supertest mongodb-memory-server @types/jest @types/supertest ts-jest",
        true
      );
      logger("   2. Add test script to package.json:", true);
      logger('      "test": "jest --detectOpenHandles"', true);
      logger("   3. Run tests:", true);
      logger("      npm test", true);

      if (opts.generateHelpers) {
        logger("   4. Customize test helpers in tests/helpers/", true);
      }

      if (opts.generateFixtures) {
        logger("   5. Update test fixtures in tests/fixtures/", true);
      }
    } else {
      logger("🔍 Dry run completed. No files were created.", true);
    }
  });

program.parse(process.argv);
