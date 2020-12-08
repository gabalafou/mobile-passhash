import React from 'react';
import { TouchableHighlight, View } from 'react-native';
import { Input } from 'react-native-elements';
import styles from './styles';


export default function SiteTag(props) {
  const { value, onPress } = props;

  return (
    <View style={styles.container}>
      <TouchableHighlight
        underlayColor="#aaa"
        onPress={onPress}
      >
        {/*
          This "input" isn't actually used for input.
          It just opens search, and then displays the result from search.
         */}
        <Input
          pointerEvents="none"
          placeholder={SiteTag.placeholder}
          value={value}
          disabled={true}
          disabledInputStyle={{
            opacity: 1,
          }}
          containerStyle={{
            paddingHorizontal: 0,
          }}
          renderErrorMessage={false}
        />
      </TouchableHighlight>
    </View>
  );
}

SiteTag.placeholder = 'Site tag';
