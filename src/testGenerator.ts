import path from "path";
import { RouteInfo, GeneratorOptions } from "./types";
import { writeFileSafe, logger } from "./utils";

function getTestTemplate(route: RouteInfo, opts: GeneratorOptions) {
  const { method, path: routePath, handler } = route;
  const mockData = opts.useMockData
    ? `const mockReq = {};\nconst mockRes = {};`
    : "";
  return `const request = require('supertest');
const app = require('../../${path.relative(opts.outputDir, route.file).replace(/\\/g, "/")}');

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

export async function generateTests(
  routes: RouteInfo[],
  opts: GeneratorOptions
) {
  for (const route of routes) {
    let testFileName = `${route.handler || route.method}_${route.method}_${route.path.replace(/\W+/g, "_")}.${opts.testFileExt}`;
    let outPath = path.join(opts.outputDir, testFileName);
    if (opts.modular) {
      // Mirror the source file's relative path under the output dir
      const srcRoot = opts.srcRoot || "src";
      const relPath = path.relative(srcRoot, route.file);
      const testFileBase = relPath.replace(/\.[jt]s$/, `.${opts.testFileExt}`);
      outPath = path.join(opts.outputDir, testFileBase);
    }
    const content = getTestTemplate(route, opts);
    if (!opts.dryRun) {
      await writeFileSafe(outPath, content);
    }
    logger(`Generated test: ${outPath}`, opts.verbose);
  }
}
