import { describe, expect, it } from 'vitest';
import { applyTransformation, splitWords } from './utils';

describe('splitWords', () => {
  it('splits kebab-case', () => {
    expect(splitWords('do-it')).toEqual(['do', 'it']);
  });

  it('splits snake_case', () => {
    expect(splitWords('do_it')).toEqual(['do', 'it']);
  });

  it('splits camelCase', () => {
    expect(splitWords('heroBlock')).toEqual(['hero', 'Block']);
  });

  it('handles single word', () => {
    expect(splitWords('page')).toEqual(['page']);
  });

  it('handles multiple hyphens', () => {
    expect(splitWords('a--b')).toEqual(['a', 'b']);
  });
});

describe('applyTransformation', () => {
  describe('titleCase', () => {
    it('converts kebab-case', () => {
      expect(applyTransformation('do-it', 'titleCase')).toBe('Do It');
    });

    it('converts snake_case', () => {
      expect(applyTransformation('hero_block', 'titleCase')).toBe('Hero Block');
    });

    it('converts camelCase', () => {
      expect(applyTransformation('heroBlock', 'titleCase')).toBe('Hero Block');
    });

    it('lowercases subsequent letters in a word', () => {
      expect(applyTransformation('HERO', 'titleCase')).toBe('Hero');
    });
  });

  describe('uppercase', () => {
    it('converts kebab-case', () => {
      expect(applyTransformation('do-it', 'uppercase')).toBe('DO IT');
    });

    it('converts camelCase', () => {
      expect(applyTransformation('heroBlock', 'uppercase')).toBe('HERO BLOCK');
    });
  });

  describe('none', () => {
    it('returns value unchanged', () => {
      expect(applyTransformation('do-it', 'none')).toBe('do-it');
    });

    it('returns camelCase value unchanged', () => {
      expect(applyTransformation('heroBlock', 'none')).toBe('heroBlock');
    });
  });
});
