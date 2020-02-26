import React from 'react';
import { Icon } from 'react-native-elements';


export default function RevealPasswordIcon(props) {
  return (
    <Icon
      name={props.shouldReveal ? 'eye' : 'eye-with-line'}
      type="entypo"
      size={15}
      color="#bbb"
    />
  );
}
