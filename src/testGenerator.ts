import path from "path";
import { RouteInfo, GeneratorOptions } from "./types";
import { writeFileSafe, logger } from "./utils";

function getTestTemplate(route: RouteInfo, opts: GeneratorOptions) {
  const { method, path: routePath, handler } = route;
  const mockData = opts.useMockData
    ? `const mockReq = {};
const mockRes = {};`
    : "";
  return `  describe('${method.toUpperCase()} ${routePath}', () => {
    it('should return expected status and response', async () => {
      ${mockData}
      const res = await request(app)
        .${method}('${routePath}')
        .send(${opts.useMockData ? "{}" : ""});
      expect([200,201,400,404]).toContain(res.statusCode);
      expect(typeof res.body).toBe('object');
    });
  });`;
}

function getModuleTestTemplate(routes: RouteInfo[], opts: GeneratorOptions) {
  const firstRoute = routes[0];
  const moduleName = path
    .basename(firstRoute.file, path.extname(firstRoute.file))
    .replace(".route", "");
  const mockData = opts.useMockData
    ? `const mockReq = {};
const mockRes = {};`
    : "";

  return `const request = require('supertest');
const app = require('../../${path.relative(opts.outputDir, firstRoute.file).replace(/\\/g, "/")}');

describe('${moduleName} Module', () => {
${routes.map((route) => getTestTemplate(route, opts)).join("\n\n")}
});`;
}

export async function generateTests(
  routes: RouteInfo[],
  opts: GeneratorOptions
) {
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
      }
      logger(
        `Generated modular test: ${outPath} (${fileRoutes.length} routes)`,
        opts.verbose
      );
    }
  } else {
    // Original flat structure
    for (const route of routes) {
      const testFileName = `${route.handler || route.method}_${route.method}_${route.path.replace(/\W+/g, "_")}.${opts.testFileExt}`;
      const outPath = path.join(opts.outputDir, testFileName);
      const content = getTestTemplate(route, opts);
      if (!opts.dryRun) {
        await writeFileSafe(outPath, content);
      }
      logger(`Generated test: ${outPath}`, opts.verbose);
    }
  }
}
