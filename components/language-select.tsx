'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'English' },
] as const;

export default function LanguageSelect({
  value,
  onChange,
  disabled,
}: LanguageSelectProps) {
  return (
    <Select onValueChange={onChange} value={value} disabled={disabled}>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder='เลือกภาษา' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
