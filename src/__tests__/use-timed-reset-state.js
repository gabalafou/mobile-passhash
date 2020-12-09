import React from 'react';
import { act, create } from 'react-test-renderer';
import useTimedResetState from '../use-timed-reset-state';


jest.useFakeTimers();

describe('useTimedResetState custom React hook', () => {
  const renderSpy = jest.fn(() => null);
  let setState;

  function TimedReset({ initialState, wait }) {
    const [state, _setState] = useTimedResetState(initialState, wait);
    setState = _setState;
    return renderSpy(state);
  }

  beforeEach(() => {
    renderSpy.mockClear();
  });

  it('resets state to initial value after some time', () => {
    act(() => {
      create(<TimedReset initialState="Ommmmmmmmmmm" wait={1000} />);
    });
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenLastCalledWith('Ommmmmmmmmmm');

    act(() => {
      setState('jump around, jump around, jump up, jump up, and get down!');
    });
    expect(renderSpy).toHaveBeenCalledTimes(2);
    expect(renderSpy).toHaveBeenLastCalledWith('jump around, jump around, jump up, jump up, and get down!');

    jest.advanceTimersByTime(999);
    expect(renderSpy).toHaveBeenCalledTimes(2);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(renderSpy).toHaveBeenCalledTimes(3);
    expect(renderSpy).toHaveBeenLastCalledWith('Ommmmmmmmmmm');
  });

  it('only sets one timeout at a time', () => {
    const initialState = 'this is sort of like the off value of a timed auto-off sensor';
    act(() => {
      create(<TimedReset initialState={initialState} wait={1000} />);
    });
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenNthCalledWith(1, initialState);

    // show that if we advance enough time from the last set() to the next,
    // the component will be reset twice to its initial value

    act(() => {
      setState('A');
      jest.advanceTimersByTime(1000);
      setState('B');
      jest.advanceTimersByTime(1000);
    });
    expect(renderSpy).toHaveBeenCalledTimes(5);
    expect(renderSpy).toHaveBeenNthCalledWith(2, 'A');
    expect(renderSpy).toHaveBeenNthCalledWith(3, initialState);
    expect(renderSpy).toHaveBeenNthCalledWith(4, 'B');
    expect(renderSpy).toHaveBeenNthCalledWith(5, initialState);

    // now show that if time does not advance enough, then only one
    // reset will be made

    act(() => {
      // This setState call should set a timer (we'll call it Timeout C)
      setState('C');
      jest.advanceTimersByTime(999);
      // The next setState call should
      // 1. clear the previous timer (Timeout C)
      // 2. set a new one (we'll call it Timeout D)
      setState('D');
      jest.advanceTimersByTime(1000);
    });
    expect(renderSpy).toHaveBeenCalledTimes(8);
    expect(renderSpy).toHaveBeenNthCalledWith(6, 'C');
    expect(renderSpy).toHaveBeenNthCalledWith(7, 'D');
    expect(renderSpy).toHaveBeenNthCalledWith(8, initialState);

    // now finally show that if clearTimeout is mocked out,
    // two timers will get simultaneously set, causing the
    // component to render the initial state twice

    clearTimeout.mockImplementation(() => {});
    act(() => {
      setState('E');
      jest.advanceTimersByTime(999);
      setState('F');
      jest.advanceTimersByTime(1100);
    });
    expect(renderSpy).toHaveBeenCalledTimes(12);
    expect(renderSpy).toHaveBeenNthCalledWith(9, 'E');
    expect(renderSpy).toHaveBeenNthCalledWith(10, 'F');
    expect(renderSpy).toHaveBeenNthCalledWith(11, initialState);
    expect(renderSpy).toHaveBeenNthCalledWith(12, initialState);
  });
});
