import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Button, colors } from 'react-native-elements';
import keyboardDismissProp from '../shared/keyboardDismissProp';
import { mapSiteTagsToOptions } from '../../helpers';
import { createPortableHtml } from './serializer';
import styles from '../shared/import-export-styles';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';

export default function ExportSiteTags(props) {
  const { siteTagList, onCancel } = props;

  const [portableHtml, setPortableHtml] = React.useState();
  const [error, setError] = React.useState('');

  const fileUri = FileSystem.cacheDirectory + 'passhash-portable.html';
  React.useEffect(() => {
    if (!siteTagList.length) {
      return;
    }
    mapSiteTagsToOptions(siteTagList)
      .then(createPortableHtml)
      .then((html) =>
        FileSystem.writeAsStringAsync(fileUri, html).then(() =>
          setPortableHtml(html)
        )
      )
      .catch(() => {
        setError(
          'There was an unexpected error while generating the file to export. Please report this bug to the app maintainers.'
        );
      });
  }, [siteTagList]);

  let main;
  if (error) {
    main = <Text style={[styles.text, styles.errorMessage]}>{error}</Text>;
  } else if (!siteTagList.length) {
    main = (
      <Text style={styles.text}>
        There is nothing to export because you have not created any site tags
        yet.
      </Text>
    );
  } else {
    main = (
      <>
        <Text style={styles.text}>
          Clicking the Share button below will export your site tags (plus
          password options) as a standalone, portable web page (a single HTML
          file). Your passwords are NOT exported. This app never stores your
          passwords anywhere.
          {'\n'}
          {'\n'}
          The web page is essentially a backup. You can save the file to a cloud
          drive (such as iCloud or Dropbox), a server, your email, a portable
          hard drive—anywhere that allows you to access your backup even if you
          delete or cannot access this app.
          {'\n'}
          {'\n'}
          If you want to access your backup page on the Web, but you don't
          already have your own server, there are{' '}
          <Text
            style={{ color: colors.primary }}
            accessibilityRole="link"
            onPress={() => {
              Linking.openURL(
                'https://github.com/gabalafou/mobile-passhash#backups'
              );
            }}
          >
            some instructions on how to upload and host your page on GitHub
          </Text>{' '}
          on this app's homepage.
          {'\n'}
        </Text>
        <Button
          title="Share"
          containerStyle={styles.shareButton}
          onPress={() => {
            Sharing.shareAsync(fileUri, {
              UTI: 'public.html',
              mimeType: 'text/html',
            });
          }}
          disabled={!portableHtml}
        />
      </>
    );
  }

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Button title="Cancel" type="clear" onPress={onCancel} />
      </View>
      <ScrollView
        style={styles.scrollView}
        // This prop allows buttons (like the Cancel button) to be pressed while
        // the keyboard is open. Otherwise it requires two taps. One to close
        // the keyboard. Another to hit cancel.
        keyboardShouldPersistTaps="handled"
        // This prop allows the keyboard to disappear when scrolling down
        {...keyboardDismissProp}
      >
        <View style={styles.main}>{main}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
