import { StyleSheet } from 'react-native';
import { gutterWidth } from '../../styles';


export default StyleSheet.create({
  generatedPassword: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0,
    borderWidth: 0,
    marginTop: 2 * gutterWidth,
    paddingHorizontal: gutterWidth,
  },
  buttonStyle: {
    backgroundColor: '#ccc',
    borderColor: '#bbb',
    borderRadius: 5,
    borderWidth: 1,
    minHeight: 44,
  },
  buttonContainerStyle: {
    flex: 1,
    paddingRight: 5,
  },
  buttonTitleStyle: {
    color: '#666'
  }
});
