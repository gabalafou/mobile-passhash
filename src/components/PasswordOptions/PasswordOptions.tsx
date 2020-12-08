import React from 'react';
import {
  Platform,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles, { pickerItemColor } from './styles';


type Options = {
  newPasswordBumper: number,
  requireDigit: boolean,
  requirePunctuation: boolean,
  requireMixedCase: boolean,
  noSpecial: boolean,
  digitsOnly: boolean,
  size: number,
};

type Props = {
  options: Options,
  onChangeOptions: (options: Options) => void,
  setBottomOverlayChildren: (children: any) => void,
};

export default function PasswordOptions(props: Props) {
  const { options, onChangeOptions, setBottomOverlayChildren } = props;

  const makeIndexPicker = (value, shouldUpdateOverlayOnChange, extraProps) =>
    <IndexPicker
      value={value}
      onChange={newPasswordBumper => {
        const nextOptions = { ...options, newPasswordBumper };
        onChangeOptions(nextOptions);
        if (shouldUpdateOverlayOnChange) {
          setBottomOverlayChildren(makeIndexPicker(newPasswordBumper, shouldUpdateOverlayOnChange, extraProps));
        }
      }}
      {...extraProps}
    />;

  const makeSizePicker = (value, shouldUpdateOverlayOnChange, extraProps) =>
    <SizePicker
      value={value}
      onChange={size => {
        const nextOptions = { ...options, size };
        onChangeOptions(nextOptions);
        if (shouldUpdateOverlayOnChange) {
          setBottomOverlayChildren(makeSizePicker(size, shouldUpdateOverlayOnChange, extraProps));
        }
      }}
      {...extraProps}
    />;


  return (
    <>
      <View style={styles.section}>
        <View style={styles.rowGroup}>

          {/* Generate new password */}
          <View style={styles.row}>
            <Text style={styles.text}>Increment for new password</Text>
            {Platform.OS === 'android' ? (
              makeIndexPicker(options.newPasswordBumper, false, {
                style: styles.androidPicker,
              })
            ) : (
              <Pressable
                onPress={() => {
                  setBottomOverlayChildren(
                    makeIndexPicker(options.newPasswordBumper, true, {
                      style: styles.iosPicker
                    })
                  );
                }}
              >
                <View style={styles.clickableValue}>
                  <Text style={styles.valueText}>{options.newPasswordBumper}</Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Length/size option */}
          <View style={styles.lastRow}>
            <Text style={styles.text}>Length</Text>
            {Platform.OS === 'android' ? (
              makeSizePicker(options.size, false, {
                style: styles.androidPicker,
              })
            ) : (
                <Pressable
                  onPress={() => {
                    setBottomOverlayChildren(
                      makeSizePicker(options.size, true, {
                        style: styles.iosPicker
                      }));
                  }}
                >
                  <View style={styles.clickableValue}>
                    <Text style={styles.valueText}>{options.size}</Text>
                  </View>
                </Pressable>
              )}
          </View>
        </View>
      </View>


      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Requirements</Text>
        <View style={styles.rowGroup}>
          <View style={styles.row}>
            <Text style={styles.text}>Digit</Text>
            <Switch
              onValueChange={requireDigit => {
                const updatedOptions = updateOptions(options, 'requireDigit', requireDigit);
                onChangeOptions(updatedOptions);
              }}
              value={options.requireDigit}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>Punctuation</Text>
            <Switch
              onValueChange={requirePunctuation => {
                const updatedOptions = updateOptions(options, 'requirePunctuation', requirePunctuation);
                onChangeOptions(updatedOptions);
              }}
              value={options.requirePunctuation}
            />
          </View>

          <View style={styles.lastRow}>
            <Text style={styles.text}>Mixed case</Text>
            <Switch
              onValueChange={requireMixedCase => {
                const updatedOptions = updateOptions(options, 'requireMixedCase', requireMixedCase);
                onChangeOptions(updatedOptions);
              }}
              value={options.requireMixedCase}
            />
          </View>
        </View>
      </View>


      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Restrictions</Text>
        <View style={styles.rowGroup}>
          <View style={styles.row}>
            <Text style={styles.text}>No special</Text>
            <Switch
              onValueChange={noSpecial => {
                const updatedOptions = updateOptions(options, 'noSpecial', noSpecial);
                onChangeOptions(updatedOptions)
              }}
              value={options.noSpecial}
            />
          </View>

          <View style={styles.lastRow}>
            <Text style={styles.text}>Digits only</Text>
            <Switch
              onValueChange={digitsOnly => {
                const updatedOptions = updateOptions(options, 'digitsOnly', digitsOnly)
                onChangeOptions(updatedOptions);
              }}
              value={options.digitsOnly}
            />
          </View>
        </View>
      </View>
    </>
  );
}

// Change the value of a single option and update the options object as a whole
export function updateOptions(options: Options, optionName: string, value: boolean) {
  const copy = { ...options };
  copy[optionName] = value;
  switch (optionName) {
    case 'requireDigit':
      // if we say digits are not required, then we cannot say digits only
      if (!value) {
        copy.digitsOnly = false;
      }
      return copy;
    case 'requirePunctuation':
      // if we require punctuation, then we cannot obey noSpecial, nor digitsOnly
      if (value) {
        copy.noSpecial = false;
        copy.digitsOnly = false;
      }
      return copy;
    case 'requireMixedCase':
      // if we require mixed case, then we must turn off digits only
      if (value) {
        copy.digitsOnly = false;
      }
      return copy;
    case 'noSpecial':
      // if we do not allow special characters, then we must turn off punctuation
      if (value) {
        copy.requirePunctuation = false;
      } else {
        // digitsOnly on strictly implies noSpecial, so if we turn off noSpecial, we should not
        // leave digitsOnly on
        copy.digitsOnly = false;
      }
      return copy;
    case 'digitsOnly':
      // digitsOnly implies noSpecial and requireDigit, so we turn them on too
      // also, if we turn on digits only, we must turn off mixed case and punctuation
      if (value) {
        copy.requireDigit = true;
        copy.noSpecial = true;
        copy.requirePunctuation = false;
        copy.requireMixedCase = false;
      }
      return copy;
    default:
      return copy;
  }
}

function getPickerItemColor(selectedValue, value) {
  return Platform.OS === 'android' && selectedValue === value ?
    '#008275'
    : pickerItemColor;
}

export function SizePicker(props) {
  const { value, onChange, ...rest } = props;
  return (
    <Picker
      selectedValue={value}
      onValueChange={onChange}
      {...rest}
    >
      {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26].map(size =>
        <Picker.Item
          key={size}
          label={String(size)}
          value={size}
          color={getPickerItemColor(size, value)}
        />
      )}
    </Picker>
  );
}

export function IndexPicker(props) {
  const { value, onChange, ...rest } = props;

  const numItems = value + 400;
  const items = [];
  for (let i = 0; i < numItems; i++) {
    items.push(i);
  }

  return (
    <Picker
      selectedValue={value}
      onValueChange={onChange}
      {...rest}
    >
      {items.map(item =>
        <Picker.Item
          key={item}
          label={String(item)}
          value={item}
          color={getPickerItemColor(item, value)}
        />
      )}
    </Picker>
  );
}
