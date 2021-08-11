import { Keyboard, Platform, ScrollViewProps } from 'react-native';

export // https://github.com/facebook/react-native/issues/23364
const keyboardDismissProp:
  | Pick<ScrollViewProps, 'keyboardDismissMode'>
  | Pick<ScrollViewProps, 'onScrollBeginDrag'> =
  Platform.OS === 'ios'
    ? { keyboardDismissMode: 'on-drag' }
    : { onScrollBeginDrag: Keyboard.dismiss };

export default keyboardDismissProp;
