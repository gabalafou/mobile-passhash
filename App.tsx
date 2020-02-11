import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  TextInput,
  Button,
  Switch,
  View,
  Picker,
} from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';


export default function App() {
  const [siteTag, onChangeSiteTag] = React.useState('');
  const [masterKey, onChangeMasterKey] = React.useState('');
  const [hashWord, onChangeHashWord] = React.useState('');
  const [isDigitRequired, onChangeIsDigitRequired] = React.useState(false);
  const [isPunctuationRequired, onChangeIsPunctuationRequired] = React.useState(false);
  const [isMixedCaseRequired, onChangeIsMixedCaseRequired] = React.useState(false);
  const [digitsOnly, onChangeDigitsOnly] = React.useState(false);
  const [noSpecial, onChangeNoSpecial] = React.useState(false);
  const [size, onChangeSize] = React.useState(16);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>

        <Picker
          selectedValue={siteTag}
          onValueChange={siteTag => onChangeSiteTag(siteTag)}
        >
          {['gmail.com', 'llamasinspace.net', 'sillyrabbits.org'].map(tag =>
            <Picker.Item key="tag" label={tag} value={tag} />
          )}
        </Picker>

        <TextInput
          onChangeText={text => onChangeSiteTag(text)}
          value={siteTag}
          keyboardType="url"
          textContentType="URL"
          placeholder="Site tag"
        />

        <TextInput
          onChangeText={text => onChangeMasterKey(text)}
          value={masterKey}
          autoCompleteType="password"
          secureTextEntry={true}
          placeholder="Master key"
        />

        <Text>{hashWord}</Text>

        <Text>Requirements</Text>

        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <Switch
            onValueChange={isRequired => onChangeIsDigitRequired(isRequired)}
            value={isDigitRequired}
          />
          <Text>Digit</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <Switch
            onValueChange={isRequired => onChangeIsPunctuationRequired(isRequired)}
            value={isPunctuationRequired}
          />
          <Text>Punctuation</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <Switch
            onValueChange={isRequired => onChangeIsMixedCaseRequired(isRequired)}
            value={isMixedCaseRequired}
          />
          <Text>Mixed case</Text>
        </View>

        <Text>Restrictions</Text>

        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <Switch
            onValueChange={noSpecial => onChangeNoSpecial(noSpecial)}
            value={noSpecial}
          />
          <Text>No special</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <Switch
            onValueChange={digitsOnly => onChangeDigitsOnly(digitsOnly)}
            value={digitsOnly}
          />
          <Text>Digits only</Text>
        </View>

        <Text>Size</Text>
        <Picker
          selectedValue={size}
          onValueChange={size => onChangeSize(size)}
        >
          {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26].map(size =>
            <Picker.Item key={size} label={String(size)} value={size} />
          )}
        </Picker>

        <Button
          title="Ok"
          onPress={() => { onChangeHashWord(`${siteTag} ${masterKey}`) }}
        />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  scrollView: {
    backgroundColor: 'pink',
    marginHorizontal: 20,
  },
  text: {
    fontSize: 20,
  },
  bottomOverlay: {
    // position: 'absolute',
    // bottom: 300,
  },
});
