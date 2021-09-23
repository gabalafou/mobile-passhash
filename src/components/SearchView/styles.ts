import { StyleSheet } from 'react-native';
import { backgroundColor, gutterWidth } from '../../styles';

export const resultItemHeight = 50;
export const separatorHeight = 1;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor,
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
  },
  resultItemText: {
    fontSize: 18,
  },
});
