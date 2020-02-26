import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
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

  // Load all site tags from storage
  React.useEffect(
    () => loadSiteTags(setSiteTagList),
    [] // Do this only once, when the App mounts
  );

  // Load options for current site tag
  React.useEffect(() => {
    loadOptions(siteTag, siteTagList, setOptions);
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

  // Search existing site tags for matches
  const sortedSiteTagList = React.useMemo(() => [...siteTagList].sort(), [siteTagList]);
  const siteTagMatches = React.useMemo(() =>
    fuzzy.filter(siteTag, sortedSiteTagList).map(({string}) => string),
    [sortedSiteTagList, siteTag]
  );

  const scrollView = React.useRef(null);
  const masterPasswordInput = React.useRef(null);

  // When user clicks "size" option, the Picker component renders
  // in the footer. We scroll to the bottom so that the size option
  // appears directly above the Picker.
  React.useEffect(() => {
    if (FooterComponent && scrollView.current) {
      scrollView.current.scrollToEnd({animated: false});
    }
  });

  return (
    <SafeAreaView style={styles.container}>

      <Modal
        animationType="slide"
        transparent={false}
        visible={Boolean(ModalComponent)}
      >
        {ModalComponent &&
          <ModalComponent
            {...getModalProps(ModalComponent, {
              siteTag, siteTagMatches, setSiteTag, setModal, masterPasswordInput
            })}
          />
        }
      </Modal>

      <ScrollView
        style={styles.scrollView}
        // "on-drag" - keyboard should disappear when user drags/scrolls
        // TODO: not working on Android
        keyboardDismissMode="on-drag"
        // "handled" - allows user to click hide/show password while virtual keyboard is open
        keyboardShouldPersistTaps="handled"
        ref={scrollView}
        onTouchEnd={() => {
          // Dismiss footer if user clicks outside of footer
          if (FooterComponent) {
            setFooter(null);
          }
        }}
      >


        <Text style={styles.title}>Password Generator</Text>


        <TouchableWithoutFeedback
          onPress={() => setModal(() => SearchView)}
        >
          <View>
            {/*
              This site tag "input" isn't actually used for input.
              It just opens search, and then displays the result from search.
              Must wrap in Touchable > View in order to make click work
              on Android with disabled = true.
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
            />
          </View>
        </TouchableWithoutFeedback>

        <MasterPassword
          ref={masterPasswordInput}
          value={masterPassword}
          onChange={setMasterPassword}
        />

        <GeneratedPassword
          password={generatedPassword}
          masterPassword={masterPassword}
          onClick={() => saveOptions(options, siteTag, siteTagList, setSiteTagList)}
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


      {FooterComponent &&
        <FooterComponent
          {...getFooterProps(FooterComponent, {options, setOptions})}
        />
      }

    </SafeAreaView>
  );
}

const key = siteTag =>
  'options__' + Array.prototype.map.call(siteTag, ch => ch.charCodeAt()).join('_');

function loadSiteTags(setSiteTagList) {
  const siteTagListPromise = SecureStore.getItemAsync('siteTagList');
  siteTagListPromise.then(siteTagListJson => {
    if (siteTagListJson) {
      const siteTagList = JSON.parse(siteTagListJson);
      setSiteTagList(siteTagList);
    }
  });
}

function loadOptions(siteTag, siteTagList, setOptions) {
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
}

// Save options for site tag and save site tag to list if not already saved
function saveOptions(options, siteTag, siteTagList, setSiteTagList) {
  if (!siteTag) {
    return;
  }

  // Save options for site tag
  SecureStore.setItemAsync(key(siteTag), JSON.stringify(options));

  // Save site tag to list if not already saved
  if (!siteTagList.includes(siteTag)) {
    const nextSiteTagList = [...siteTagList, siteTag];
    setSiteTagList(nextSiteTagList);
    SecureStore.setItemAsync('siteTagList', JSON.stringify(nextSiteTagList));
  }
}

function getModalProps(ModalComponent, {
  siteTag, siteTagMatches, setSiteTag, setModal, masterPasswordInput,
}) {
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
  return modalProps;
}

function getFooterProps(FooterComponent, {
  options, setOptions,
}) {
  let footerProps = {};
  switch (FooterComponent) {
    case PasswordOptionsFooter:
      footerProps = { options, onChangeOptions: setOptions };
      break;
  }
  return footerProps;
}
