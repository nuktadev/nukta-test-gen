#!/usr/bin/env ts-node
import { Command } from "commander";
import path from "path";
import { scanRoutes } from "./routeScanner";
import { generateTests } from "./testGenerator";
import { GeneratorOptions } from "./types";
import { logger } from "./utils";

const program = new Command();

program
  .name("nukta-test-gen")
  .description("Generate Jest test cases for Express.js APIs")
  .version("1.0.0")
  .option("-s, --src <dir>", "Source directory to scan", "src")
  .option("-o, --out <dir>", "Output directory for test files", "tests")
  .option("-e, --ext <ext>", "Test file extension (test.js|spec.js)", "test.js")
  .option("--mock", "Include mock data in tests", false)
  .option(
    "--dry-run",
    "Show what would be generated without writing files",
    false
  )
  .option("--verbose", "Enable verbose logging", false)
  .action(async (opts) => {
    const srcDir = path.resolve(process.cwd(), opts.src);
    const outDir = path.resolve(process.cwd(), opts.out);
    const testFileExt = opts.ext === "spec.js" ? "spec.js" : "test.js";
    const generatorOpts: GeneratorOptions = {
      outputDir: outDir,
      testFileExt,
      useMockData: opts.mock,
      dryRun: opts.dryRun,
      verbose: opts.verbose,
    };
    logger(`Scanning routes in ${srcDir}...`, opts.verbose);
    const routes = await scanRoutes(srcDir, opts.verbose);
    logger(`Found ${routes.length} routes. Generating tests...`, opts.verbose);
    await generateTests(routes, generatorOpts);
    logger("Done!", true);
  });

program.parse(process.argv);
