import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn utility', () => {
  it('merges multiple classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
  });

  it('resolves tailwind class conflicts', () => {
    expect(cn('px-2 py-2', 'p-4')).toBe('p-4');
  });

  it('handles nested class values', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });
});
