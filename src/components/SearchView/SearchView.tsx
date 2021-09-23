import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  FlatList,
  Keyboard,
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
  const resultListRef: React.RefObject<FlatList<string>> = useRef();
  useEffect(() => {
    if (resultListRef.current) {
      resultListRef.current.scrollToOffset({ offset: 0 });
    }
  }, [query]);

  const [resultListTopY, setResultListTopY] = useState(
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

  // Keep track of which item in the list is active (swiped open)
  const activeItemRef: React.MutableRefObject<DeletableRow> = useRef();
  const onSwipeOpen = useCallback((deletableRow) => {
    activeItemRef.current = deletableRow;
  }, []);

  // When the user is swiping left/rigt on a row in the list, prevent the list
  // from scrolling up/down.
  const enableScroll = useCallback(() => {
    resultListRef.current.setNativeProps({
      scrollEnabled: true,
    });
  }, []);
  const disableScroll = useCallback(() => {
    resultListRef.current.setNativeProps({
      scrollEnabled: false,
    });
  }, []);

  // Provides a function to close an open row when the user taps anywhere in the
  // app screen that is not the open row.
  const closeOpenRow = useCallback((deletableRow?: DeletableRow) => {
    if (
      activeItemRef.current?.closeRow &&
      activeItemRef.current !== deletableRow
    ) {
      activeItemRef.current.closeRow();
    }
  }, []);

  return (
    <>
      <View
        // For some reason putting this on the SearchBar component below does
        // not work (i.e., when I would press-hold on the Cancel button, it
        // would not close the open row)
        onTouchStart={() => {
          closeOpenRow();
        }}
      >
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
          showCancel={true}
        />
      </View>
      <FlatList
        onLayout={(event) => {
          debugLog('Getting and setting top y', event.nativeEvent.layout.y);
          setResultListTopY(event.nativeEvent.layout.y);
        }}
        contentContainerStyle={{
          // Little tweak to push up the bottom row so the bottom
          // border/separator is visible (ios)
          paddingBottom: 2,
        }}
        style={styles.resultList}
        data={paddedResults}
        initialNumToRender={numResultsThatCover + 10}
        getItemLayout={(_, index) => ({
          index,
          length: resultItemHeight,
          offset: (resultItemHeight + separatorHeight) * index,
        })}
        keyExtractor={(item, index) =>
          item === BLANK
            ? String(index)
            : // add $ character in case `item` is a numeral,
              // in which case it could collide with String(index)
              '$' + item
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
            onResponderGrant={disableScroll}
            onResponderRelease={enableScroll}
            onTouchStart={closeOpenRow}
          />
        )}
        // Why not use the following pair?
        //
        //    keyboardShouldPersistTaps="handled"
        //    keyboardDismissMode="on-drag"
        //
        // Because it prevents the user from directly dragging a row when the
        // keyboard is open. When the keyboard is open, the first touch on the
        // row gets used to dismiss the keyboard, so it ends up requiring two
        // touches: one to dismiss the keyboard, another to swipe the row
        keyboardShouldPersistTaps="always"
        onScrollBeginDrag={() => {
          Keyboard.dismiss();
        }}
      />
    </>
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
  onSwipeOpen: (deletableRow: DeletableRow) => void;
  onResponderGrant: () => void;
  onResponderRelease: () => void;
  onTouchStart: (deletableRow?: DeletableRow) => void;
};
class Item extends React.PureComponent<ItemProps> {
  deleteItem = () => {
    const { item, onDelete } = this.props;
    onDelete(item);
  };

  markActive = (self) => {
    const { onSwipeOpen } = this.props;
    onSwipeOpen(self);
  };

  submit = () => {
    const { onSubmit, item } = this.props;
    onSubmit(item);
  };

  render() {
    const {
      item,
      isNew,
      index,
      onResponderGrant,
      onResponderRelease,
      onTouchStart,
    } = this.props;

    let inner;
    if (isNew) {
      // This is the first row when there is an
      // active query
      inner = (
        <View onTouchStart={() => onTouchStart()}>
          {this.renderSubmittable()}
        </View>
      );
    } else if (item === BLANK) {
      // These are blank rows to fill out the
      // list if it's too short to fill the screen
      inner = this.renderBlank();
    } else {
      // These are site tags that already exist
      // inner = this.renderSubmittable();
      inner = (
        <DeletableRow
          onDelete={this.deleteItem}
          onSwipeableOpen={this.markActive}
          index={index}
          onResponderGrant={onResponderGrant}
          onResponderRelease={onResponderRelease}
          onTouchStart={onTouchStart}
          onPress={this.submit}
        >
          {this.renderSubmittable()}
        </DeletableRow>
      );
    }

    return inner;
  }

  renderSubmittable() {
    const { item } = this.props;
    return (
      <Pressable
        onPress={this.submit}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? '#eee' : 'white',
          },
        ]}
      >
        <View style={styles.resultItem}>
          <Text style={styles.resultItemText}>{item}</Text>
        </View>
      </Pressable>
    );
  }

  renderBlank() {
    return <View style={styles.resultItem} />;
  }
}
