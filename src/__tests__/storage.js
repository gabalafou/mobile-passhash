import * as SecureStore from 'expo-secure-store';
import {
  byteLimit,
  chunkIdentifier,
  getItemAsync,
  safeKey,
  setItemAsync,
  splitIntoChunks,
  stringLimit,
} from '../storage';

jest.mock('expo-secure-store');

describe('storage', () => {

  describe('splitIntoChunks', () => {

    it('should split a string into chunks that fit within the limit', () => {
      const buf = Buffer.alloc(byteLimit * 2);
      const bigString = buf.toString('utf16le');
      const chunks = splitIntoChunks(bigString, stringLimit);
      expect(chunks).toHaveLength(2);
      expect(typeof chunks[0]).toBe('string');
      expect(typeof chunks[1]).toBe('string');
      expect(chunks[0]).toHaveLength(1024); // 2 bytes per JS string element
      expect(chunks[1]).toHaveLength(1024);
      expect(Buffer.byteLength(chunks[0], 'utf16le')).toBe(byteLimit);
      expect(Buffer.byteLength(chunks[1], 'utf16le')).toBe(byteLimit);
    });

    it('should return single chunk if original string is already within limit', () => {
      const smallString = 'a';
      const chunks = splitIntoChunks(smallString, stringLimit);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(smallString);
    });
  });


  describe('getItemAsync', () => {

    it('should rejoin data that has been chunked', async () => {
      SecureStore.getItemAsync
        .mockResolvedValueOnce(`[${chunkIdentifier},2]`)
        .mockResolvedValueOnce('"foo')
        .mockResolvedValueOnce('bar"');

      const value = await getItemAsync('key');

      expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(3);
      expect(SecureStore.getItemAsync).toHaveBeenNthCalledWith(1, safeKey('key'));
      expect(SecureStore.getItemAsync).toHaveBeenNthCalledWith(2, safeKey('key-' + chunkIdentifier + '[0]'));
      expect(SecureStore.getItemAsync).toHaveBeenNthCalledWith(3, safeKey('key-' + chunkIdentifier + '[1]'));

      expect(value).toBe('foobar');
    });
  });


  describe('setItemAsync', () => {

    beforeEach(() => {
      SecureStore.setItemAsync.mockResolvedValue();
    });

    afterEach(() => {
      SecureStore.setItemAsync.mockReset();
    });

    it('should store oversized data in chunks', () => {
      const key = 'should store oversized data in chunks';
      const bigString = new Array(stringLimit * 1.5).fill('a').join('');
      const expectedChunks = [
        '"' + bigString.slice(0, stringLimit - 1), // minus 1 for the JSON quotation mark
        bigString.slice(stringLimit - 1) + '"',
      ];
      setItemAsync(key, bigString);
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(3);
      expect(SecureStore.setItemAsync)
        .toHaveBeenNthCalledWith(1, safeKey(key), `[${chunkIdentifier},2]`);
      expect(SecureStore.setItemAsync)
        .toHaveBeenNthCalledWith(2, safeKey(key + '-' + chunkIdentifier + '[0]'), expectedChunks[0]);
      expect(SecureStore.setItemAsync)
        .toHaveBeenNthCalledWith(3, safeKey(key + '-' + chunkIdentifier + '[1]'), expectedChunks[1]);
    });

    it('should store data that is within limits normally (no chunks)', () => {
      const key = 'max size data';
      const maxString = new Array(stringLimit - 2).fill('z').join('');
      expect(JSON.stringify(maxString)).toHaveLength(stringLimit);
      setItemAsync(key, maxString);
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
      expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(1, safeKey(key), '"' + maxString + '"');
    });
  });


  describe('basic functionality', () => {

    beforeEach(() => {
      const mockDataStore = {};
      SecureStore.setItemAsync.mockImplementation(
        (key, value) => Promise.resolve(void (mockDataStore[key] = value)));
      SecureStore.getItemAsync.mockImplementation(key => Promise.resolve(mockDataStore[key]));
    });

    it('should be able to store and retrive small value', async () => {
      const key = 'basic set and get';
      const expectedValue = ['foo', 'bar'];
      expect(await getItemAsync(key)).toBeNull();
      await setItemAsync(key, expectedValue);
      const value = await getItemAsync(key);
      expect(value).toEqual(expectedValue);
    });

    it('should be able to store and retrieve large value', async () => {
      const key = 'oversized set and get';
      const siteTagGenerator = function* (base, max) {
        let index = 0;
        while (index < max) {
          yield base + ':' + (++index);
        }
      };
      const siteTagList = Array.from(siteTagGenerator('example.com', 500));
      expect(await getItemAsync(key)).toBeNull();
      await setItemAsync(key, siteTagList);
      expect(await getItemAsync(key)).toEqual(siteTagList);
    });
  });
});
