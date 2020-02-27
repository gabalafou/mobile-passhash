import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { gutterWidth } from '../../styles';


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
  settingsHeader: {
    fontSize: 28,
    marginTop: 44,
    marginBottom: 10,
    marginLeft: gutterWidth,
  },
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
    ...settingStyles,
  },
  lastRow: {
    ...settingStyles,
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
});
