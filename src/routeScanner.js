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
exports.scanRoutes = scanRoutes;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const utils_1 = require("./utils");
function scanRoutes(dir_1) {
    return __awaiter(this, arguments, void 0, function* (dir, verbose = false) {
        const routes = [];
        function scan(filePath) {
            return __awaiter(this, void 0, void 0, function* () {
                const stat = yield fs_extra_1.default.stat(filePath);
                if (stat.isDirectory()) {
                    const files = yield fs_extra_1.default.readdir(filePath);
                    for (const file of files) {
                        yield scan(path_1.default.join(filePath, file));
                    }
                }
                else if (filePath.endsWith(".js") || filePath.endsWith(".ts")) {
                    const code = yield fs_extra_1.default.readFile(filePath, "utf8");
                    try {
                        const ast = (0, parser_1.parse)(code, {
                            sourceType: "module",
                            plugins: ["typescript", "jsx"],
                        });
                        (0, traverse_1.default)(ast, {
                            CallExpression(path) {
                                const node = path.node;
                                if (node.callee.type === "MemberExpression" &&
                                    node.callee.property.type === "Identifier" &&
                                    ["get", "post", "put", "delete"].includes(node.callee.property.name)) {
                                    const method = node.callee.property.name;
                                    const args = node.arguments;
                                    if (args.length >= 2 &&
                                        args[0].type === "StringLiteral" &&
                                        (args[1].type === "Identifier" ||
                                            args[1].type === "ArrowFunctionExpression" ||
                                            args[1].type === "FunctionExpression")) {
                                        routes.push({
                                            method,
                                            path: args[0].value,
                                            handler: args[1].type === "Identifier" ? args[1].name : "<inline>",
                                            file: filePath,
                                        });
                                        (0, utils_1.logger)(`Found route: [${method.toUpperCase()}] ${args[0].value} in ${filePath}`, verbose);
                                    }
                                }
                            },
                        });
                    }
                    catch (e) {
                        (0, utils_1.logger)(`Parse error in ${filePath}: ${e.message}`, verbose);
                    }
                }
            });
        }
        yield scan(dir);
        return routes;
    });
}
