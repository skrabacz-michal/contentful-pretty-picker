import { useEffect, useState } from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
import { Note, Select } from '@contentful/f36-components';
import { css } from 'emotion';
import { useAutoResizer, useSDK } from '@contentful/react-apps-toolkit';
import { InstallationParameters } from '../types';
import { applyTransformation } from '../utils';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const transformation = (sdk.parameters.installation as InstallationParameters)?.transformation ?? 'none';
  const inValidation = sdk.field.validations?.find((v: any) => Array.isArray(v.in));
  const allowedValues: string[] = inValidation?.in ?? [];
  const [value, setValue] = useState<string>(() => sdk.field.getValue() ?? '');

  useAutoResizer();

  useEffect(() => {
    return sdk.field.onValueChanged(setValue);
  }, [sdk]);

  function handleChange(newVal: string) {
    setValue(newVal);
    sdk.field.setValue(newVal);
  }

  const isOrphaned = value !== '' && !allowedValues.includes(value);

  if (allowedValues.length === 0) {
    return (
      <Note variant="warning">
        No predefined values found. Add an &ldquo;in&rdquo; validation to this field in the content type editor.
      </Note>
    );
  }

  return (
    <>
      {isOrphaned && (
        <Note variant="warning" className={css({ marginBottom: '8px' })}>
          Saved value &ldquo;{value}&rdquo; is no longer in the configured options.
        </Note>
      )}
      <Select value={value} onChange={e => handleChange(e.target.value)}>
        <Select.Option value="">— select —</Select.Option>
        {isOrphaned && (
          <Select.Option value={value} isDisabled>
            {value} (removed)
          </Select.Option>
        )}
        {allowedValues.map(v => (
          <Select.Option key={v} value={v}>
            {applyTransformation(v, transformation)}
          </Select.Option>
        ))}
      </Select>
    </>
  );
};

export default Field;
