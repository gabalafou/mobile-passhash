import * as SecureStore from 'expo-secure-store';


// The easiest way I could think of to ensure that any key
// is safe for Expo SecureStore is just to convert each character
// to its character code and join with underscores.
// For reference, the allowed characters for Expo SecureStore
// are alphanumeric plus dot, dash, and underscore.
// https://docs.expo.io/versions/latest/sdk/securestore/
function safeKey(key: string): string {
  return Array.prototype.map.call(key, ch => ch.charCodeAt())
    .join('_');
}

// Gets json from storage or null
export function getItemAsync(key: string): Promise<any> {
  return SecureStore.getItemAsync(safeKey(key)).then(
    json => json != null ? JSON.parse(json) : null
  );
}

// Sets value as json in storage
export async function setItemAsync(key: string, value: any): Promise<void> {
  return SecureStore.setItemAsync(safeKey(key), JSON.stringify(value));
}