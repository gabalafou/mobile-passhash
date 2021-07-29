import React from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-elements';
import { mapSiteTagsToOptions } from '../../helpers';
import { createPortableHtml } from './serializer';
import styles from '../ImportSiteTags/styles';

export default function ExportSiteTags(props) {
  const { siteTagList, onCancel } = props;

  const [portableHtml, setPortableHtml] = React.useState();
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    mapSiteTagsToOptions(siteTagList).then((siteTagOptions) => {
      createPortableHtml(siteTagOptions).then(setPortableHtml);
    });
  }, [portableHtml]);

  if (!portableHtml) {
    return null;
  }

  return (
    <SafeAreaView>
      <ScrollView
        // This prop allows the keyboard to disappear when scrolling
        // down to, e.g., read more of the error message
        keyboardDismissMode="on-drag"
        // This prop allows buttons (like the Cancel button) to be
        // while the keyboard is open. Otherwise it requires two
        // taps. One to close the keyboard. Another to hit cancel.
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Button title="Cancel" type="clear" onPress={onCancel} />
        </View>
        <View style={styles.main}>
          <Text>
            In the box below, paste the source code of the standalone HTML page
            generated and exported by the Passhash Firefox extension.
          </Text>
          <TextInput
            style={styles.textInput}
            multiline={true}
            numberOfLines={8}
            editable={false}
            textAlignVertical="top"
            value={portableHtml}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
