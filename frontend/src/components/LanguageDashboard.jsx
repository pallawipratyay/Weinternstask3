import { useState } from "react";

const CATEGORIES = {
  POPULAR: [
    { value: "html", label: "HTML", icon: "🌐" },
    { value: "css", label: "CSS", icon: "🎨" },
    { value: "javascript", label: "JavaScript", icon: "⚡" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "java", label: "Java", icon: "☕" },
  ],
  PROGRAMMING: [
    { value: "python", label: "Python", icon: "🐍" },
    { value: "java", label: "Java", icon: "☕" },
    { value: "javascript", label: "JavaScript", icon: "⚡" },
  ],
  WEB: [
    { value: "html", label: "HTML", icon: "🌐" },
    { value: "css", label: "CSS", icon: "🎨" },
    { value: "javascript", label: "JavaScript", icon: "⚡" },
    { value: "html", label: "Materialize", icon: "📱", disabled: true },
    { value: "html", label: "Bootstrap", icon: "🎨", disabled: true },
    { value: "html", label: "Tailwind CSS", icon: "💨", disabled: true },
    { value: "html", label: "HTMX", icon: "🔗", disabled: true },
    { value: "html", label: "JQuery", icon: "📜", disabled: true },
    { value: "html", label: "Foundation", icon: "🏗️", disabled: true },
    { value: "html", label: "Bulma", icon: "💎", disabled: true },
    { value: "html", label: "Uikit", icon: "🎯", disabled: true },
    { value: "html", label: "Semantic UI", icon: "🧠", disabled: true },
    { value: "html", label: "Skeleton", icon: "💀", disabled: true },
    { value: "html", label: "Milligram", icon: "⚖️", disabled: true },
    { value: "html", label: "PaperCSS", icon: "📄", disabled: true },
    { value: "html", label: "BackboneJS", icon: "🦴", disabled: true },
    { value: "html", label: "React", icon: "⚛️", disabled: true },
    { value: "html", label: "Vue", icon: "💚", disabled: true },
    { value: "html", label: "Angular", icon: "🅰️", disabled: true },
  ],
};

export default function LanguageDashboard({ onLanguageSelect }) {
  const [activeTab, setActiveTab] = useState("WEB");

  const tabs = [
    { id: "POPULAR", label: "POPULAR" },
    { id: "PROGRAMMING", label: "PROGRAMMING" },
    { id: "WEB", label: "WEB" },
  ];

  const currentLanguages = CATEGORIES[activeTab] || [];

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Tabs */}
        <div className="flex items-center gap-8 mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-semibold uppercase tracking-wide transition-colors relative ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
          ))}
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {currentLanguages.map((lang, index) => (
            <button
              key={`${lang.value}-${index}`}
              onClick={() => !lang.disabled && onLanguageSelect(lang.value)}
              disabled={lang.disabled}
              className={`
                group relative bg-white border-2 rounded-lg p-6 
                shadow-sm hover:shadow-md transition-all duration-200
                flex flex-col items-center justify-center gap-3
                min-h-[120px]
                ${
                  lang.disabled
                    ? "opacity-50 cursor-not-allowed border-gray-200"
                    : "border-gray-200 hover:border-blue-300 hover:scale-105 cursor-pointer"
                }
              `}
            >
              {/* Icon/Logo */}
              <div className="text-4xl mb-1">{lang.icon}</div>
              
              {/* Label */}
              <span
                className={`text-sm font-medium text-center ${
                  lang.disabled ? "text-gray-400" : "text-gray-700 group-hover:text-blue-600"
                }`}
              >
                {lang.label}
              </span>

              {/* Coming Soon Badge */}
              {lang.disabled && (
                <span className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Select a language or framework to start coding
          </p>
        </div>
      </div>
    </div>
  );
}
