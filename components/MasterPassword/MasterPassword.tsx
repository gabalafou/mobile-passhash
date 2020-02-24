import React from 'react';
import { Platform } from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
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
  return (
    <Input
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
        Platform.OS === 'android' ? 'visible-password' : 'ascii-capable'
        : 'default'
      }
      textContentType="password"
      rightIcon={
        <Button
          icon={
            <Icon
              name={shouldReveal ? 'eye' : 'eye-with-line'}
              type="entypo"
              size={15}
              color="#bbb"
            />
          }
          onPress={() => toggleShouldReveal()}
          type="clear"
        />
      }
    />
  )
}

export default React.forwardRef(MasterPassword);
