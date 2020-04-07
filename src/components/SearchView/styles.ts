import { Platform, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { gutterWidth } from '../../styles';

export const resultItemHeight = 50;

export default StyleSheet.create({
  searchBarContainer: {
    marginTop: Platform.OS === 'ios' ? Constants.statusBarHeight : 0,
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
    borderTopWidth: 1,
    height: resultItemHeight,
    justifyContent: 'center',
    padding: gutterWidth,
    zIndex: 20,
  },
  resultItemText: {
    fontSize: 18,
  }
});
