import { StyleSheet, ViewStyle } from 'react-native';
import { gutterWidth } from '../../styles';


export const pickerItemColor = '#000';

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
  },
  iosPicker: {
    color: pickerItemColor,
    backgroundColor: '#dde',
  },
  androidPicker: {
    color: pickerItemColor,
    // This width allows Android picker to display eg "555" and "999"
    // without ellipsis, ie NOT "55..." or "99..."
    width: 92,
  }
});
