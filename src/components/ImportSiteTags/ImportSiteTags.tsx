import React from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from 'react-native-elements';
import styles from './styles';

export default function ImportSiteTags(props) {
  const {
    onCancel,
    onSubmit,
  } = props;

  const [siteTags, setSiteTags] = React.useState();
  const [error, setError] = React.useState();

  const numSiteTags = siteTags ? Object.keys(siteTags).length : 0;

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Button
          title="Cancel"
          type="clear"
          onPress={onCancel}
        />
      </View>
      <View style={styles.main}>
        <Text>
          In the box below, paste the HTML source code of the standalone page
          generated and exported by the Passhash Firefox extension.
        </Text>
        <TextInput
          style={styles.textInput}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          onChangeText={(text) => {
            // const [errors, siteTags] = parse(text);

            // if (siteTags) {
            //   setSiteTags(siteTags);
            // }

            // if (errors) {
            //   setError(null);
            // }
          }}
          placeholder="Paste HTML"
        />
        {error &&
          <View>Error message</View>
        }
        {numSiteTags > 0 &&
          <Button
            title={`Import ${numSiteTags} site ${numSiteTags === 1 ? 'tag' : 'tags'}`}
            onPress={() => onSubmit(siteTags)}
          />
        }
      </View>
    </SafeAreaView>
  );
}
