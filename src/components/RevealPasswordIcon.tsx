import React from 'react';
import { Entypo } from '@expo/vector-icons';


export default function RevealPasswordIcon(props) {
  return (
    <Entypo
      name={props.shouldReveal ? 'eye' : 'eye-with-line'}
      size={15}
      color="#bbb"
    />
  );
}
