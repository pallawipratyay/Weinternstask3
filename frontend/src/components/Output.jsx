export default function Output({ output, error, isLoading }) {
  return (
    <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700 h-full flex flex-col">
      <div className="bg-black px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Output</h2>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Running...</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {error ? (
          <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap">
            {error}
          </pre>
        ) : (
          <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
            {output || "(no output)"}
          </pre>

        )}
      </div>
    </div>
  );
}
