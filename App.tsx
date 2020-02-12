import React from 'react';
import {
  Platform,
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  TextInput,
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
import { Button, SearchBar, Input } from 'react-native-elements';
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

  const scrollView = React.useRef();

  React.useEffect(() => {
    if (shouldShowSizePicker && scrollView.current) {
      // @ts-ignore
      scrollView.current.scrollToEnd();
    }
  });

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
          onChangeShouldShowMatches(false);
        }}
        onBlur={() => {/* do nothing */}}
        onSubmitEditing={() => onChangeShouldShowMatches(false)}
      />

      {shouldShowMatches &&
        <View
          style={{flex: 1}}
          onStartShouldSetResponderCapture={() => false}
        >
          <FlatList
            style={{
              flex: 1,
              backgroundColor: 'white',
              marginBottom: 30,
              borderBottomColor: '#ccc',
              borderBottomWidth: 1,
            }}
            keyboardShouldPersistTaps="always"
            data={siteTagMatches.concat(['','','','',''])}
            renderItem={({ item }) =>
              <TouchableHighlight
                onPress={() => {
                  if (item) {
                    onChangeSiteTag(item);
                  }
                  onChangeShouldShowMatches(false);
                }}
                style={styles.siteTagSuggestion}
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
        <ScrollView
          style={styles.scrollView}
          ref={(ref: any) => scrollView.current = ref}
          onTouchEnd={() => {
            if (shouldShowSizePicker) {
              onChangeShouldShowSizePicker(false);
            }
          }}
        >

          <Input
            onChangeText={text => onChangeMasterKey(text)}
            value={masterKey}
            autoCompleteType="off"
            secureTextEntry={true}
            placeholder="Master key"
          />

          <Input
            placeholder="Generated password"
            value={masterKey && hashWord}
            secureTextEntry={true}
            disabled={true}
          />

          <Button
            title="Copy"
            style={styles.copyButton}
            onPress={() => {
              Clipboard.setString(hashWord);
              saveOptions();
            }}
          />

          <Text style={styles.settingsHeader}>
            Settings
          </Text>

          <Text>Requirements</Text>

          <View
            style={styles.setting}
          >
            <Text>Digit</Text>
            <Switch
              onValueChange={isRequired => {
                onChangeIsDigitRequired(isRequired);
                if (!isRequired) {
                  onChangeDigitsOnly(false);
                }
              }}
              value={isDigitRequired || digitsOnly}
            />
          </View>

          <View style={styles.setting}>
            <Text>Punctuation</Text>
            <Switch
              onValueChange={isRequired => {
                onChangeIsPunctuationRequired(isRequired);
                if (isRequired) {
                  onChangeNoSpecial(false);
                  onChangeDigitsOnly(false);
                }
              }}
              value={isPunctuationRequired}
            />
          </View>

          <View style={styles.setting}>
            <Text>Mixed case</Text>
            <Switch
              onValueChange={isRequired => {
                onChangeIsMixedCaseRequired(isRequired);
                if (isRequired) {
                  onChangeDigitsOnly(false);
                }
              }}
              value={isMixedCaseRequired && !digitsOnly}
            />
          </View>

          <Text>Restrictions</Text>

          <View style={styles.setting}>
            <Text>No special</Text>
            <Switch
              onValueChange={noSpecial => {
                onChangeNoSpecial(noSpecial);
                if (noSpecial) {
                  onChangeIsPunctuationRequired(false);
                } else {
                  onChangeDigitsOnly(false);
                }
              }}
              value={noSpecial || digitsOnly}
            />
          </View>

          <View style={styles.setting}>
            <Text>Digits only</Text>
            <Switch
              onValueChange={digitsOnly => {
                onChangeDigitsOnly(digitsOnly);
                if (digitsOnly) {
                  onChangeIsDigitRequired(true);
                  onChangeIsPunctuationRequired(false);
                  onChangeIsMixedCaseRequired(false);
                  onChangeNoSpecial(true);
                }
              }}
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
    backgroundColor: 'white',
  },
  scrollView: {
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
  copyButton: {
    marginVertical: 20,
  },
  settingsHeader: {
    fontSize: 28,
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
  },
  setting: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
  },
});
