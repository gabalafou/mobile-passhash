import Constants from 'expo-constants';

export default function debugLog(...args) {
  if (Constants.manifest.extra.debugLogging) {
    console.log(...args);
  }
}
