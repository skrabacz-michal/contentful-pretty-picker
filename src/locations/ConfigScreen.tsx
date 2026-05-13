import { useCallback, useEffect, useState } from 'react';
import { ConfigAppSDK } from '@contentful/app-sdk';
import {
  Box,
  Flex,
  Heading,
  Note,
  Radio,
  Text,
} from '@contentful/f36-components';
import { css } from 'emotion';
import { useSDK } from '@contentful/react-apps-toolkit';
import { InstallationParameters, TRANSFORMATION_OPTIONS, TransformationType } from '../types';

const ConfigScreen = () => {
  const sdk = useSDK<ConfigAppSDK>();
  const [transformation, setTransformation] = useState<TransformationType>('none');

  const onConfigure = useCallback(async () => {
    const currentState = await sdk.app.getCurrentState();
    return {
      parameters: { transformation } as InstallationParameters,
      targetState: currentState,
    };
  }, [transformation, sdk]);

  useEffect(() => {
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      const params = await sdk.app.getParameters<InstallationParameters>();
      setTransformation(params?.transformation ?? 'none');
      sdk.app.setReady();
    })();
  }, [sdk]);

  return (
    <Flex flexDirection="column" className={css({ margin: '80px', maxWidth: '600px' })}>
      <Heading>PrettyPicker Configuration</Heading>
      <Note variant="neutral" className={css({ marginBottom: '24px' })}>
        Choose how field values are displayed. The allowed values are defined per-field in each content type's validation.
      </Note>

      <Flex flexDirection="column" gap="spacingS">
        {TRANSFORMATION_OPTIONS.map(option => (
          <Box
            key={option.value}
            padding="spacingM"
            className={css({
              border: `2px solid ${transformation === option.value ? '#0059c8' : '#d3dce0'}`,
              borderRadius: '6px',
              cursor: 'pointer',
            })}
            onClick={() => setTransformation(option.value)}
          >
            <Flex alignItems="center" gap="spacingS">
              <Radio
                id={option.value}
                name="transformation"
                value={option.value}
                isChecked={transformation === option.value}
                onChange={() => setTransformation(option.value)}
              >
                <Flex flexDirection="column">
                  <Text fontWeight="fontWeightMedium">{option.label}</Text>
                  <Text fontColor="gray500" fontSize="fontSizeS">{option.example}</Text>
                </Flex>
              </Radio>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
};

export default ConfigScreen;
