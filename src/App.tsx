import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { shallowEqual, useSelector, useDispatch } from 'react-redux'
import { getSiteTagList, getSiteTag, getPasswordOptions } from './redux/selectors';
import { setSiteTagList, setPasswordOptions, removeSiteTag, setSiteTag } from './redux/actions';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as fuzzy from 'fuzzy';
import naturalSort from 'natural-sort';
import GeneratedPassword from './components/GeneratedPassword';
import MasterPassword from './components/MasterPassword';
import PasswordOptions from './components/PasswordOptions';
import SearchView from './components/SearchView';
import ImportSiteTags from './components/ImportSiteTags';
import SiteTag from './components/SiteTag';
import PassHashCommon from './lib/wijjo/passhash-common';
import { defaultPasswordOptions } from './constants';
import * as Storage from './storage';
import styles from './styles';
import rowStyles from './components/PasswordOptions/styles';


const RootStack = createStackNavigator();
const MainStack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootStack.Navigator mode="modal" headerMode="none">
          <RootStack.Screen name="Main" component={MainStackScreen} />
          <RootStack.Screen name="SearchSiteTags" component={SearchSiteTags} />
          <RootStack.Screen name="ImportSiteTags" component={ImportSiteTags} />
        </RootStack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

function MainStackScreen() {
  return (
    <MainStack.Navigator headerMode="none">
      <MainStack.Screen name="Home" component={HomeScreen} />
    </MainStack.Navigator>
  );
}


function SearchSiteTags(props) {

  const { navigation, route } = props;
  const { siteTag } = route.params;

  const dispatch = useDispatch();
  const siteTagList = useSelector(getSiteTagList, shallowEqual);

  const [ query, setQuery ] = React.useState(siteTag);

  // Search existing site tags for matches
  const sortedSiteTagList = React.useMemo(() => [...siteTagList].sort(naturalSort()), [siteTagList]);
  const siteTagMatches = React.useMemo(
    () => fuzzy.filter(query, sortedSiteTagList).map(({ string }) => string),
    [sortedSiteTagList, query]
  );

  return (
    <SearchView
      query={query}
      onChangeQuery={setQuery}
      results={siteTagMatches}
      // Note (gab): I think the SearchView should have the same placeholder
      // as SiteTag as a way to reenforce the connection between the two
      // fields in the UI
      placeholder={SiteTag.placeholder}
      onCancel={() => navigation.navigate('Home')}
      onSubmit={siteTag => {
        dispatch(setSiteTag(siteTag));
        navigation.navigate('Home');
      }}
      onDelete={siteTag => {
        if (siteTag === query) {
          setQuery('');
        }
        deleteSiteTag(siteTag, siteTagList, dispatch);
      }}
    />
  );
}


function HomeScreen(props) {
  const { navigation } = props;

  const dispatch = useDispatch();

  const siteTag = useSelector(getSiteTag, shallowEqual);
  const siteTagList = useSelector(getSiteTagList, shallowEqual);
  const options = useSelector(getPasswordOptions, shallowEqual);

  const [masterPassword, setMasterPassword] = React.useState('');
  const [bottomOverlayChildren, setBottomOverlayChildren] = React.useState(null);

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
  }, [siteTag])

  // Load all site tags from storage
  React.useEffect(
    () => loadSiteTags(dispatch),
    [] // Do this only once, when the App mounts
  );

  // Load options for current site tag
  React.useEffect(() => {
    loadOptions(siteTag, siteTagList, options, dispatch);
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
            navigation.navigate('SearchSiteTags', {
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
            saveOptions(options, siteTag);
            saveNewSiteTagsToList([siteTag], siteTagList, setSiteTagList, dispatch);
          }}
        />

        <Text style={styles.header}>
          Password Options
        </Text>
        <PasswordOptions
          options={options}
          onChangeOptions={options => {
            dispatch(setPasswordOptions(options));
            saveOptions(options, siteTag);
            saveNewSiteTagsToList([siteTag], siteTagList, setSiteTagList, dispatch);
          }}
          setBottomOverlayChildren={setBottomOverlayChildren}
        />

        <Text style={styles.header}>
          Import Site Tags
        </Text>
        <View style={rowStyles.section}>
          <View style={rowStyles.rowGroup}>
            <TouchableHighlight
              onPress={() => {
                navigation.navigate('ImportSiteTags');
              }}
            >
              <View style={{flex: 1, backgroundColor: '#fff'}}>
                <View style={rowStyles.lastRow}>
                  <Text style={rowStyles.text}>Import site tags...</Text>
                </View>
              </View>
            </TouchableHighlight>
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

function loadSiteTags(dispatch) {
  const siteTagListPromise = Storage.getItemAsync('siteTagList');
  siteTagListPromise.then(siteTagList => {
    if (siteTagList) {
      dispatch(setSiteTagList(siteTagList));
    }
  });
}

function loadOptions(siteTag, siteTagList, options, dispatch) {
  if (!siteTag || !siteTagList.length || !siteTagList.includes(siteTag)) {
    // For new site tags, or when clearing site tag, keep password options UI in
    // whatever state it's in, except for password bumper. In other words,
    // the password bumper/increment for new site tags should start at 0.
    const { newPasswordBumper } = defaultPasswordOptions;
    dispatch(setPasswordOptions({ ...options, newPasswordBumper }));
  }

  const optionsPromise = Storage.getItemAsync('options__' + siteTag);
  optionsPromise.then(storedOptions => {
    if (storedOptions) {
      dispatch(setPasswordOptions({ ...defaultPasswordOptions, ...storedOptions }));
    } else {
      dispatch(setPasswordOptions({ ...defaultPasswordOptions }));
    }
  });
}

export function saveOptions(options, siteTag) {
  if (!siteTag) {
    return;
  }

  // Save options for site tag
  Storage.setItemAsync('options__' + siteTag, options);
}

export function saveNewSiteTagsToList(siteTags, siteTagList, setSiteTagList, dispatch) {
  const newSiteTags = siteTags.filter(siteTag => !siteTagList.includes(siteTag));
  if (newSiteTags.length) {
    const nextSiteTagList = [...siteTagList, ...newSiteTags];
    dispatch(setSiteTagList(nextSiteTagList));
    Storage.setItemAsync('siteTagList', nextSiteTagList);
  }
}

function deleteSiteTag(siteTag, siteTagList, dispatch) {
  if (!siteTag) {
    return;
  }

  // Delete options for site tag
  dispatch(removeSiteTag(siteTag));
  Storage.deleteItemAsync('options__' + siteTag);

  // Delete site tag from site tag list
  const siteTagIndex = siteTagList.indexOf(siteTag);
  if (siteTagIndex > -1) {
    const nextSiteTagList = [
      ...siteTagList.slice(0, siteTagIndex),
      ...siteTagList.slice(siteTagIndex + 1),
    ];
    Storage.setItemAsync('siteTagList', nextSiteTagList);
  }
}
