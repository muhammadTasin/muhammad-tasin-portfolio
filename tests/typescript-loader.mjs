import ts from "typescript";
import { readFile, access } from "node:fs/promises";

export async function resolve(specifier, context, nextResolve) {
  try { return await nextResolve(specifier, context); }
  catch (error) {
    if (!specifier.startsWith(".")) throw error;
    for (const extension of [".ts", ".tsx"]) {
      const url = new URL(specifier + extension, context.parentURL);
      try { await access(url); return { url: url.href, shortCircuit: true }; } catch { /* next extension */ }
    }
    throw error;
  }
}
export async function load(url, context, nextLoad) {
  if (/\.tsx?$/.test(url) && !url.includes("node_modules")) {
    const source = await readFile(new URL(url), "utf8");
    return { format: "module", shortCircuit: true, source: ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
      fileName: new URL(url).pathname,
    }).outputText };
  }
  return nextLoad(url, context);
}
