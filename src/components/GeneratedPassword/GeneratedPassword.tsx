import React from 'react';
import { Clipboard, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import useTimedResetState from '../../use-timed-reset-state';
import { passwordRevealTimeLimit } from '../../constants';
import RevealPasswordIcon from '../RevealPasswordIcon';
import styles from './styles';


type Props = {
  password: string,
  masterPassword: string,
  onClick: () => void,
};

export default function GeneratedPassword(props: Props) {
  const { password, masterPassword, onClick } = props;
  const [shouldReveal, onChangeShouldReveal] = useTimedResetState(false, passwordRevealTimeLimit);

  const toggleShouldReveal = () => {
    onChangeShouldReveal(!shouldReveal);
  };

  const defaultDisplayValue = ''
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
        {masterPassword ?
          'Tap to copy generated password'
          : 'Generated password'
        }
      </Text>
      <View
        style={styles.generatedPassword}
      >
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          disabled={!masterPassword}
          disabledStyle={[styles.buttonStyle, {opacity: 1}]}
          onPress={() => {
            Clipboard.setString(password);
            onClick();
          }}
          title={displayValue}
          titleStyle={displayValue === defaultDisplayValue ? null : styles.buttonTitleStyle}
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
