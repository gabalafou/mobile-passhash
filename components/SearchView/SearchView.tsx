import React from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import Constants from 'expo-constants';
import useKeyboardHeight from '../../use-keyboard-height';
import styles, { resultItemHeight } from './styles';


type Props = {
  query: string,
  results: string[],
  onChangeQuery: (query: string) => void,
  onCancel: () => void,
  onSubmit: (query: string) => void,
};

export default function SearchView(props: Props) {
  const {
    query,
    results,
    onChangeQuery,
    onCancel,
    onSubmit,
  } = props;

  let paddedResults = results;

  if (query && !results.includes(query)) {
    paddedResults = [query, ...paddedResults];
  }

  const windowHeight = Dimensions.get('window').height;
  const [resultListY, setResultListY] = React.useState(
    Constants.statusBarHeight + 40 // search bar height is 40
  );
  const keyboardHeight = useKeyboardHeight();

  const availableHeightForResults = (windowHeight - resultListY) - keyboardHeight;

  // Push several blanks for display purposes, i.e. make
  // the results list look like a ruled page, with lines going all
  // the way down to the top edge of the onscreen keyboard
  const numResultsThatCover = Math.ceil(availableHeightForResults / resultItemHeight);
  const gap = numResultsThatCover - results.length;
  if (gap > 0) {
    paddedResults = [...paddedResults, ...new Array(gap).fill('')];
  }

  return (
    <>
      <SearchBar
        placeholder="Site tag"
        value={query}
        onChangeText={onChangeQuery}
        containerStyle={styles.searchBarContainer}
        autoCapitalize="none"
        autoCompleteType="off"
        autoCorrect={false}
        autoFocus={true}
        keyboardType="url"
        onCancel={onCancel}
        onSubmitEditing={() => onSubmit(query)}
        platform={Platform.OS === 'ios' ? 'ios' : 'android'}
      />

      <View
        style={styles.resultListContainer}
        onLayout={event => {
          setResultListY(event.nativeEvent.layout.y);
        }}
      >
        <FlatList
          style={styles.resultList}
          data={paddedResults}
          keyboardShouldPersistTaps="always"
          keyExtractor={(item, index) => item || String(index)}
          renderItem={({ item }) =>
            item !== '' ? (
              <TouchableHighlight
                onPress={() => onSubmit(item)}
                style={styles.resultItem}
                underlayColor="#ccc"
              >
                <Text style={styles.resultItemText}>{item}</Text>
              </TouchableHighlight>
            ) : (
              <TouchableWithoutFeedback
                onPress={() => onCancel()}
              >
                <View style={styles.resultItem} />
              </TouchableWithoutFeedback>
            )
          }
        />
      </View>
    </>
  );
};
