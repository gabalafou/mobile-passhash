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
  Dimensions,
} from 'react-native';
import { Button, Icon, SearchBar, Input } from 'react-native-elements';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as fuzzy from 'fuzzy';
import PassHashCommon from './passhash-common';
import styles from './styles';
import SearchView from './components/SearchView';
import PasswordOptions, { PasswordOptionsFooter } from './components/PasswordOptions';


const key = siteTag =>
  'options__' + Array.prototype.map.call(siteTag, ch => ch.charCodeAt()).join('_');

const defaultPasswordOptions = {
  isDigitRequired: true,
  isPunctuationRequired: true,
  isMixedCaseRequired: true,
  noSpecial: false,
  digitsOnly: false,
  size: 16,
};

export default function App() {
  const [siteTagList, onChangeSiteTagList] = React.useState([]);
  const [siteTag, onChangeSiteTag] = React.useState('');
  const [masterKey, onChangeMasterKey] = React.useState('');
  const [options, setOptions] = React.useState(defaultPasswordOptions);
  const [shouldShowMatches, onChangeShouldShowMatches] = React.useState(false);
  const [shouldShowSizePicker, onChangeShouldShowSizePicker] = React.useState(false);
  const [shouldRevealMasterKey, onChangeShouldRevealMasterKey] = React.useState(false);
  const [shouldRevealPassword, onChangeShouldRevealPassword] = React.useState(false);
  const [footer, setFooter] = React.useState(null);

  const toggleShouldRevealMasterKey = () => {
    onChangeShouldRevealMasterKey(!shouldRevealMasterKey);
  };

  const toggleShouldRevealPassword = () => {
    onChangeShouldRevealPassword(!shouldRevealPassword);
  };

  const saveOptions = () => {
    if (!siteTag) {
      return;
    }

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
        setOptions(options);
      }
    });
  }, [siteTag]);

  const hashWord = React.useMemo(
    () => PassHashCommon.generateHashWord(
      siteTag,
      masterKey,
      options.size,
      options.isDigitRequired,
      options.isPunctuationRequired,
      options.isMixedCaseRequired,
      options.noSpecial,
      options.digitsOnly,
    ),
    [siteTag, masterKey, options]
  );

  const sortedSiteTagList = React.useMemo(() => [...siteTagList].sort(), [siteTagList]);
  const siteTagMatches = fuzzy.filter(siteTag, sortedSiteTagList).map(({string}) => string);

  const scrollView = React.useRef(null);
  const masterKeyInput = React.useRef(null);

  React.useEffect(() => {
    if (footer && scrollView.current) {
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
        <SearchView
          query={siteTag}
          onChangeQuery={onChangeSiteTag}
          results={siteTagMatches}
          onCancel={() => onChangeShouldShowMatches(false)}
          onSubmit={nextSiteTag => {
            if (nextSiteTag && nextSiteTag !== siteTag) {
              onChangeSiteTag(nextSiteTag);
            }
            onChangeShouldShowMatches(false);
            // Focus next input
            setTimeout(() => {
              masterKeyInput.current?.focus();
            }, 10)
          }}
        />
      </Modal>

      <ScrollView
        style={styles.scrollView}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ref={scrollView}
        onTouchEnd={() => {
          if (footer) {
            setFooter(null);
          }
        }}
      >
        <Text style={styles.title}>Password Generator</Text>

        {/*
          This site tag "input" isn't actually used for input.
          It's just opens site tag search and displays result.
        */}
        <Input
          placeholder="Site tag"
          value={siteTag}
          autoCapitalize="none"
          autoCompleteType="off"
          keyboardType="url"
          textContentType="URL"
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
          autoCapitalize="none"
          autoCompleteType="off"
          autoCorrect={false}
          secureTextEntry={!shouldRevealMasterKey}
          keyboardType={shouldRevealMasterKey ?
            Platform.OS === 'android' ? 'visible-password' : 'ascii-capable'
            : 'default'
          }
          textContentType="password"
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
              borderRadius: 5,
              borderColor: '#bbb',
              borderWidth: 1,
              minHeight: 44,
            }}
            disabled={!masterKey.length}
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
          Password Options
        </Text>

        <PasswordOptions
          options={options}
          onChangeOptions={setOptions}
          setFooter={setFooter}
        />
      </ScrollView>

      {footer === PasswordOptionsFooter &&
        <PasswordOptionsFooter options={options} onChangeOptions={setOptions} />
      }

    </SafeAreaView>
  );
}
