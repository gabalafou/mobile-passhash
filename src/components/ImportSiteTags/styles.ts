import { StyleSheet } from 'react-native';


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
    marginTop: 28,
    borderTopColor: borderColor,
    borderTopWidth: 1,
    borderBottomColor: borderColor,
    borderBottomWidth: 1,
  },
});
