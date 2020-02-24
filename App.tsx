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
import GeneratedPassword from './components/GeneratedPassword';
import MasterPassword from './components/MasterPassword';
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
  const [masterPassword, setMasterPassword] = React.useState('');
  const [options, setOptions] = React.useState(defaultPasswordOptions);
  const [shouldShowMatches, onChangeShouldShowMatches] = React.useState(false);
  const [shouldShowSizePicker, onChangeShouldShowSizePicker] = React.useState(false);
  const [footer, setFooter] = React.useState(null);

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

  const generatedPassword = React.useMemo(
    () => PassHashCommon.generateHashWord(
      siteTag,
      masterPassword,
      options.size,
      options.isDigitRequired,
      options.isPunctuationRequired,
      options.isMixedCaseRequired,
      options.noSpecial,
      options.digitsOnly,
    ),
    [siteTag, masterPassword, options]
  );

  const sortedSiteTagList = React.useMemo(() => [...siteTagList].sort(), [siteTagList]);
  const siteTagMatches = fuzzy.filter(siteTag, sortedSiteTagList).map(({string}) => string);

  const scrollView = React.useRef(null);
  const masterPasswordInput = React.useRef(null);

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
              masterPasswordInput.current?.focus();
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

        <MasterPassword
          ref={masterPasswordInput}
          value={masterPassword}
          onChange={setMasterPassword}
        />

        <GeneratedPassword
          password={generatedPassword}
          masterPassword={masterPassword}
          onClick={() => {
            saveOptions();
          }}
        />
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
