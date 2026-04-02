'use client';

import { Field, FieldLabel } from './ui/field';
import {
  Select,
  SelectContent,
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
];

export default function LanguageSelect({
  value,
  onChange,
  disabled,
}: LanguageSelectProps) {
  return (
    <Field>
      <Select onValueChange={onChange} value={value} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder='เลือกภาษา' />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label} ({lang.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
