export type TransformationType = 'titleCase' | 'uppercase' | 'none';

export interface TransformationOption {
  value: TransformationType;
  label: string;
  example: string;
}

export const TRANSFORMATION_OPTIONS: TransformationOption[] = [
  { value: 'titleCase', label: 'Title Case', example: 'do-it → Do It' },
  { value: 'uppercase', label: 'UPPERCASE', example: 'do-it → DO IT' },
  { value: 'none', label: 'None (raw value)', example: 'do-it → do-it' },
];

export interface InstallationParameters {
  transformation: TransformationType;
}
