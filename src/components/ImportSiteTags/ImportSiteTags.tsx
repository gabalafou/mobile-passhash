import React from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-elements';
import keyboardDismissProp from '../shared/keyboardDismissProp';
import parser from './parser';
import styles from '../shared/import-export-styles';
import debugLog from '../../debug-log';

export default function ImportSiteTags(props) {
  debugLog('Rendering ImportSiteTags');

  const { siteTagList, onCancel, onSubmit } = props;

  const [siteTagOptions, setSiteTagOptions] = React.useState({});
  const [error, setError] = React.useState('');

  const numSiteTags = siteTagOptions ? Object.keys(siteTagOptions).length : 0;

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
        // This prop allows the keyboard to disappear when scrolling down to,
        // e.g., read more of the error message
        {...keyboardDismissProp}
      >
        <View style={styles.main}>
          <Text style={styles.text}>
            In the box below, paste the source code of the standalone HTML page
            generated and exported by the Passhash Firefox extension.
          </Text>
          <TextInput
            style={styles.textInput}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCompleteType="off"
            autoCorrect={false}
            onChangeText={(value) => {
              setSiteTagOptions({});

              if (value === '') {
                setError('');
                return;
              }

              let siteTagOptions = {};
              try {
                siteTagOptions = parser.parseSiteTagsAndOptions(value);
              } catch (err) {
                setError(
                  'An unexpected error occurred in parsing the pasted text. ' +
                    'Please check your input, possibly try again, and if it continues to fail, ' +
                    'please send your input to the app developers so they can troubleshoot the problem.'
                );
                return;
              }

              // If user pastes something and we cannot get any
              // site tags out of it, inform her
              if (!Object.keys(siteTagOptions).length) {
                setError('No site tags were found in the pasted text.');
                return;
              }

              // Check for site tags that would conflict with
              // already existing site tags in the app and let user
              // know
              const alreadyExistingSiteTags = Object.keys(
                siteTagOptions
              ).filter((siteTag) => siteTagList.includes(siteTag));
              if (alreadyExistingSiteTags.length > 0) {
                setError(
                  'The following site tags will not be imported because they have already been saved: ' +
                    alreadyExistingSiteTags.join(', ') +
                    '.'
                );
                alreadyExistingSiteTags.forEach((siteTag) => {
                  delete siteTagOptions[siteTag];
                });
              } else {
                setError('');
              }

              setSiteTagOptions(siteTagOptions);
            }}
            placeholder="Paste HTML"
            testID="text-input"
          />

          {Boolean(error) && (
            <View testID="error-container">
              <Text style={[styles.text, styles.errorMessage]}>{error}</Text>
              {numSiteTags === 0 && (
                <View style={styles.zeroSiteTagsMessage}>
                  <Text style={styles.text}>
                    Please note that the importer expects site tags to have been
                    exported in a very specific format. The site tags should
                    appear as, e.g.:
                  </Text>
                  <Text style={styles.codeBlock}>
                    &lt;option value="dpm8"&gt;example.com&lt;/option&gt;
                  </Text>
                  <Text style={styles.text}>
                    in the source code of the standalone HTML file generated by
                    the Firefox extension. Even slight deviations from the
                    format could cause the importer to fail.
                  </Text>
                </View>
              )}
            </View>
          )}

          {numSiteTags > 0 && (
            <Button
              title={`Import ${numSiteTags} site ${
                numSiteTags === 1 ? 'tag' : 'tags'
              }`}
              onPress={() => onSubmit(siteTagOptions)}
              style={styles.submitButton}
              testID="submit-button"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
