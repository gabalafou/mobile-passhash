import { Platform, StyleSheet } from 'react-native';
import { gutterWidth } from '../../styles';


export default StyleSheet.create({
  generatedPassword: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0,
    borderWidth: 0,
    paddingHorizontal: gutterWidth,
  },
  generatedPasswordLabel: {
    marginLeft: 14,
    marginBottom: 1,
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
    marginRight: 5,
  },
  buttonTitleStyle: {
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  revealButton: {
    marginRight: 4,
  }
});
