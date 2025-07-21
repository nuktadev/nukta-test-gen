import fs from "fs-extra";
import path from "path";

export async function ensureDir(dir: string) {
  await fs.ensureDir(dir);
}

export async function writeFileSafe(filePath: string, content: string) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, { flag: "w" });
}

export function logger(msg: string, verbose?: boolean) {
  if (verbose) console.log(`[nukta-test-gen] ${msg}`);
}
