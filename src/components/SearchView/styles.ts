import { Platform, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { backgroundColor, gutterWidth } from '../../styles';

export const resultItemHeight = 50;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor,
    paddingTop: Platform.OS === 'ios' ? Constants.statusBarHeight : 0,
  },
  searchBarContainer: {
    backgroundColor,
  },
  resultListContainer: {
    flex: 1,
  },
  resultList: {
    flex: 1,
    backgroundColor: 'white',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  resultItem: {
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderStartWidth: 1,
    height: resultItemHeight,
    justifyContent: 'center',
    padding: gutterWidth,
    zIndex: 20,
  },
  resultItemText: {
    fontSize: 18,
  }
});
