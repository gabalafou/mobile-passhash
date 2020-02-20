import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';


const gutterWidth = 12;

const settingStyles: any = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
  borderBottomColor: '#ccc',
  borderBottomWidth: 0.5,
  paddingRight: gutterWidth,
  minHeight: 40,
};

export default StyleSheet.create({
  title: {
    margin: gutterWidth,
    fontSize: 28,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    alignContent: 'stretch',
    backgroundColor: 'rgb(242, 242, 247)',
  },
  scrollView: {
    flex: 1,
  },
  siteTagSuggestion: {
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderTopWidth: 1,
    height: 50,
    padding: gutterWidth,
    justifyContent: 'center',
    zIndex: 20,
  },
  siteTag: {
    paddingHorizontal: gutterWidth,
  },
  masterKey: {
    paddingHorizontal: gutterWidth,
    marginTop: gutterWidth,
  },
  generatedPassword: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: gutterWidth,
    marginTop: 2 * gutterWidth,
    borderBottomWidth: 0,
    borderWidth: 0,
  },
  copyButton: {
    marginHorizontal: gutterWidth,
    marginVertical: 20,
  },
  settingsHeader: {
    fontSize: 28,
    marginTop: 44,
    marginBottom: 10,
    marginLeft: gutterWidth,
  },
  settingSectionLabel: {
    color: '#888',
    fontSize: 13,
    textTransform: "uppercase",
    marginLeft: gutterWidth,
    marginBottom: 6,
  },
  text: {
    fontSize: 18,
  },
  settingValueText: {
    fontSize: 18,
    color: '#999',
  },
  settingSection: {
    marginVertical: 20,
  },
  settingRowGroup: {
    borderTopColor: '#ccc',
    borderTopWidth: 0.5,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5,
    backgroundColor: 'white',
    paddingLeft: gutterWidth,
  },
  setting: {
    ...settingStyles,
  },
  settingLastRow: {
    ...settingStyles,
    borderBottomWidth: 0,
  },
});
