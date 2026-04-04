'use client';

import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onPlayPause?: () => void;
  onNextSegment?: () => void;
  onPrevSegment?: () => void;
  onEscape?: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts({
  onPlayPause,
  onNextSegment,
  onPrevSegment,
  onEscape,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs
      if (isEditableTarget(e.target)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          onPlayPause?.();
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          onNextSegment?.();
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          onPrevSegment?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, onNextSegment, onPrevSegment, onEscape]);
}
