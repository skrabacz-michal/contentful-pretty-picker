import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Field from './Field';
import { mockCma, mockSdk } from '../../test/mocks';

vi.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => mockSdk,
  useCMA: () => mockCma,
  useAutoResizer: vi.fn(),
}));

describe('Field', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSdk.field.getValue.mockReturnValue('');
    mockSdk.field.onValueChanged.mockReturnValue(() => {});
    mockSdk.field.validations = [];
    mockSdk.parameters.installation = { transformation: 'none' };
  });

  it('shows warning when field has no in-validation', () => {
    render(<Field />);
    expect(screen.getByText(/No predefined values found/)).toBeInTheDocument();
  });

  it('renders raw values when transformation is none', () => {
    mockSdk.field.validations = [{ in: ['do-it', 'hero-block'] }];
    render(<Field />);
    expect(screen.getByText('do-it')).toBeInTheDocument();
    expect(screen.getByText('hero-block')).toBeInTheDocument();
  });

  it('renders title-cased labels when transformation is titleCase', () => {
    mockSdk.field.validations = [{ in: ['do-it', 'hero-block'] }];
    mockSdk.parameters.installation = { transformation: 'titleCase' };
    render(<Field />);
    expect(screen.getByText('Do It')).toBeInTheDocument();
    expect(screen.getByText('Hero Block')).toBeInTheDocument();
  });

  it('renders uppercased labels when transformation is uppercase', () => {
    mockSdk.field.validations = [{ in: ['do-it', 'hero-block'] }];
    mockSdk.parameters.installation = { transformation: 'uppercase' };
    render(<Field />);
    expect(screen.getByText('DO IT')).toBeInTheDocument();
    expect(screen.getByText('HERO BLOCK')).toBeInTheDocument();
  });

  it('renders the placeholder option', () => {
    mockSdk.field.validations = [{ in: ['do-it'] }];
    render(<Field />);
    expect(screen.getByText('— select —')).toBeInTheDocument();
  });

  it('calls sdk.field.setValue on selection change', () => {
    mockSdk.field.validations = [{ in: ['do-it'] }];
    render(<Field />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'do-it' } });
    expect(mockSdk.field.setValue).toHaveBeenCalledWith('do-it');
  });

  it('shows orphaned-value warning when stored value is not in field validations', () => {
    mockSdk.field.getValue.mockReturnValue('oldValue');
    mockSdk.field.validations = [{ in: ['do-it'] }];
    render(<Field />);
    expect(
      screen.getByText(/Saved value.*oldValue.*is no longer in the configured options/)
    ).toBeInTheDocument();
    expect(screen.getByText('oldValue (removed)')).toBeInTheDocument();
  });

  it('does not show orphaned warning when value is in field validations', () => {
    mockSdk.field.getValue.mockReturnValue('do-it');
    mockSdk.field.validations = [{ in: ['do-it'] }];
    render(<Field />);
    expect(
      screen.queryByText(/is no longer in the configured options/)
    ).not.toBeInTheDocument();
  });
});
