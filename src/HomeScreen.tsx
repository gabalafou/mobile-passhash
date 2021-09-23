import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
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
import debugLog from './debug-log';

export default function HomeScreen(props) {
  debugLog('Rendering HomeScreen');

  const { navigation, route } = props;
  const { shouldScrollToTop = false } = route.params || {};

  const dispatch = useDispatch();

  const siteTag = useSelector(getSiteTag, shallowEqual);
  const siteTagList = useSelector(getSiteTagList, shallowEqual);
  const options = useSelector(getPasswordOptions, shallowEqual);

  const [masterPassword, setMasterPassword] = useState('');
  const [bottomOverlayChildren, setBottomOverlayChildren] = useState(null);
  const [bottomOverlayOpenerBottomY, setBottomOverlayOpenerBottomY] =
    useState(null);
  const [overlayHeight, setOverlayHeight] = useState(0);

  // Naming is potentially confusing. This is the y-coordinate of the top edge
  // of the bottom overlay.
  const overlayY = useMemo(
    () => Dimensions.get('window').height - overlayHeight,
    [overlayHeight]
  );

  // Refs
  const scrollView = useRef(null);
  const masterPasswordInput = useRef(null);

  useEffect(() => {
    // Whenever site tag changes, focus the next input field (password box)
    setTimeout(() => {
      if (siteTag) {
        masterPasswordInput.current?.focus();
      }
    }, 10);
  }, [siteTag]);

  // Load all site tags from storage
  useEffect(
    () => loadSiteTags()(dispatch),
    [] // Do this only once, when the App mounts
  );

  // Load options for current site tag
  useEffect(() => {
    loadOptions(siteTag)(dispatch);
  }, [siteTag]);

  // When the user has entered a site tag and master password, we
  // use the hashing function to generate a password.
  const generatedPassword = useMemo(
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

  useEffect(() => {
    if (scrollView.current) {
      if (shouldScrollToTop) {
        scrollView.current.scrollTo({ y: 0 });
      } else if (
        bottomOverlayChildren &&
        bottomOverlayOpenerBottomY > 0 &&
        overlayY > 0 &&
        bottomOverlayOpenerBottomY - overlayY > 0
      ) {
        // When user clicks the option for size and generate new password, the
        // Picker component renders in a bottom overlay. We scroll to the bottom
        // of that option so that it appears directly above the Picker.
        scrollView.current.scrollTo({
          y:
            bottomOverlayOpenerBottomY -
            overlayY -
            // a little extra to cover the border
            0.5,
        });
      }
    }
  }, [
    bottomOverlayChildren,
    shouldScrollToTop,
    bottomOverlayOpenerBottomY,
    overlayY,
  ]);

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
          setBottomOverlayOpenerBottomY={setBottomOverlayOpenerBottomY}
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

      {/* Bottom Overlay */}
      <SlidingBottomOverlay
        onLayoutWithChildren={({ nativeEvent: { layout } }) => {
          debugLog('Setting height of bottom overlay', layout.height);
          setOverlayHeight(layout.height);
        }}
      >
        {bottomOverlayChildren}
      </SlidingBottomOverlay>
    </SafeAreaView>
  );
}

function SlidingBottomOverlay({
  children: nextChildren,
  onLayoutWithChildren,
}) {
  const [children, setChildren] = useState(null);
  const slideAnim = useMemo(() => new Animated.Value(200), []);
  const ref = useRef();

  if (!children && nextChildren) {
    // On loading, we animate up
    setChildren(nextChildren);
    Animated.timing(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 300,
    }).start();
  } else if (children && !nextChildren) {
    // On unloading, we animate down
    Animated.timing(slideAnim, {
      toValue: 200,
      useNativeDriver: true,
      duration: 300,
    }).start(({ finished }) => {
      if (finished) {
        setChildren(null);
      }
    });
  } else if (nextChildren !== children) {
    // Otherwise we load new children without animation
    setChildren(nextChildren);
  }

  return (
    <Animated.View
      style={[
        styles.bottomOverlay,
        {
          transform: [
            {
              translateY: slideAnim,
            },
          ],
        },
      ]}
      onLayout={(event) => {
        if (children) {
          onLayoutWithChildren(event);
        }
      }}
    >
      {children}
    </Animated.View>
  );
}
