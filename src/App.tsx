import React from 'react';
import {
  Modal,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as fuzzy from 'fuzzy';
import naturalSort from 'natural-sort';
import GeneratedPassword from './components/GeneratedPassword';
import MasterPassword from './components/MasterPassword';
import PasswordOptions, { IndexPicker, SizePicker } from './components/PasswordOptions';
import SearchView from './components/SearchView';
import SiteTag from './components/SiteTag';
import PassHashCommon from './lib/wijjo/passhash-common';
import * as Storage from './storage';
import styles from './styles';


export const defaultPasswordOptions = Object.freeze({
  requireDigit: true,
  requirePunctuation: true,
  requireMixedCase: true,
  noSpecial: false,
  digitsOnly: false,
  size: 16,
  newPasswordBumper: 0,
});

export default function App() {
  const [siteTagList, setSiteTagList] = React.useState([]);
  const [siteTag, setSiteTag] = React.useState('');
  const [masterPassword, setMasterPassword] = React.useState('');
  const [options, setOptions] = React.useState(defaultPasswordOptions);
  const [ModalComponent, setModal] = React.useState(null);
  const [bottomOverlayChildren, setBottomOverlayChildren] = React.useState(null);

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
      options.newPasswordBumper ? `${siteTag}:${options.newPasswordBumper}` : siteTag,
      masterPassword,
      options.size,
      options.requireDigit,
      options.requirePunctuation,
      options.requireMixedCase,
      options.noSpecial,
      options.digitsOnly,
    ),
    [siteTag, masterPassword, options]
  );

  // Search existing site tags for matches
  const sortedSiteTagList = React.useMemo(() => [...siteTagList].sort(naturalSort()), [siteTagList]);
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
    if (bottomOverlayChildren && scrollView.current) {
      // TODO: make this smoother, less jarring
      scrollView.current.scrollToEnd({animated: false});
    }
  });

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle="dark-content" />

      <Modal
        animationType="slide"
        transparent={false}
        visible={Boolean(ModalComponent)}
      >
        {ModalComponent === SearchView &&
          <SearchView
            query={siteTag}
            onChangeQuery={setSiteTag}
            results={siteTagMatches}
            onCancel={() => setModal(null)}
            onSubmit={nextSiteTag => {
              if (nextSiteTag && nextSiteTag !== siteTag) {
                setSiteTag(nextSiteTag);
              }
              setModal(null);
              // Focus next input
              setTimeout(() => {
                masterPasswordInput.current?.focus();
              }, 10)
            }}
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
          if (bottomOverlayChildren) {
            setBottomOverlayChildren(null);
          }
        }}
      >


        <Text style={styles.title}>Password Generator</Text>


        <SiteTag
          onPress={() => setModal(() => SearchView)}
          value={siteTag}
        />

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
          setBottomOverlayChildren={setBottomOverlayChildren}
        />

      </ScrollView>

      {bottomOverlayChildren &&
        <View
          style={styles.bottomOverlay}
        >
          {bottomOverlayChildren}
        </View>
      }

    </SafeAreaView>
  );
}

function loadSiteTags(setSiteTagList) {
  const siteTagListPromise = Storage.getItemAsync('siteTagList');
  siteTagListPromise.then(siteTagList => {
    if (siteTagList) {
      setSiteTagList(siteTagList);
    }
  });
}

function loadOptions(siteTag, siteTagList, setOptions) {
  if (!siteTag || !siteTagList.length || !siteTagList.includes(siteTag)) {
    return;
  }
  const optionsPromise = Storage.getItemAsync('options__' + siteTag);
  optionsPromise.then(options => {
    if (options) {
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
  Storage.setItemAsync('options__' + siteTag, options);

  // Save site tag to list if not already saved
  if (!siteTagList.includes(siteTag)) {
    const nextSiteTagList = [...siteTagList, siteTag];
    setSiteTagList(nextSiteTagList);
    Storage.setItemAsync('siteTagList', nextSiteTagList);
  }
}
