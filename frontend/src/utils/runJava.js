export async function runJava(code) {
  try {
    const response = await fetch("http://localhost:5000/run/java", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const data = await response.json();
    return data.output || "No output";
  } catch (err) {
    return "Java Error: " + err.message;
  }
}
