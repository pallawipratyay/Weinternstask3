import MonacoEditor from "@monaco-editor/react";

export default function Editor({ title, lang, value, onChange, height = "400px" }) {
  return (
    <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700 flex flex-col h-full">
      <div className="bg-black px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 px-2 py-1 bg-gray-800 rounded">
            {lang}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height={height}
          theme="vs-dark"
          language={lang}
          value={value}
          onChange={(v) => onChange(v || "")}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
