import { useState, useEffect } from "react";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import Header from "./components/Header";
import LanguageSelector from "./components/LanguageSelector";
import LanguageDashboard from "./components/LanguageDashboard";
import Output from "./components/Output";
import GitHubPanel from "./components/GitHubPanel";
import { runWasm } from "./utils/runWasm";

const LANGUAGES = [
  { value: "html", label: "HTML", mode: "web" },
  { value: "python", label: "Python", mode: "code" },
  { value: "javascript", label: "JavaScript", mode: "code" },
  { value: "java", label: "Java", mode: "code" },
  { value: "css", label: "CSS", mode: "web" },
];

const DEFAULT_CODE = {
  html: "<h1>Hello World</h1>\n<p>Welcome to Code Editor</p>",
  python: "print('Hello, World!')\nprint('Welcome to Code Editor')",
  javascript: "console.log('Hello, World!');\nconsole.log('Welcome to Code Editor');",
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  css: "body {\n    font-family: Arial, sans-serif;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n}",
};

export default function App() {
  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("web"); 
  const [showGitHubPanel, setShowGitHubPanel] = useState(false);

  const [html, setHtml] = useState(DEFAULT_CODE.html);
  const [css, setCss] = useState(DEFAULT_CODE.css);
  const [js, setJs] = useState(DEFAULT_CODE.javascript);

  useEffect(() => {
    const langObj = LANGUAGES.find((l) => l.value === selectedLanguage);
    if (langObj) setMode(langObj.mode);
  }, [selectedLanguage]);

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    const langObj = LANGUAGES.find((l) => l.value === lang);

    if (langObj?.mode === "code") {
      setCode(DEFAULT_CODE[lang] || "");
    } else {
      setHtml(DEFAULT_CODE.html);
      setCss(DEFAULT_CODE.css);
      setJs(DEFAULT_CODE.javascript);
    }

    setOutput("");
    setError("");
    setShowDashboard(false);
  };

  const handleLanguageChange = (lang) => {
    handleLanguageSelect(lang);
  };

  const handleBackToDashboard = () => {
    setShowDashboard(true);
    setSelectedLanguage(null);
    setOutput("");
    setError("");
  };

  // ---------------------------------------
  // 🔥 FIXED handleRun() WITH JAVA SUPPORT
  // ---------------------------------------
  const handleRun = async () => {
    if (mode === "web") return;

    setIsLoading(true);
    setOutput("");
    setError("");

    try {
      // -------------------------------
      // ⚙️ WASM LANGUAGES
      // -------------------------------
      if (selectedLanguage === "python") {
        try {
          const result = await runWasm(selectedLanguage, code);
          setOutput(result);
        } catch (err) {
          setError(err.message);
        }
        return;
      }

      // -------------------------------
      // ⚡ JavaScript execution
      // -------------------------------
      if (selectedLanguage === "javascript") {
        try {
          const logs = [];
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;

          console.log = (...args) => {
            logs.push(args.join(" "));
            originalLog(...args);
          };
          console.error = (...args) => {
            logs.push("ERROR: " + args.join(" "));
            originalError(...args);
          };
          console.warn = (...args) => {
            logs.push("WARN: " + args.join(" "));
            originalWarn(...args);
          };

          let result;
          try {
            result = new Function(code)();
          } finally {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
          }

          if (logs.length > 0) {
            setOutput(logs.join("\n"));
          } else {
            setOutput(result !== undefined ? String(result) : "Code executed successfully");
          }
        } catch (err) {
          setError(err.message);
        }
        return;
      }

      // -------------------------------
      // ☕ JAVA BACKEND EXECUTION
      // -------------------------------
      if (selectedLanguage === "java") {
        try {
          const response = await fetch("http://localhost:5000/run/java", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();
          setOutput(data.output || "No output");
        } catch (err) {
          setError("Java Error: " + err.message);
        }
        return;
      }

      // Fallback
      setOutput("Execution not supported for this language yet.");

    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  const getEditorLanguage = () =>
    ({
      html: "html",
      css: "css",
      javascript: "javascript",
      python: "python",
      java: "java",
    }[selectedLanguage] || "plaintext");

  const handleCodeLoad = (loadedCode) => {
    if (mode === "code") setCode(loadedCode);
    else setHtml(loadedCode);
  };

  const getCurrentCode = () => {
    if (mode === "web") {
      return `<!-- HTML -->\n${html}\n\n<!-- CSS -->\n<style>\n${css}\n</style>\n\n<!-- JavaScript -->\n<script>\n${js}\n</script>`;
    }
    return code;
  };

  if (showDashboard || !selectedLanguage) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <LanguageDashboard onLanguageSelect={handleLanguageSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="w-full">
        {/* Control Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between gap-4 max-w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>

              <LanguageSelector selectedLanguage={selectedLanguage} onLanguageChange={handleLanguageChange} languages={LANGUAGES} />
            </div>

            <div className="flex items-center gap-3">
              {/* GitHub Button */}
              <button
                onClick={() => setShowGitHubPanel(true)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors flex items-center gap-2"
                title="GitHub Integration"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.455-1.157-1.11-1.466-1.11-1.466-.907-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.938 0-1.09.39-1.984 1.029-2.681-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.697 1.028 1.59 1.028 2.682 0 3.837-2.339 4.682-4.566 4.93.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.748 0 .268.18.579.688.48A10.02 10.02 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
                </svg>
                GitHub
              </button>

              {mode === "code" && (
                <button
                  onClick={handleRun}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg shadow-lg transition-colors flex items-center gap-2"
                >
                  {isLoading ? "Running..." : "Run"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {mode === "web" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="space-y-4">
                <Editor title="HTML" lang="html" value={html} onChange={setHtml} height="300px" />
                <Editor title="CSS" lang="css" value={css} onChange={setCss} height="200px" />
                <Editor title="JavaScript" lang="javascript" value={js} onChange={setJs} height="200px" />
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <Preview html={html} css={css} js={js} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-[600px]">
                <Editor
                  title={`${LANGUAGES.find((l) => l.value === selectedLanguage)?.label || "Code"} Editor`}
                  lang={getEditorLanguage()}
                  value={code}
                  onChange={setCode}
                  height="600px"
                />
              </div>

              <div className="h-[600px]">
                <Output output={output} error={error} isLoading={isLoading} />
              </div>
            </div>
          )}
        </div>
      </div>

      <GitHubPanel
        isOpen={showGitHubPanel}
        onClose={() => setShowGitHubPanel(false)}
        code={getCurrentCode()}
        language={selectedLanguage}
        onCodeLoad={handleCodeLoad}
      />
    </div>
  );
}
