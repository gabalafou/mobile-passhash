import React from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import Constants from 'expo-constants';
import useKeyboardHeight from '../../use-keyboard-height';
import styles, { resultItemHeight } from './styles';
import GmailStyleSwipeableRow from './GmailStyleSwipeableRow';
import AppleStyleSwipeableRow from './AppleStyleSwipeableRow';
import { RectButton } from 'react-native-gesture-handler';


const DeletableRow = Platform.OS === 'android' ?
  GmailStyleSwipeableRow :
  AppleStyleSwipeableRow;

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
    onChangeQuery,
    onCancel,
    onSubmit,
  } = props;

  let paddedResults = [...props.results];

  const queryNotInResults = query && !paddedResults.includes(query);
  if (queryNotInResults) {
    paddedResults.unshift(query);
  }

  // Whenever the search query changes, scroll to the top of the
  const resultListRef: React.RefObject<FlatList<string>> = React.createRef();
  React.useEffect(() => {
    if (resultListRef.current) {
      resultListRef.current.scrollToOffset({offset: 0});
    }
  }, [query]);

  const [resultListTopY, setResultListTopY] = React.useState(
    Constants.statusBarHeight + 40 // search bar height is 40
  );
  const keyboardHeight = useKeyboardHeight();

  // Push several blanks for display purposes, i.e. make
  // the results list look like a ruled page, with lines going all
  // the way down to the top edge of the onscreen keyboard
  const windowHeight = Dimensions.get('window').height;
  const availableHeightForResults = (windowHeight - resultListTopY) - keyboardHeight;
  const numResultsThatCover = Math.ceil(availableHeightForResults / resultItemHeight);
  const gap = numResultsThatCover - paddedResults.length;
  if (gap > 0) {
    paddedResults.push(...new Array(gap).fill(''));
  }

  return (
    <View style={styles.container}>
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
        style={[styles.resultListContainer, {
          paddingBottom: Platform.OS === 'ios' ? keyboardHeight : 0
        }]}
        onLayout={event => {
          setResultListTopY(event.nativeEvent.layout.y);
        }}
      >
        <FlatList
          style={styles.resultList}
          data={paddedResults}
          getItemLayout={(_, index) => ({
            index, length: resultItemHeight, offset: resultItemHeight * index,
          })}
          keyboardShouldPersistTaps="always"
          keyExtractor={(item, index) => item || String(index)}
          ref={resultListRef}
          renderItem={({ item }) =>
            //<DeletableRow>
              <Item item={item} onSubmit={onSubmit} />
            //</DeletableRow>
          }
        />
      </View>
    </View>
  );
};


type ItemProps = {
  item: string,
  onSubmit: (item: string) => void,
};
class Item extends React.PureComponent<ItemProps> {
  render() {
    const { item, onSubmit } = this.props;
    return (
      // For blank lines
      <View style={styles.resultItem} />
    );
  }
}
