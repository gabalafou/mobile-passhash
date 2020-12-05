import React from 'react';
import { Platform } from 'react-native';
import { Input, Button } from 'react-native-elements';
import RevealPasswordIcon from '../RevealPasswordIcon';
import styles from './styles';


type Props = {
  value: string,
  onChange: (value: string) => void,
};

function MasterPassword(props: Props, ref) {
  const { value, onChange } = props;
  const [shouldReveal, setShouldReveal] = React.useState(false);

  const toggleShouldReveal = () => {
    setShouldReveal(!shouldReveal);
  };

  React.useEffect(() => {
    // See https://github.com/facebook/react-native/issues/30123
    // for why this hack is needed
    if (Platform.OS === 'android' && ref.current) {
      ref.current.setNativeProps({
        style: {fontFamily: 'sans-serif'}
      });
    }
  });

  let key = 'master-password';
  if (Platform.OS === 'android') {
    // For some reason Android doesn't seem to like flipping the `secureTextEntry`
    // prop on the TextInput element. When I tested this in an emulator, once the
    // TextInput is made un-secure, it won't go back to secure (i.e., hiding the
    // password characters as you type), unless you force React to recreate the
    // element by explicitly changing the element's key, as we do here:
    key = shouldReveal ? 'master-password-reveal' : 'master-password-secure';
  }

  return (
    <Input
      key={key}
      ref={ref}
      containerStyle={styles.masterPassword}
      placeholder="Master password"
      onChangeText={text => onChange(text)}
      value={value}
      autoCapitalize="none"
      autoCompleteType="off"
      autoCorrect={false}
      secureTextEntry={!shouldReveal}
      keyboardType={shouldReveal ?
        (Platform.OS === 'android' ? 'visible-password' : 'ascii-capable')
        : 'default'
      }
      textContentType="password"
      rightIcon={
        <Button
          icon={<RevealPasswordIcon shouldReveal={shouldReveal} />}
          onPress={() => toggleShouldReveal()}
          type="clear"
        />
      }
      renderErrorMessage={false}
    />
  );
}

export default React.forwardRef(MasterPassword);
