import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputFile = path.join(repoRoot, "node_modules", ".cache", "platform-links-qa.cjs");

await build({
  entryPoints: [path.join(__dirname, "platform-links-qa.tsx")],
  outfile: outputFile,
  bundle: true,
  format: "cjs",
  platform: "node",
  jsx: "automatic",
  alias: {
    "@": path.join(repoRoot, "src"),
  },
  logLevel: "silent",
});

await import(pathToFileURL(outputFile).href);
