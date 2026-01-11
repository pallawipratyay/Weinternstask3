let pyodide = null;

export async function runPython(code) {
  if (!pyodide) {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    });
  }

  let output = "";
  let errors = "";

  pyodide.setStdout({
    batched: (msg) => {
      output += msg + "\n";  // <-- FIX: FORCE LINE BREAK
    }
  });

  pyodide.setStderr({
    batched: (msg) => {
      errors += msg + "\n";  // <-- FIX: KEEP LINE BREAKS
    }
  });

  try {
    await pyodide.runPythonAsync(code);
  } catch (err) {
    return "Python Error:\n" + err.toString();
  }

  if (errors.trim()) {
    return "Python Error:\n" + errors.trim();
  }

  return output.trim() || "(no output)";
}
