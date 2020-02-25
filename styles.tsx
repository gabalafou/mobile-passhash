import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';


export const gutterWidth = 12;

export default StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'stretch',
    backgroundColor: 'rgb(242, 242, 247)',
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
  siteTag: {
    paddingHorizontal: gutterWidth,
  },
  generatedPasswordLabel: {
    marginLeft: 14,
  },
  passwordOptionsHeader: {
    fontSize: 28,
    marginTop: 44,
    marginBottom: 10,
    marginLeft: gutterWidth,
  },
});
