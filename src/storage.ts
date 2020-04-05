import * as SecureStore from 'expo-secure-store';


// Expo Secure Store has a limit of 2048 bytes.
export const byteLimit = 2048;
// JavaScript strings are 16 bits (2 bytes) per element (see ECMAScript standard)
export const stringLimit = byteLimit / 2;
// Random value used to detect when a key points to a value that has been chunked up
export const chunkIdentifier = 25410146;

// The easiest way I could think of to ensure that any key
// is safe for Expo SecureStore is just to convert each character
// to its character code and join with underscores.
// For reference, the allowed characters for Expo SecureStore
// are alphanumeric plus dot, dash, and underscore.
// https://docs.expo.io/versions/latest/sdk/securestore/
export function safeKey(key: string): string {
  return Array.prototype.map.call(key, ch => ch.charCodeAt())
    .join('_');
}

function chunkKey(key: string, i: number) {
  return `${key}-${chunkIdentifier}[${i}]`;
}

// Gets json from storage, or returns null
export async function getItemAsync(key: string): Promise<any> {
  const json = await SecureStore.getItemAsync(safeKey(key));

  if (json == null) {
    return null;
  }

  const value = JSON.parse(json);

  if (isChunkSignifier(value)) {
    const allChunks = await getChunks(key, value[1]);
    const rejoinedJson = allChunks.join('');
    return JSON.parse(rejoinedJson);
  } else {
    return value;
  }
}

function isChunkSignifier(value: any): boolean {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value[0] === chunkIdentifier &&
    !isNaN(parseInt(value[1]))
  );
}

function getChunks(key: string, numChunks: number): Promise<string[]> {
  let chunkPromises = [];
  for (let i = 0; i < numChunks; i++) {
    const predictableKey = chunkKey(key, i);
    const chunkPromise = SecureStore.getItemAsync(safeKey(predictableKey));
    chunkPromises.push(chunkPromise);
  }
  return Promise.all(chunkPromises);
}

/**
 * Takes in a string value (i.e., JSON) and splits it up into pieces that fit
 * within the limits of the storage system.
 *
 * @param str The string (JSON) that will be chopped up into sizes that can be stored
 * @param sliceSize The max size of a string that the system can store
 */
export function splitIntoChunks(
  str: string,
  sliceSize: number,
): string[] {
  const numChunks = Math.ceil(str.length / sliceSize);
  let chunks = new Array(numChunks);

  for (let i = 0; i < numChunks; i++) {
    const offset = i * sliceSize;
    const chunk = str.slice(offset, offset + sliceSize);
    chunks[i] = chunk;
  }

  return chunks;
}

// Sets value as json in storage
export async function setItemAsync(key: string, value: any): Promise<void[] | void> {
  const json = JSON.stringify(value);

  if (json.length > stringLimit) {
    const chunks = splitIntoChunks(json, stringLimit);
    const chunkSignifier = [chunkIdentifier, chunks.length];
    return Promise.all([
      SecureStore.setItemAsync(safeKey(key), JSON.stringify(chunkSignifier)),
      ...chunks.map((chunk, i) => {
        const predictableKey = chunkKey(key, i);
        return SecureStore.setItemAsync(safeKey(predictableKey), chunk);
      }),
    ]);
  } else {
    return SecureStore.setItemAsync(safeKey(key), json);
  }
}
