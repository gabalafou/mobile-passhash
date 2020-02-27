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
        <View
          // pointerEvents="none" is a workaround to get Touchable and Input to work together:
          // https://github.com/facebook/react-native/issues/14958#issuecomment-324237317
          pointerEvents="none"
        >
          {/*
                  This "input" isn't actually used for input.
                  It just opens search, and then displays the result from search.
                */}
          <Input
            placeholder="Site tag"
            value={value}
            autoCapitalize="none"
            autoCompleteType="off"
            keyboardType="url"
            textContentType="URL"
            disabled={true}
            disabledInputStyle={{
              opacity: 1,
            }}
            containerStyle={styles.inputContainer}
          />
        </View>
      </TouchableHighlight>
    </View >
  );
}
