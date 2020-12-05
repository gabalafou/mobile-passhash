import type Swipeable from 'react-native-gesture-handler/Swipeable';

import React from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import Constants from 'expo-constants';
import useKeyboardHeight from '../../use-keyboard-height';
import styles, { resultItemHeight } from './styles';
import DeletableRow from './DeletableRow';
import { RectButton } from 'react-native-gesture-handler';


type Props = {
  query: string,
  results: string[],
  placeholder: string,
  onChangeQuery: (query: string) => void,
  onCancel: () => void,
  onSubmit: (query: string) => void,
  onDelete: (siteTag: string) => void,
};

function SearchView(props: Props) {
  const {
    query,
    placeholder,
    onChangeQuery,
    onCancel,
    onSubmit,
    onDelete,
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
      resultListRef.current.scrollToOffset({ offset: 0 });
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

  // Keep track of which item in the list is being swiped on
  const [ activeItemRef, setActiveItemRef ]:
    [Swipeable, (ref: Swipeable) => void] = React.useState(null);
  const [ activeItemIndex, setActiveItemIndex ] = React.useState(null);

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder={placeholder}
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
            paddingBottom: Platform.OS === 'ios' ? keyboardHeight : 0,
          }]}
          onLayout={event => {
            setResultListTopY(event.nativeEvent.layout.y);
          }}
        >
          <FlatList
            style={styles.resultList}
            data={paddedResults}
            getItemLayout={(_, index) => ({
              index,
              length: resultItemHeight,
              offset: (resultItemHeight + 1) * index,
            })}
            keyboardShouldPersistTaps="always"
            keyExtractor={(item, index) => item || String(index)}
            ref={resultListRef}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item, index }) =>
              <Item
                item={item}
                isNew={query === item && queryNotInResults}
                // Note: not all items can be submitted, deleted, pressed, swiped open
                onSubmit={onSubmit}
                onDelete={onDelete}
                onSwipeOpen={ref => {
                  setActiveItemIndex(index);
                  setActiveItemRef(ref);
                }}
                onPressIn={() => {
                  if (activeItemRef && index !== activeItemIndex) {
                    activeItemRef.close();
                  }
                }}
              />
            }
          />
        </View>
    </View>
  );
};

export default SearchView;


type ItemProps = {
  item: string,
  isNew: boolean,
  onSubmit: (item: string) => void,
  onDelete: (item: string) => void,
  onSwipeOpen: (ref: Swipeable) => void,
  onPressIn: () => void,
};
class Item extends React.PureComponent<ItemProps> {
  deleteItem = () => {
    const { item, onDelete } = this.props;
    onDelete(item);
  };

  markActive = (ref) => {
    const { onSwipeOpen } = this.props;
    onSwipeOpen(ref.current);
  };

  render() {
    const { item, isNew, onPressIn } = this.props;

    let inner;
    if (isNew) {
      // This is the first row when there is an
      // active query
      inner = this.renderSubmittable();
    } else if (item === '') {
      // These are blank rows to fill out the
      // list if it's too short to fill the screen
      inner = this.renderBlank();
    } else {
      // These are site tags that already exist
      inner = (
        <DeletableRow
          onDelete={this.deleteItem}
          onSwipeableOpen={this.markActive}>
          {this.renderSubmittable()}
        </DeletableRow>
      );
    }

    return (
      <Pressable
        onPressIn={onPressIn}>
        {inner}
      </Pressable>
    );
  }

  renderSubmittable() {
    const { item, onSubmit } = this.props;
    return (
      <RectButton
        onPress={() => onSubmit(item)}
        style={styles.resultItem}
      >
        <Text style={styles.resultItemText}>{item}</Text>
      </RectButton>
    );
  }

  renderBlank() {
    return (
      <View style={styles.resultItem} />
    );
  };
}
