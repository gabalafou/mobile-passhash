import React from 'react';
import {
  SafeAreaView,
  Text,
  ScrollView,
  Modal,
} from 'react-native';
import { Input } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';
import * as fuzzy from 'fuzzy';
import GeneratedPassword from './components/GeneratedPassword';
import MasterPassword from './components/MasterPassword';
import PasswordOptions, { PasswordOptionsFooter } from './components/PasswordOptions';
import SearchView from './components/SearchView';
import PassHashCommon from './passhash-common';
import styles from './styles';


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
  const [siteTagList, setSiteTagList] = React.useState([]);
  const [siteTag, setSiteTag] = React.useState('');
  const [masterPassword, setMasterPassword] = React.useState('');
  const [options, setOptions] = React.useState(defaultPasswordOptions);
  const [ModalComponent, setModal] = React.useState(null);
  const [FooterComponent, setFooter] = React.useState(null);

  // Save options for site tag and save site tag to list if not already saved
  const saveOptions = () => {
    if (!siteTag) {
      return;
    }

    if (!siteTagList.includes(siteTag)) {
      const nextSiteTagList = [...siteTagList];
      nextSiteTagList.push(siteTag);
      setSiteTagList(nextSiteTagList);
      SecureStore.setItemAsync('siteTagList', JSON.stringify(nextSiteTagList));
    }

    SecureStore.setItemAsync(key(siteTag), JSON.stringify(options));
  };

  // Load all site tags from storage
  React.useEffect(() => {
    const siteTagListPromise = SecureStore.getItemAsync('siteTagList');
    siteTagListPromise.then(siteTagListJson => {
      if (siteTagListJson) {
        const siteTagList = JSON.parse(siteTagListJson);
        setSiteTagList(siteTagList);
      }
    });
  }, [siteTagList.length]);

  // Load options for current site tag (if stored)
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

  // When the user has entered a site tag and master password, we
  // use the hashing function to generate a password.
  const generatedPassword = React.useMemo(
    () => siteTag && masterPassword && PassHashCommon.generateHashWord(
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
  const siteTagMatches = React.useMemo(() =>
    fuzzy.filter(siteTag, sortedSiteTagList).map(({string}) => string),
    [sortedSiteTagList]
  );

  const scrollView = React.useRef(null);
  const masterPasswordInput = React.useRef(null);

  // When user clicks "size" option, the Picker component renders
  // in the footer. We scroll the ScrollView to the bottom so that
  // the size option appears directly above the Picker.
  React.useEffect(() => {
    if (FooterComponent && scrollView.current) {
      scrollView.current.scrollToEnd({animated: false});
    }
  });

  let modalProps = {};
  switch (ModalComponent) {
    case SearchView: {
      modalProps = {
        query: siteTag,
        onChangeQuery: setSiteTag,
        results: siteTagMatches,
        onCancel: () => setModal(null),
        onSubmit: nextSiteTag => {
          if (nextSiteTag && nextSiteTag !== siteTag) {
            setSiteTag(nextSiteTag);
          }
          setModal(null);
          // Focus next input
          setTimeout(() => {
            masterPasswordInput.current?.focus();
          }, 10)
        }
      }
      break;
    }
  }

  let footerProps = {};
  switch (FooterComponent) {
    case PasswordOptionsFooter:
      footerProps = { options, onChangeOptions: setOptions };
      break;
  }

  return (
    <SafeAreaView style={styles.container}>

      <Modal
        animationType="slide"
        transparent={false}
        visible={Boolean(ModalComponent)}
      >
        {ModalComponent && <ModalComponent {...modalProps} />}
      </Modal>

      <ScrollView
        style={styles.scrollView}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ref={scrollView}
        onTouchEnd={() => {
          if (FooterComponent) {
            setFooter(null);
          }
        }}
      >
        <Text style={styles.title}>Password Generator</Text>


        {/*
          This site tag "input" isn't actually used for input.
          It just opens search, and then displays the result from search.
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
            setModal(() => SearchView);
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
        <Text style={styles.generatedPasswordLabel}>Generated password: tap to copy</Text>


        <Text style={styles.passwordOptionsHeader}>
          Password Options
        </Text>
        <PasswordOptions
          options={options}
          onChangeOptions={setOptions}
          setFooter={setFooter}
        />
      </ScrollView>


      {FooterComponent && <FooterComponent {...footerProps} />}

    </SafeAreaView>
  );
}
