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
exports.generateTests = generateTests;
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
function getTestTemplate(route, opts) {
    const { method, path: routePath, handler } = route;
    const mockData = opts.useMockData
        ? `const mockReq = {};\nconst mockRes = {};`
        : "";
    return `const request = require('supertest');
const app = require('../../${path_1.default.relative(opts.outputDir, route.file).replace(/\\/g, "/")}');

describe('${method.toUpperCase()} ${routePath}', () => {
  it('should return expected status and response', async () => {
    ${mockData}
    const res = await request(app)
      .${method}('${routePath}')
      .send(${opts.useMockData ? "{}" : ""});
    expect([200,201,400,404]).toContain(res.statusCode);
    expect(typeof res.body).toBe('object');
  });
});
`;
}
function generateTests(routes, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const route of routes) {
            const testFileName = `${route.handler || route.method}_${route.method}_${route.path.replace(/\W+/g, "_")}.${opts.testFileExt}`;
            const outPath = path_1.default.join(opts.outputDir, testFileName);
            const content = getTestTemplate(route, opts);
            if (!opts.dryRun) {
                yield (0, utils_1.writeFileSafe)(outPath, content);
            }
            (0, utils_1.logger)(`Generated test: ${outPath}`, opts.verbose);
        }
    });
}
