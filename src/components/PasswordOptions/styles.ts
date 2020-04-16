import { StyleSheet, ViewStyle } from 'react-native';
import { gutterWidth } from '../../styles';


const rowStyles: ViewStyle = {
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
  sectionLabel: {
    color: '#888',
    fontSize: 13,
    textTransform: "uppercase",
    marginLeft: gutterWidth,
    marginBottom: 6,
  },
  text: {
    fontSize: 18,
  },
  valueText: {
    fontSize: 18,
    color: '#999',
  },
  section: {
    marginVertical: 20,
  },
  rowGroup: {
    borderTopColor: '#ccc',
    borderTopWidth: 0.5,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5,
    backgroundColor: 'white',
    paddingLeft: gutterWidth,
  },
  row: {
    ...rowStyles,
  },
  lastRow: {
    ...rowStyles,
    borderBottomWidth: 0,
  },
  clickableValue: {
    paddingLeft: 50,
    paddingRight: 20,
    paddingVertical: 10,
    right: -20,
  },
  pickerContainer: {
    backgroundColor: '#dde',
  },
  androidPicker: {
    width: 84,
  },
});
