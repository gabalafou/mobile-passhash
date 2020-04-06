import React from 'react';
import {
  Picker,
  Switch,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import styles from './styles';


type Options = {
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
  setFooter: (fn: () => typeof PasswordOptionsFooter) => void,
};

export default function PasswordOptions(props: Props) {
  const { options, onChangeOptions, setFooter } = props;
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Requirements</Text>
        <View style={styles.rowGroup}>
          <View
            style={styles.row}
          >
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

      <View style={styles.section}>
        <View style={styles.rowGroup}>
          <View style={styles.lastRow}>
            <Text style={styles.text}>Size</Text>
            <TouchableWithoutFeedback
              onPress={() => {
                setFooter(() => PasswordOptionsFooter);
              }}
            >
              <View style={styles.clickableValue}>
                <Text style={styles.valueText}>{options.size}</Text>
              </View>
            </TouchableWithoutFeedback>
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

export function PasswordOptionsFooter(props) {
  const { options, onChangeOptions } = props;
  return (
    <View
      style={styles.pickerContainer}
    >
      <Picker
        selectedValue={options.size}
        onValueChange={size => {
          const nextOptions = { ...options, size };
          onChangeOptions(nextOptions);
        }}
      >
        {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26].map(size =>
          <Picker.Item key={size} label={String(size)} value={size} />
        )}
      </Picker>
    </View>
  );
}
