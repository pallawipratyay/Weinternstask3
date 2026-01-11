export default function LanguageSelector({ selectedLanguage, onLanguageChange, languages }) {
  return (
    <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
      <label className="text-sm text-gray-300 font-medium">Language:</label>
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

