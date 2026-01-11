import { runPython } from "../wasm/python";
import { runJava } from "./runJava";

export async function runWasm(lang, code) {
  switch (lang) {
    case "python":
      return await runPython(code);
    case "java":
      return await runJava(code);
    default:
      return "Language not supported.";
  }
}
