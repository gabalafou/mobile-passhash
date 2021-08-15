import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import {
  getSiteTagList,
  getSiteTag,
  getPasswordOptions,
} from './redux/selectors';
import { setPasswordOptions } from './redux/actions';
import { loadSiteTags, loadOptions, saveSiteTag } from './helpers';
import GeneratedPassword from './components/GeneratedPassword';
import MasterPassword from './components/MasterPassword';
import PasswordOptions from './components/PasswordOptions';
import SiteTag from './components/SiteTag';
import PassHashCommon from './lib/wijjo/passhash-common';
import styles from './styles';
import rowStyles from './components/PasswordOptions/styles';

export default function HomeScreen(props) {
  const { navigation, route } = props;
  const { shouldScrollToTop = false } = route.params || {};

  const dispatch = useDispatch();

  const siteTag = useSelector(getSiteTag, shallowEqual);
  const siteTagList = useSelector(getSiteTagList, shallowEqual);
  const options = useSelector(getPasswordOptions, shallowEqual);

  const [masterPassword, setMasterPassword] = React.useState('');
  const [bottomOverlayChildren, setBottomOverlayChildren] =
    React.useState(null);

  // Refs
  const scrollView = React.useRef(null);
  const masterPasswordInput = React.useRef(null);

  React.useEffect(() => {
    // Whenever site tag changes, focus the next input field (password box)
    setTimeout(() => {
      if (siteTag) {
        masterPasswordInput.current?.focus();
      }
    }, 10);
  }, [siteTag]);

  // Load all site tags from storage
  React.useEffect(
    () => loadSiteTags()(dispatch),
    [] // Do this only once, when the App mounts
  );

  // Load options for current site tag
  React.useEffect(() => {
    loadOptions(siteTag)(dispatch);
  }, [siteTag]);

  // When the user has entered a site tag and master password, we
  // use the hashing function to generate a password.
  const generatedPassword = React.useMemo(
    () =>
      siteTag &&
      masterPassword &&
      PassHashCommon.generateHashWord(
        options.newPasswordBumper
          ? `${siteTag}:${options.newPasswordBumper}`
          : siteTag,
        masterPassword,
        options.size,
        options.requireDigit,
        options.requirePunctuation,
        options.requireMixedCase,
        options.noSpecial,
        options.digitsOnly
      ),
    [siteTag, masterPassword, options]
  );

  React.useEffect(() => {
    if (scrollView.current) {
      if (shouldScrollToTop) {
        scrollView.current.scrollTo({ y: 0 });
      } else if (bottomOverlayChildren) {
        // When user clicks "size" option, the Picker component renders
        // in a bottom overlay. We scroll to the bottom so that the size option
        // appears directly above the Picker.
        // TODO: figure out some other way to do this
        scrollView.current.scrollToEnd();
      }
    }
  }, [bottomOverlayChildren, shouldScrollToTop]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

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
          onPress={() => {
            navigation.navigate('Search', {
              siteTag,
            });
          }}
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
          onClick={() => {
            saveSiteTag(siteTag, options, siteTagList)(dispatch);
          }}
        />

        <Text style={styles.header}>Password Options</Text>
        <PasswordOptions
          options={options}
          onChangeOptions={(options) => {
            dispatch(setPasswordOptions(options));
            saveSiteTag(siteTag, options, siteTagList)(dispatch);
          }}
          setBottomOverlayChildren={setBottomOverlayChildren}
        />

        <Text style={styles.header}>Import / Export</Text>
        <View style={rowStyles.section}>
          <View style={rowStyles.rowGroup}>
            <Pressable
              onPress={() => {
                navigation.navigate('Import');
              }}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? '#ccc' : 'white',
              })}
            >
              {({ pressed }) => (
                <View
                  style={[
                    rowStyles.row,
                    pressed && { backgroundColor: '#ccc' },
                  ]}
                >
                  <Text style={rowStyles.text}>Import site tags...</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                navigation.navigate('Export');
              }}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? '#ccc' : 'white',
              })}
            >
              {({ pressed }) => (
                <View
                  style={[
                    rowStyles.lastRow,
                    pressed && { backgroundColor: '#ccc' },
                  ]}
                >
                  <Text style={rowStyles.text}>Export site tags...</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {bottomOverlayChildren && (
        <View style={styles.bottomOverlay}>{bottomOverlayChildren}</View>
      )}
    </SafeAreaView>
  );
}
