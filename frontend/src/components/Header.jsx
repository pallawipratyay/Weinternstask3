export default function Header() {
  return (
    <header className="bg-white border-t border-b border-gray-200">
      <div className="w-full px-6 py-3">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-blue-600 rounded-lg p-2 flex items-center justify-center w-10 h-10">
              <span className="text-white text-lg font-bold leading-none">&lt; /&gt;</span>
            </div>
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Code Editor</h1>
              <p className="text-xs text-gray-600 leading-tight">Write, Run & Share Code Online</p>
            </div>
          </div>
          <div className="flex items-center flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
