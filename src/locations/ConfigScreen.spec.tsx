import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConfigScreen from './ConfigScreen';
import { mockCma, mockSdk } from '../../test/mocks';

vi.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => mockSdk,
  useCMA: () => mockCma,
}));

describe('ConfigScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSdk.app.getParameters.mockResolvedValue(null);
    mockSdk.app.getCurrentState.mockResolvedValue(null);
    mockSdk.app.onConfigure.mockImplementation(() => {});
    mockSdk.app.setReady.mockImplementation(() => {});
  });

  it('calls setReady on mount', async () => {
    render(<ConfigScreen />);
    await waitFor(() => expect(mockSdk.app.setReady).toHaveBeenCalled());
  });

  it('defaults to none transformation when no params saved', async () => {
    render(<ConfigScreen />);
    await waitFor(() => expect(mockSdk.app.setReady).toHaveBeenCalled());
    expect(screen.getByRole('radio', { name: /none/i })).toBeChecked();
  });

  it('loads saved titleCase transformation on mount', async () => {
    mockSdk.app.getParameters.mockResolvedValue({ transformation: 'titleCase' });
    render(<ConfigScreen />);
    await waitFor(() => expect(mockSdk.app.setReady).toHaveBeenCalled());
    expect(screen.getByRole('radio', { name: /title case/i })).toBeChecked();
  });

  it('loads saved uppercase transformation on mount', async () => {
    mockSdk.app.getParameters.mockResolvedValue({ transformation: 'uppercase' });
    render(<ConfigScreen />);
    await waitFor(() => expect(mockSdk.app.setReady).toHaveBeenCalled());
    expect(screen.getByRole('radio', { name: /uppercase/i })).toBeChecked();
  });

  it('changes selection when a different radio is clicked', async () => {
    render(<ConfigScreen />);
    await waitFor(() => expect(mockSdk.app.setReady).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('radio', { name: /title case/i }));

    expect(screen.getByRole('radio', { name: /title case/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /none/i })).not.toBeChecked();
  });

  it('onConfigure returns selected transformation', async () => {
    mockSdk.app.getParameters.mockResolvedValue({ transformation: 'uppercase' });
    render(<ConfigScreen />);
    await waitFor(() => expect(mockSdk.app.onConfigure).toHaveBeenCalled());

    const calls = mockSdk.app.onConfigure.mock.calls;
    const configureCallback = calls[calls.length - 1][0];
    const result = await configureCallback();

    expect(result.parameters.transformation).toBe('uppercase');
  });
});
