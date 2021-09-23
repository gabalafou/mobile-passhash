import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export const backgroundColor = 'rgb(242, 242, 247)';
export const gutterWidth = 12;

export default StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'stretch',
    backgroundColor,
    paddingTop: Constants.statusBarHeight,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: gutterWidth,
  },
  header: {
    fontSize: 28,
    marginTop: 44,
    marginBottom: 10,
    marginLeft: gutterWidth,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
    width: '100%',
  },
});
