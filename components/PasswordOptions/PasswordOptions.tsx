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
  isDigitRequired: boolean,
  isPunctuationRequired: boolean,
  isMixedCaseRequired: boolean,
  noSpecial: boolean,
  digitsOnly: boolean,
  size: number,
};

type Props = {
  options: Options,
  onChangeOptions: (options: Options) => void,
  setFooter: (footer: () => JSX.Element) => void,
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
              onValueChange={isDigitRequired => {
                onChangeOptions({
                  ...options,
                  isDigitRequired,
                  digitsOnly: isDigitRequired && options.digitsOnly,
                });
              }}
              // value={isDigitRequired || digitsOnly}
              value={options.isDigitRequired}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>Punctuation</Text>
            <Switch
              onValueChange={isPunctuationRequired => {
                onChangeOptions({
                  ...options,
                  isPunctuationRequired,
                  noSpecial: !isPunctuationRequired && options.noSpecial,
                  digitsOnly: !isPunctuationRequired && options.digitsOnly,
                });
              }}
              value={options.isPunctuationRequired}
            />
          </View>

          <View style={styles.lastRow}>
            <Text style={styles.text}>Mixed case</Text>
            <Switch
              onValueChange={isMixedCaseRequired => {
                onChangeOptions({
                  ...options,
                  isMixedCaseRequired,
                  digitsOnly: !isMixedCaseRequired && options.digitsOnly,
                })
              }}
              // value={isMixedCaseRequired && !digitsOnly}
              value={options.isMixedCaseRequired}
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
                onChangeOptions({
                  ...options,
                  noSpecial,
                  isPunctuationRequired: !noSpecial && options.isPunctuationRequired,
                  digitsOnly: noSpecial && options.digitsOnly,
                })
              }}
              // value={noSpecial || digitsOnly}
              value={options.noSpecial}
            />
          </View>

          <View style={styles.lastRow}>
            <Text style={styles.text}>Digits only</Text>
            <Switch
              onValueChange={digitsOnly => {
                onChangeOptions({
                  ...options,
                  digitsOnly,
                  isDigitRequired: digitsOnly || options.isDigitRequired,
                  isPunctuationRequired: !digitsOnly && options.isPunctuationRequired,
                  isMixedCaseRequired: !digitsOnly && options.isMixedCaseRequired,
                  noSpecial: digitsOnly || options.noSpecial,
                });
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
