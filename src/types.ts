export interface RouteInfo {
  method: string;
  path: string;
  handler: string;
  file: string;
}

export interface GeneratorOptions {
  outputDir: string;
  testFileExt: "test.js" | "spec.js";
  useMockData: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  modular?: boolean;
  srcRoot?: string;
}
