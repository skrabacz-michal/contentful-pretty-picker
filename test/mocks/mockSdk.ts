import { vi } from 'vitest';

const mockSdk: any = {
  app: {
    onConfigure: vi.fn(),
    getParameters: vi.fn().mockResolvedValue(null),
    setReady: vi.fn(),
    getCurrentState: vi.fn().mockResolvedValue(null),
  },
  ids: {
    app: 'test-app',
  },
  field: {
    getValue: vi.fn().mockReturnValue(''),
    setValue: vi.fn(),
    onValueChanged: vi.fn().mockReturnValue(() => {}),
    validations: [],
  },
  parameters: {
    installation: {
      transformation: 'none',
    },
  },
};

export { mockSdk };
