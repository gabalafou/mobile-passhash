import React from 'react';
import { Keyboard } from 'react-native';


export default function useKeyboardHeight() {
  const [keyboardHeight, onChangeKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    const onShow = event => {
      onChangeKeyboardHeight(event.endCoordinates.height);
    };
    const onHide = () => {
      onChangeKeyboardHeight(0);
    };

    Keyboard.addListener('keyboardDidShow', onShow);
    Keyboard.addListener('keyboardDidHide', onHide);

    return () => {
      Keyboard.removeListener('keyboardDidShow', onShow);
      Keyboard.removeListener('keyboardDidHide', onHide);
    }
  });

  return keyboardHeight;
}
