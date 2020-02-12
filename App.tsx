import React from 'react';
import {
  Platform,
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  TextInput,
  Button,
  Switch,
  View,
  Picker,
  Clipboard,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as fuzzy from 'fuzzy';
import PassHashCommon from './passhash-common';


const key = siteTag =>
  'options__' + Array.prototype.map.call(siteTag, ch => ch.charCodeAt()).join('_');



export default function App() {
  const [siteTagList, onChangeSiteTagList] = React.useState([]);
  const [siteTag, onChangeSiteTag] = React.useState('');
  const [masterKey, onChangeMasterKey] = React.useState('');
  const [isDigitRequired, onChangeIsDigitRequired] = React.useState(false);
  const [isPunctuationRequired, onChangeIsPunctuationRequired] = React.useState(false);
  const [isMixedCaseRequired, onChangeIsMixedCaseRequired] = React.useState(false);
  const [digitsOnly, onChangeDigitsOnly] = React.useState(false);
  const [noSpecial, onChangeNoSpecial] = React.useState(false);
  const [size, onChangeSize] = React.useState(16);
  const [shouldShowMatches, onChangeShouldShowMatches] = React.useState(false);
  const [shouldShowSizePicker, onChangeShouldShowSizePicker] = React.useState(false);

  const loadOptions = options => {
    const {
      isDigitRequired, isPunctuationRequired,
      isMixedCaseRequired, digitsOnly, noSpecial, size
    } = options;
    onChangeIsDigitRequired(isDigitRequired);
    onChangeIsPunctuationRequired(isPunctuationRequired);
    onChangeIsMixedCaseRequired(isMixedCaseRequired);
    onChangeDigitsOnly(digitsOnly);
    onChangeNoSpecial(noSpecial);
    onChangeSize(size);
  };

  const saveOptions = () => {
    if (!siteTag) {
      return;
    }

    const options = {
      isDigitRequired,
      isPunctuationRequired,
      isMixedCaseRequired,
      digitsOnly,
      noSpecial,
      size
    };

    let nextSiteTagList = [...siteTagList];
    if (!nextSiteTagList.includes(siteTag)) {
      nextSiteTagList.push(siteTag);
      onChangeSiteTagList(nextSiteTagList);
      SecureStore.setItemAsync('siteTagList', JSON.stringify(nextSiteTagList));
    }

    SecureStore.setItemAsync(key(siteTag), JSON.stringify(options));
  };

  React.useEffect(() => {
    const siteTagListPromise = SecureStore.getItemAsync('siteTagList');
    siteTagListPromise.then(siteTagListJson => {
      if (siteTagListJson) {
        const siteTagList = JSON.parse(siteTagListJson);
        onChangeSiteTagList(siteTagList);
      }
    });
  }, [siteTagList]);

  React.useEffect(() => {
    if (!siteTag || !siteTagList.length || !siteTagList.includes(siteTag)) {
      return;
    }
    const optionsPromise = SecureStore.getItemAsync(key(siteTag));
    optionsPromise.then(optionsJson => {
      if (optionsJson) {
        const options = JSON.parse(optionsJson);
        loadOptions(options);
      }
    });
  }, [siteTag]);

  const hashWord = React.useMemo(
    () => PassHashCommon.generateHashWord(
      siteTag,
      masterKey,
      size,
      isDigitRequired,
      isPunctuationRequired,
      isMixedCaseRequired,
      noSpecial,
      digitsOnly,
    ),
    [siteTag, masterKey, size, isDigitRequired, isPunctuationRequired, isMixedCaseRequired, noSpecial, digitsOnly]
  );

  const sortedSiteTagList = React.useMemo(() => [...siteTagList].sort(), [siteTagList]);
  const siteTagMatches = fuzzy.filter(siteTag, sortedSiteTagList).map(({string}) => string);

  return (
    <SafeAreaView style={styles.container}>

      <SearchBar
        platform={Platform.OS === 'ios' ? 'ios' : 'android'}
        placeholder="Site tag"
        onChangeText={onChangeSiteTag}
        value={siteTag}
        autoCapitalize="none"
        autoCorrect={false}
        autoCompleteType="off"
        keyboardType="url"
        onFocus={() => onChangeShouldShowMatches(true)}
        onCancel={() => {
          onChangeShouldShowMatches(false)
        }}
        onBlur={() => {/* do nothing */}}
        onSubmitEditing={() => onChangeShouldShowMatches(false)}
      />

      {shouldShowMatches &&
        <View
          style={{flex: 2}}
          onStartShouldSetResponderCapture={() => false}
        >
          <FlatList
            style={{
              // zIndex: 10,
              // position: 'absolute',
              flex: 1,
              // alignItems: 'stretch',
              backgroundColor: 'white',
              // top: 66,
              height: '100%',
              width: '100%',
              marginBottom: 30,
              borderBottomColor: '#ccc',
              borderBottomWidth: 1,
            }}
            keyboardShouldPersistTaps="always"
            data={siteTagMatches.concat(['','','','',''])}
            renderItem={({ item }) =>
              <TouchableHighlight
                onPress={() => {
                  onChangeSiteTag(item);
                  onChangeShouldShowMatches(false);
                }}
                style={styles.siteTagSuggestion}
                disabled={!item}
                underlayColor="#ccc"
              >
                <Text style={{ fontSize: 18 }}>{item}</Text>
              </TouchableHighlight>
            }
            keyExtractor={(item, index) => item || String(index)}
          />
        </View>
      }

      {!shouldShowMatches &&
        <ScrollView style={styles.scrollView}
          onTouchStart={() => onChangeShouldShowSizePicker(false)}
        >

          <TextInput
            onChangeText={text => onChangeMasterKey(text)}
            value={masterKey}
            autoCompleteType="off"
            secureTextEntry={true}
            placeholder="Master key"
          />

          <Text>{hashWord}</Text>

          <Button
            title="Copy"
            onPress={() => {
              Clipboard.setString(hashWord);
              saveOptions();
            }}
          />

          <Text>Requirements</Text>

          <View
            style={styles.setting}
          >
            <Text>Digit</Text>
            <Switch
              onValueChange={isRequired => onChangeIsDigitRequired(isRequired)}
              value={isDigitRequired}
            />
          </View>

          <View style={styles.setting}>
            <Text>Punctuation</Text>
            <Switch
              onValueChange={isRequired => onChangeIsPunctuationRequired(isRequired)}
              value={isPunctuationRequired && !noSpecial && !digitsOnly}
            />
          </View>

          <View style={styles.setting}>
            <Text>Mixed case</Text>
            <Switch
              onValueChange={isRequired => onChangeIsMixedCaseRequired(isRequired)}
              value={isMixedCaseRequired && !digitsOnly}
            />
          </View>

          <Text>Restrictions</Text>

          <View style={styles.setting}>
            <Text>No special</Text>
            <Switch
              onValueChange={noSpecial => onChangeNoSpecial(noSpecial)}
              value={noSpecial}
            />
          </View>

          <View style={styles.setting}>
            <Text>Digits only</Text>
            <Switch
              onValueChange={digitsOnly => onChangeDigitsOnly(digitsOnly)}
              value={digitsOnly}
            />
          </View>

          <View style={styles.setting}>
            <Text>Size</Text>
            <TouchableWithoutFeedback
              onPress={() => {
                onChangeShouldShowSizePicker(true);
              }}
            >
              <View style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                right: -15,
                zIndex: 10,
              }}>
                <Text>{size}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>

        </ScrollView>
      }

      {shouldShowSizePicker &&
        <View
          style={{
            // alignSelf: 'flex-end',
            // top: 100,
            flex: 2,
            backgroundColor: '#dde',
          }}
        >
          <Picker
            selectedValue={size}
            onValueChange={size => onChangeSize(size)}
          >
            {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26].map(size =>
              <Picker.Item key={size} label={String(size)} value={size} />
            )}
          </Picker>
        </View>
      }

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    alignContent: 'stretch',
    backgroundColor: 'gray',
  },
  scrollView: {
    backgroundColor: 'pink',
    marginHorizontal: 20,
    flex: 1,
  },
  siteTagSuggestion: {
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderTopWidth: 1,
    height: 50,
    padding: 4,
    justifyContent: 'center',
    zIndex: 20,
  },
  text: {
    fontSize: 20,
  },
  bottomOverlay: {
    // position: 'absolute',
    // bottom: 300,
  },
  setting: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    height: 50,
  },
});
