"use client";

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: "th", label: "ไทย" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "hi", label: "हिन्दी" },
  { code: "vi", label: "Tiếng Việt" },
];

export default function LanguageSelect({ value, onChange, disabled }: LanguageSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        ภาษาในวิดีโอ
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label} ({lang.code})
          </option>
        ))}
      </select>
    </div>
  );
}
