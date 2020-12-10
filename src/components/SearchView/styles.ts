import { Platform, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { backgroundColor, gutterWidth } from '../../styles';

export const resultItemHeight = 50;
export const separatorHeight = 1;

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
    borderColor: '#ccc',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  separator: {
    backgroundColor: '#ccc',
    height: separatorHeight,
  },
  resultItem: {
    height: resultItemHeight,
    justifyContent: 'center',
    padding: gutterWidth,
    zIndex: 20,
  },
  resultItemText: {
    fontSize: 18,
  }
});
