'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { TranscribeProvider } from '@/lib/types';

interface ProviderSelectProps {
  value: TranscribeProvider;
  onChange: (value: TranscribeProvider) => void;
  disabled?: boolean;
}

const PROVIDERS = [
  { value: 'whisper' as const, label: 'Groq Whisper' },
  { value: 'assemblyai' as const, label: 'AssemblyAI' },
];

export default function ProviderSelect({
  value,
  onChange,
  disabled,
}: ProviderSelectProps) {
  return (
    <Select
      onValueChange={(v) => onChange(v as TranscribeProvider)}
      value={value}
      disabled={disabled}
    >
      <SelectTrigger className='w-full'>
        <SelectValue placeholder='เลือก Provider' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {PROVIDERS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
