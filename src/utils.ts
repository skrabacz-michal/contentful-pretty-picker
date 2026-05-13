import { TransformationType } from './types';

export function splitWords(value: string): string[] {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean);
}

export function applyTransformation(value: string, type: TransformationType): string {
  const words = splitWords(value);
  switch (type) {
    case 'titleCase':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    case 'uppercase':
      return words.join(' ').toUpperCase();
    case 'none':
    default:
      return value;
  }
}
