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
        traverse(ast, {
          CallExpression(path: NodePath<t.CallExpression>) {
            const node = path.node;
            if (
              node.callee.type === "MemberExpression" &&
              node.callee.property.type === "Identifier" &&
              ["get", "post", "put", "delete"].includes(
                node.callee.property.name
              )
            ) {
              const method = node.callee.property.name;
              const args = node.arguments;
              if (
                args.length >= 2 &&
                args[0].type === "StringLiteral" &&
                (args[1].type === "Identifier" ||
                  args[1].type === "ArrowFunctionExpression" ||
                  args[1].type === "FunctionExpression")
              ) {
                routes.push({
                  method,
                  path: args[0].value,
                  handler:
                    args[1].type === "Identifier" ? args[1].name : "<inline>",
                  file: filePath,
                });
                logger(
                  `Found route: [${method.toUpperCase()}] ${args[0].value} in ${filePath}`,
                  verbose
                );
              }
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
