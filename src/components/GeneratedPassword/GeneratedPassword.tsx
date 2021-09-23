import React from 'react';
import * as Clipboard from 'expo-clipboard';
import { Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import usePasswordRevealer from '../../use-password-revealer';
import RevealPasswordIcon from '../RevealPasswordIcon';
import styles from './styles';

type Props = {
  password: string;
  masterPassword: string;
  onClick: () => void;
};

export default function GeneratedPassword(props: Props) {
  const { password, masterPassword, onClick } = props;
  const [shouldReveal, setLimitedTimeShouldReveal] = usePasswordRevealer();

  const toggleShouldReveal = () => {
    setLimitedTimeShouldReveal(!shouldReveal);
  };

  const defaultDisplayValue = '';
  let displayValue = defaultDisplayValue;
  if (masterPassword.length) {
    if (shouldReveal) {
      displayValue = password;
    } else {
      displayValue = password.replace(/./g, '•');
    }
  }

  return (
    <>
      <Text style={styles.generatedPasswordLabel}>
        {masterPassword
          ? 'Tap to copy generated password'
          : 'Generated password'}
      </Text>
      <View style={styles.generatedPassword}>
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          disabled={!masterPassword}
          disabledStyle={[styles.buttonStyle, { opacity: 1 }]}
          onPress={() => {
            Clipboard.setString(password);
            onClick();
          }}
          title={displayValue}
          titleStyle={
            displayValue === defaultDisplayValue
              ? null
              : styles.buttonTitleStyle
          }
          raised={true}
        />
        <Button
          icon={<RevealPasswordIcon shouldReveal={shouldReveal} />}
          onPress={toggleShouldReveal}
          disabled={!masterPassword}
          type="clear"
          style={styles.revealButton}
        />
      </View>
    </>
  );
}
