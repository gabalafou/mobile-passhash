import React from 'react';

function debounce(fn, wait) {
  let timeoutId = null;
  return function (...args) {
    const context = this;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    timeoutId = setTimeout(() => {
      fn.apply(context, args);
      timeoutId = null;
    }, wait);
  };
}

// Allows a React component to create a state variable that
// reverts to its initial state after some specified duration
// from the last time it was changed
export default function useTimedResetState(initialValue, wait) {
  const [value, setValue] = React.useState(initialValue);
  const startResetTimer = React.useCallback(
    debounce(() => setValue(initialValue), wait),
    []
  );
  const resettingSetter = React.useCallback(
    (nextValue) => {
      if (nextValue !== initialValue) {
        startResetTimer();
      }
      setValue(nextValue);
    },
    [initialValue, startResetTimer, setValue]
  );
  return [value, resettingSetter];
}
