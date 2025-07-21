#!/usr/bin/env ts-node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path_1 = __importDefault(require("path"));
const routeScanner_1 = require("./routeScanner");
const testGenerator_1 = require("./testGenerator");
const utils_1 = require("./utils");
const program = new commander_1.Command();
program
    .name("nukta-test-gen")
    .description("Generate Jest test cases for Express.js APIs")
    .version("1.0.0")
    .option("-s, --src <dir>", "Source directory to scan", "src")
    .option("-o, --out <dir>", "Output directory for test files", "tests")
    .option("-e, --ext <ext>", "Test file extension (test.js|spec.js)", "test.js")
    .option("--mock", "Include mock data in tests", false)
    .option("--dry-run", "Show what would be generated without writing files", false)
    .option("--verbose", "Enable verbose logging", false)
    .action((opts) => __awaiter(void 0, void 0, void 0, function* () {
    const srcDir = path_1.default.resolve(process.cwd(), opts.src);
    const outDir = path_1.default.resolve(process.cwd(), opts.out);
    const testFileExt = opts.ext === "spec.js" ? "spec.js" : "test.js";
    const generatorOpts = {
        outputDir: outDir,
        testFileExt,
        useMockData: opts.mock,
        dryRun: opts.dryRun,
        verbose: opts.verbose,
    };
    (0, utils_1.logger)(`Scanning routes in ${srcDir}...`, opts.verbose);
    const routes = yield (0, routeScanner_1.scanRoutes)(srcDir, opts.verbose);
    (0, utils_1.logger)(`Found ${routes.length} routes. Generating tests...`, opts.verbose);
    yield (0, testGenerator_1.generateTests)(routes, generatorOpts);
    (0, utils_1.logger)("Done!", true);
}));
program.parse(process.argv);
