import fs from "fs-extra";
import path from "path";
import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { RouteInfo } from "./types";
import { logger } from "./utils";

export async function scanRoutes(
  dir: string,
  verbose = false
): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = [];

  async function scan(filePath: string) {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      const files = await fs.readdir(filePath);
      for (const file of files) {
        await scan(path.join(filePath, file));
      }
    } else if (filePath.endsWith(".js") || filePath.endsWith(".ts")) {
      const code = await fs.readFile(filePath, "utf8");
      try {
        const ast = parse(code, {
          sourceType: "module",
          plugins: ["typescript", "jsx"],
        });

        let currentRoute: Partial<RouteInfo> = {};
        let middlewareStack: string[] = [];
        let isInRouteDefinition = false;

        traverse(ast, {
          // Track middleware usage
          CallExpression(path: NodePath<t.CallExpression>) {
            const node = path.node;

            // Detect middleware usage
            if (node.callee.type === "Identifier") {
              const middlewareName = node.callee.name;
              if (
                [
                  "auth",
                  "hasPermission",
                  "validate",
                  "rateLimit",
                  "cors",
                ].includes(middlewareName)
              ) {
                middlewareStack.push(middlewareName);
              }
            }

            // Detect route definitions
            if (
              node.callee.type === "MemberExpression" &&
              node.callee.property.type === "Identifier" &&
              ["get", "post", "put", "delete", "patch"].includes(
                node.callee.property.name
              )
            ) {
              const method = node.callee.property.name;
              const args = node.arguments;

              if (
                args.length >= 2 &&
                args[0] &&
                args[0].type === "StringLiteral" &&
                args[1] &&
                (args[1].type === "Identifier" ||
                  args[1].type === "ArrowFunctionExpression" ||
                  args[1].type === "FunctionExpression")
              ) {
                const routePath = args[0].value;
                const handler =
                  args[1].type === "Identifier" ? args[1].name : "<inline>";

                // Analyze middleware for this route
                const routeMiddleware = [...middlewareStack];
                const isAuthenticated = routeMiddleware.includes("auth");
                const hasPermissions = routeMiddleware
                  .filter((m) => m === "hasPermission")
                  .map(() => "admin"); // Default permission, could be enhanced

                // Generate description based on route pattern
                const description = generateRouteDescription(
                  method,
                  routePath,
                  handler
                );

                // Determine expected status codes
                const expectedStatusCodes = getExpectedStatusCodes(
                  method,
                  routePath
                );

                // Generate tags for categorization
                const tags = generateRouteTags(
                  method,
                  routePath,
                  routeMiddleware
                );

                routes.push({
                  method,
                  path: routePath,
                  handler,
                  file: filePath,
                  middleware: routeMiddleware,
                  isAuthenticated,
                  hasPermissions,
                  description,
                  expectedStatusCodes,
                  tags,
                });

                logger(
                  `Found route: [${method.toUpperCase()}] ${routePath} (${handler}) in ${filePath}`,
                  verbose
                );

                if (verbose && routeMiddleware.length > 0) {
                  logger(
                    `  Middleware: ${routeMiddleware.join(", ")}`,
                    verbose
                  );
                }
              }
            }
          },

          // Track imports to understand dependencies
          ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
            const source = path.node.source.value;
            if (source.includes("middleware") || source.includes("auth")) {
              logger(`Found middleware import: ${source}`, verbose);
            }
          },
        });
      } catch (e) {
        logger(`Parse error in ${filePath}: ${(e as Error).message}`, verbose);
      }
    }
  }

  await scan(dir);
  return routes;
}

function generateRouteDescription(
  method: string,
  path: string,
  handler: string
): string {
  const methodMap: Record<string, string> = {
    get: "Retrieve",
    post: "Create",
    put: "Update",
    delete: "Delete",
    patch: "Partially update",
  };

  const action = methodMap[method] || "Handle";
  const resource = path.split("/").filter(Boolean).pop() || "resource";

  return `${action} ${resource}`;
}

function getExpectedStatusCodes(method: string, path: string): number[] {
  const baseCodes = [200, 400, 404, 500];

  switch (method) {
    case "post":
      return [201, 400, 401, 403, 409, 422, 500];
    case "put":
    case "patch":
      return [200, 400, 401, 403, 404, 422, 500];
    case "delete":
      return [200, 204, 400, 401, 403, 404, 500];
    case "get":
      return [200, 400, 401, 403, 404, 500];
    default:
      return baseCodes;
  }
}

function generateRouteTags(
  method: string,
  path: string,
  middleware: string[]
): string[] {
  const tags: string[] = [];

  // Method-based tags
  tags.push(method.toUpperCase());

  // Path-based tags
  if (path.includes("auth")) tags.push("authentication");
  if (path.includes("admin")) tags.push("admin");
  if (path.includes("user")) tags.push("user");
  if (path.includes("api")) tags.push("api");

  // Middleware-based tags
  if (middleware.includes("auth")) tags.push("protected");
  if (middleware.includes("hasPermission")) tags.push("authorized");
  if (middleware.includes("validate")) tags.push("validated");

  return tags;
}
