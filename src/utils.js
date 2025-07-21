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
exports.ensureDir = ensureDir;
exports.writeFileSafe = writeFileSafe;
exports.logger = logger;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
function ensureDir(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.default.ensureDir(dir);
    });
}
function writeFileSafe(filePath, content) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ensureDir(path_1.default.dirname(filePath));
        yield fs_extra_1.default.writeFile(filePath, content, { flag: "w" });
    });
}
function logger(msg, verbose) {
    if (verbose)
        console.log(`[nukta-test-gen] ${msg}`);
}
