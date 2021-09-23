import { useEffect } from 'react';
import * as ScreenCapture from 'expo-screen-capture';
import { AppState } from 'react-native';
import useTimedResetState from './use-timed-reset-state';
import { passwordRevealTimeLimit } from './constants';

// React Hook that returns a boolean value plus setter.
//
// Intended to provide functionality to reveal a password field while at the
// same time protecting the revealed password field from being screenshot, or
// showing up in the phone's app/task switcher, or remaining revealed for too
// long (by setting a timeout on the boolean that sets it back to false).
export default function usePasswordRevealer(
  revealTimeout = passwordRevealTimeLimit
) {
  const defaultValue = false;

  const [shouldReveal, setLimitedTimeShouldReveal] = useTimedResetState(
    defaultValue,
    revealTimeout
  );

  // When testing this in an Android emulator, this was the only thing
  // that worked
  useEffect(() => {
    if (shouldReveal) {
      // when revealing password, prevent the screen from being screenshot
      ScreenCapture.preventScreenCaptureAsync();
    } else {
      // otherwise allow screen shots
      ScreenCapture.allowScreenCaptureAsync();
    }
  }, [shouldReveal]);

  useEffect(() => {
    const hidePasswordWhenAppGoesToBackground = (nextAppState) => {
      // `inactive` is the keyword that actually worked on iOS in testing, but
      // this page also mentions `background`, so adding it out of an abundance
      // of precautiont. It's better to err on accidentally hiding the password
      // than accidentally revealing it.
      if (/background|inactive/i.test(nextAppState)) {
        setLimitedTimeShouldReveal(defaultValue);
      }
    };
    AppState.addEventListener('change', hidePasswordWhenAppGoesToBackground);
    return () => {
      AppState.removeEventListener(
        'change',
        hidePasswordWhenAppGoesToBackground
      );
    };
  }, []);

  // The blur event is for Android. This did not work for me in testiing,
  // but I'm adding it here anyway, just in case it cover some version
  // of Android I didn't test, or some edge case.
  useEffect(() => {
    const hidePasswordWhenAppBlurs = () => {
      setLimitedTimeShouldReveal(defaultValue);
    };
    AppState.addEventListener('blur', hidePasswordWhenAppBlurs);
    return () => {
      AppState.removeEventListener('blur', hidePasswordWhenAppBlurs);
    };
  }, []);

  return [shouldReveal, setLimitedTimeShouldReveal];
}
