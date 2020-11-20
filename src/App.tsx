import React from 'react';
import {
  Modal,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as fuzzy from 'fuzzy';
import naturalSort from 'natural-sort';
import GeneratedPassword from './components/GeneratedPassword';
import MasterPassword from './components/MasterPassword';
import PasswordOptions from './components/PasswordOptions';
import SearchView from './components/SearchView';
import ImportSiteTags from './components/ImportSiteTags';
import SiteTag from './components/SiteTag';
import PassHashCommon from './lib/wijjo/passhash-common';
import defaultPasswordOptions from './default-password-options';
import * as Storage from './storage';
import styles from './styles';
import rowStyles from './components/PasswordOptions/styles';


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
    loadOptions(siteTag, siteTagList, options, setOptions);
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
        {renderModalComponent(ModalComponent, {
          siteTag,
          setSiteTag,
          siteTagList,
          setSiteTagList,
          siteTagMatches,
          setModal,
          masterPasswordInput,
          scrollView,
        })}
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


        <Text style={styles.header}>
          Password Options
        </Text>
        <PasswordOptions
          options={options}
          onChangeOptions={options => {
            setOptions(options);
            saveOptions(options, siteTag, siteTagList, setSiteTagList);
          }}
          setBottomOverlayChildren={setBottomOverlayChildren}
        />

        <Text style={styles.header}>
          Import Site Tags
        </Text>
        <View style={rowStyles.section}>
          <View style={rowStyles.rowGroup}>
            <View style={rowStyles.lastRow}>
              <TouchableOpacity
                onPress={() => {
                  setModal(() => ImportSiteTags);
                }}
              >
                <Text style={rowStyles.text}>Import site tags...</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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

function loadOptions(siteTag, siteTagList, options, setOptions) {
  if (!siteTag || !siteTagList.length || !siteTagList.includes(siteTag)) {
    // For new site tags, or when clearing site tag, keep password options UI in
    // whatever state it's in, except for password bumper. In other words,
    // the password bumper/increment for new site tags should start at 0.
    const { newPasswordBumper } = defaultPasswordOptions;
    setOptions({ ...options, newPasswordBumper: 0 })
  }

  const optionsPromise = Storage.getItemAsync('options__' + siteTag);
  optionsPromise.then(storedOptions => {
    if (storedOptions) {
      setOptions({ ...defaultPasswordOptions, ...storedOptions });
    } else {
      setOptions({ ...defaultPasswordOptions });
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

function renderModalComponent(ModalComponent, props) {
  const {
    siteTag,
    setSiteTag,
    siteTagList,
    setSiteTagList,
    siteTagMatches,
    setModal,
    masterPasswordInput,
    scrollView,
  } = props;

  switch (ModalComponent) {
    case SearchView:
      return (
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
      );
    case ImportSiteTags:
      return (
        <ImportSiteTags
          siteTagList={siteTagList}
          onCancel={() => setModal(null)}
          onSubmit={siteTagOptions => {
            Object.keys(siteTagOptions).forEach(siteTag => {
              saveOptions(siteTagOptions[siteTag], siteTag, siteTagList, setSiteTagList);
            });
            setModal(null);
            if (scrollView.current) {
              scrollView.current.scrollTo({y: 0});
            }
          }}
        />
      );
  }
}
