import React from 'react';
import { Clipboard, View } from 'react-native';
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

  let displayValue = '';
  if (masterPassword.length) {
    if (shouldReveal) {
      displayValue = password;
    } else {
      displayValue = password.replace(/./g, '•');
    }
  }

  return (
    <View
      style={styles.generatedPassword}
    >
      <Button
        buttonStyle={styles.buttonStyle}
        containerStyle={styles.buttonContainerStyle}
        disabled={!masterPassword.length}
        onPress={() => {
          Clipboard.setString(password);
          onClick();
        }}
        title={displayValue}
        titleStyle={styles.buttonTitleStyle}
      />
      <Button
        icon={<RevealPasswordIcon shouldReveal={shouldReveal} />}
        onPress={toggleShouldReveal}
        type="clear"
      />
    </View>
  )
}
