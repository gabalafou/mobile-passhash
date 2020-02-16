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
  Modal,
} from 'react-native';
import { Button, Icon, SearchBar, Input } from 'react-native-elements';
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
  const [shouldRevealMasterKey, onChangeShouldRevealMasterKey] = React.useState(false);
  const [shouldRevealPassword, onChangeShouldRevealPassword] = React.useState(false);

  const toggleShouldRevealMasterKey = () => {
    onChangeShouldRevealMasterKey(!shouldRevealMasterKey);
  };

  const toggleShouldRevealPassword = () => {
    onChangeShouldRevealPassword(!shouldRevealPassword);
  };

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
  }, [siteTagList.length]);

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

  const scrollView = React.useRef(null);
  const masterKeyInput = React.useRef(null);

  React.useEffect(() => {
    if (shouldShowSizePicker && scrollView.current) {
      scrollView.current.scrollToEnd({animated: false});
    }
  });

  return (
    <SafeAreaView style={styles.container}>

      <Modal
        animationType="slide"
        transparent={false}
        visible={shouldShowMatches}
      >
        <SearchBar
          platform={Platform.OS === 'ios' ? 'ios' : 'android'}
          placeholder="Site tag"
          onChangeText={onChangeSiteTag}
          value={siteTag}
          autoCapitalize="none"
          autoCorrect={false}
          autoCompleteType="off"
          autoFocus={true}
          keyboardType="url"
          onFocus={() => onChangeShouldShowMatches(true)}
          onCancel={() => {
            onChangeShouldShowMatches(false);
          }}
          onSubmitEditing={() => {
            onChangeShouldShowMatches(false);
            setTimeout(() => {
              masterKeyInput.current?.focus();
            }, 10)
          }}
          containerStyle={{
            marginTop: Constants.statusBarHeight,
          }}
        />
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
                  setTimeout(() => {
                    masterKeyInput.current?.focus();
                  }, 10)
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
      </Modal>

      <ScrollView
        style={styles.scrollView}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ref={scrollView}
        onTouchEnd={() => {
          if (shouldShowSizePicker) {
            onChangeShouldShowSizePicker(false);
          }
        }}
      >
        <Text style={styles.title}>Password Generator</Text>

        <Input
          placeholder="Site tag"
          onChangeText={text => onChangeMasterKey(text)}
          value={siteTag}
          autoCapitalize="none"
          autoCompleteType="off"
          keyboardType="url"
          textContentType="none"
          disabled={true}
          disabledInputStyle={{
            opacity: 1,
          }}
          containerStyle={styles.siteTag}
          onTouchEnd={() => {
            onChangeShouldShowMatches(true);
          }}
        />

        <Input
          ref={masterKeyInput}
          placeholder="Master key"
          onChangeText={text => onChangeMasterKey(text)}
          value={masterKey}
          autoCompleteType="off"
          secureTextEntry={!shouldRevealMasterKey}
          keyboardType={shouldRevealMasterKey ?
            Platform.OS === 'android' ? 'visible-password' : 'ascii-capable'
            : 'default'
          }
          containerStyle={styles.masterKey}
          rightIcon={
            <Button
              icon={
                <Icon
                  name={shouldRevealMasterKey ? 'eye' : 'eye-with-line'}
                  type="entypo"
                  size={15}
                  color="#bbb"
                />
              }
              onPress={() => toggleShouldRevealMasterKey()}
              type="clear"
            />
          }
        />


        <View
          style={styles.generatedPassword}
        >
          <Button
            containerStyle={{
              flex: 1,
              paddingRight: 5,
            }}
            buttonStyle={{
              backgroundColor: '#ccc',
              borderRadius: 0,
              borderColor: '#aaa',
              borderWidth: 1.5,
              minHeight: 44,
            }}
            onPress={() => {
              Clipboard.setString(hashWord);
              saveOptions();
            }}
            title={
              !masterKey.length ?
                ''
                : shouldRevealPassword ?
                    hashWord
                    : hashWord.replace(/./g, '•')
            }
            titleStyle={{
              color: '#666'
            }}
          />
          <Button
            icon={
              <Icon
                name={shouldRevealPassword ? 'eye' : 'eye-with-line'}
                type="entypo"
                size={15}
                color="#bbb"
              />
            }
            onPress={() => toggleShouldRevealPassword()}
            type="clear"
          />
        </View>
        <Text style={{ marginLeft: 14 }}>Generated password: tap to copy</Text>


        <Text style={styles.settingsHeader}>
          Settings
        </Text>


        <View style={styles.settingSection}>
          <Text style={styles.settingSectionLabel}>Requirements</Text>
          <View style={styles.settingRowGroup}>
            <View
              style={styles.setting}
            >
              <Text style={styles.text}>Digit</Text>
              <Switch
                onValueChange={isRequired => {
                  onChangeIsDigitRequired(isRequired);
                  if (!isRequired && digitsOnly) {
                    onChangeDigitsOnly(false);
                  }
                }}
                value={isDigitRequired || digitsOnly}
              />
            </View>

            <View style={styles.setting}>
              <Text style={styles.text}>Punctuation</Text>
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

            <View style={styles.settingLastRow}>
              <Text style={styles.text}>Mixed case</Text>
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
          </View>
        </View>


        <View style={styles.settingSection}>
          <Text style={styles.settingSectionLabel}>Restrictions</Text>
          <View style={styles.settingRowGroup}>
            <View style={styles.setting}>
              <Text style={styles.text}>No special</Text>
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

            <View style={styles.settingLastRow}>
              <Text style={styles.text}>Digits only</Text>
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
          </View>
        </View>

        <View style={styles.settingSection}>
          <View style={styles.settingRowGroup}>
            <View style={styles.settingLastRow}>
              <Text style={styles.text}>Size</Text>
              <TouchableWithoutFeedback
                onPress={() => {
                  onChangeShouldShowSizePicker(true);
                }}
              >
                <View style={{
                  paddingLeft: 50,
                  paddingRight: 20,
                  paddingVertical: 10,
                  right: -20,
                }}>
                  <Text style={styles.settingValueText}>{size}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>

      </ScrollView>

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

const gutterWidth = 12;

const settingStyles: any = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
  borderBottomColor: '#ccc',
  borderBottomWidth: 0.5,
  paddingRight: gutterWidth,
  minHeight: 40,
};

const styles = StyleSheet.create({
  title: {
    margin: gutterWidth,
    fontSize: 28,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    alignContent: 'stretch',
    backgroundColor: 'rgb(245, 245, 252)',
  },
  scrollView: {
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
  siteTag: {
    paddingHorizontal: gutterWidth,
  },
  masterKey: {
    paddingHorizontal: gutterWidth,
    marginTop: gutterWidth,
  },
  generatedPassword: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: gutterWidth,
    marginTop: 2 * gutterWidth,
    borderBottomWidth: 0,
    borderWidth: 0,
  },
  copyButton: {
    marginHorizontal: gutterWidth,
    marginVertical: 20,
  },
  settingsHeader: {
    fontSize: 28,
    marginTop: 26,
    marginBottom: 10,
    marginLeft: gutterWidth,
  },
  settingSectionLabel: {
    color: '#888',
    fontSize: 13,
    textTransform: "uppercase",
    marginLeft: gutterWidth,
    marginBottom: 6,
  },
  text: {
    fontSize: 18,
  },
  settingValueText: {
    fontSize: 18,
    color: '#999',
  },
  settingSection: {
    marginVertical: 20,
  },
  settingRowGroup: {
    borderTopColor: '#ccc',
    borderTopWidth: 0.5,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5,
    backgroundColor: 'white',
    paddingLeft: gutterWidth,
  },
  setting: {
    ...settingStyles,
  },
  settingLastRow: {
    ...settingStyles,
    borderBottomWidth: 0,
  },
});
