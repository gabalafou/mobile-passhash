import { Platform, StyleSheet } from 'react-native';


export const borderColor = 'rgb(200, 200, 200)';

export default StyleSheet.create({
  header: {
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  main: {
    marginHorizontal: 28,
    marginTop: 10,
  },
  textInput: {
    height: 120,
    marginVertical: 28,
    borderTopColor: borderColor,
    borderTopWidth: 1,
    borderBottomColor: borderColor,
    borderBottomWidth: 1,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 28,
  },
  zeroSiteTagsMessage: {
    marginBottom: 28,
  },
  codeBlock: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    backgroundColor: '#eee',
    marginVertical: 10,
    padding: 10,
  },
});
