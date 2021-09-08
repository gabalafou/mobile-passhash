import type Swipeable from 'react-native-gesture-handler/Swipeable';

import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import Constants from 'expo-constants';
import useKeyboardHeight from '../../use-keyboard-height';
import styles, { resultItemHeight, separatorHeight } from './styles';
import DeletableRow from './DeletableRow';
import { RectButton } from 'react-native-gesture-handler';
import debugLog from '../../debug-log';

type Props = {
  query: string;
  results: string[];
  placeholder: string;
  onChangeQuery: (query: string) => void;
  onCancel: () => void;
  onSubmit: (query: string) => void;
  onDelete: (siteTag: string) => void;
};

const BLANK = {};

export default function SearchView(props: Props) {
  debugLog('Rendering SearchView');

  const { query, placeholder, onChangeQuery, onCancel, onSubmit, onDelete } =
    props;

  const paddedResults = [...props.results];
  const queryNotInResults = query && !props.results.includes(query);

  if (queryNotInResults) {
    paddedResults.unshift(query);
  }

  // Whenever the search query changes, scroll to the top
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
  const windowHeight = useWindowDimensions().height;
  const availableHeightForResults =
    windowHeight - resultListTopY - keyboardHeight;
  const numResultsThatCover = Math.ceil(
    availableHeightForResults / resultItemHeight
  );
  const gap = numResultsThatCover - paddedResults.length;
  if (gap > 0) {
    paddedResults.push(...new Array(gap).fill(BLANK));
  }

  // Keep track of which item in the list is being swiped on
  const [activeItemRef, setActiveItemRef]: [
    Swipeable,
    (ref: Swipeable) => void
  ] = React.useState(null);
  const [activeItemIndex, setActiveItemIndex] = React.useState(null);

  const onSwipeOpen = (ref, index) => {
    debugLog('Setting active item index', index);
    setActiveItemIndex(index);
    debugLog('Setting active item ref');
    setActiveItemRef(ref);
  };
  const onPressIn = (index) => {
    if (activeItemRef && index !== activeItemIndex) {
      activeItemRef.close();
    }
  };

  const searchBarRef = React.useRef(null);

  return (
    <View style={styles.container}>
      <SearchBar
        ref={searchBarRef}
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
        showCancel={true}
      />
      <Pressable
        style={[
          styles.resultListContainer,
          {
            paddingBottom: Platform.OS === 'ios' ? keyboardHeight : 0,
          },
        ]}
        onLayout={(event) => {
          debugLog('Getting and setting top y');
          setResultListTopY(event.nativeEvent.layout.y);
        }}
        onPressIn={() => searchBarRef.current?.blur()}
      >
        <FlatList
          style={styles.resultList}
          data={paddedResults}
          initialNumToRender={numResultsThatCover + 10}
          getItemLayout={(_, index) => ({
            index,
            length: resultItemHeight,
            offset: (resultItemHeight + separatorHeight) * index,
          })}
          keyExtractor={
            (item, index) => (item === BLANK ? String(index) : '$' + item) // add character in case `item` is a numeral
          }
          ref={resultListRef}
          ItemSeparatorComponent={Separator}
          renderItem={({ item, index }) => (
            <Item
              item={item}
              index={index}
              isNew={query === item && queryNotInResults}
              // Note: not all items can be submitted, deleted, pressed, swiped open
              onSubmit={onSubmit}
              onDelete={onDelete}
              onSwipeOpen={onSwipeOpen}
              onPressIn={onPressIn}
            />
          )}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </Pressable>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

type ItemProps = {
  item: string;
  index: number;
  isNew: boolean;
  onSubmit: (item: string) => void;
  onDelete: (item: string) => void;
  onSwipeOpen: (ref: Swipeable, index: number) => void;
  onPressIn: (index: number) => void;
};
class Item extends React.PureComponent<ItemProps> {
  deleteItem = () => {
    const { item, onDelete } = this.props;
    onDelete(item);
  };

  markActive = (ref) => {
    const { onSwipeOpen, index } = this.props;
    onSwipeOpen(ref.current, index);
  };

  submit = () => {
    const { onSubmit, item } = this.props;
    onSubmit(item);
  };

  handlePressIn = () => {
    const { onPressIn, index } = this.props;
    onPressIn(index);
  };

  render() {
    const { item, isNew } = this.props;

    let inner;
    if (isNew) {
      // This is the first row when there is an
      // active query
      inner = this.renderSubmittable();
    } else if (item === BLANK) {
      // These are blank rows to fill out the
      // list if it's too short to fill the screen
      inner = this.renderBlank();
    } else {
      // These are site tags that already exist
      inner = (
        <DeletableRow
          onDelete={this.deleteItem}
          onSwipeableOpen={this.markActive}
        >
          {this.renderSubmittable()}
        </DeletableRow>
      );
    }

    return <Pressable onPressIn={this.handlePressIn}>{inner}</Pressable>;
  }

  renderSubmittable() {
    const { item } = this.props;
    return (
      <RectButton onPress={this.submit} style={styles.resultItem}>
        <Text style={styles.resultItemText}>{item}</Text>
      </RectButton>
    );
  }

  renderBlank() {
    return <View style={styles.resultItem} />;
  }
}
