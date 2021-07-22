import 'react-native';
import React from 'react';
import App from '../App.tsx';

// Note: test renderer must be required after react-native.
import { act, create } from 'react-test-renderer';

// https://stackoverflow.com/questions/59587799/how-to-resolve-animated-usenativedriver-is-not-supported-because-the-native
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

it('renders correctly', async () => {
  await act(async () => {
    create(<App />);
  });
});
