import React, { useMemo, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
    width: '100%',
  },
});

export default function SlidingBottomOverlay({
  children: nextChildren,
  onLayoutWithChildren,
}) {
  const [height, setHeight] = useState(0);
  const [children, setChildren] = useState(null);
  const slideAnim = useMemo(() => new Animated.Value(height), []);

  if (height && !children && nextChildren) {
    // On loading, we animate up
    setChildren(nextChildren);
    Animated.timing(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 300,
    }).start();
  } else if (height && children && !nextChildren) {
    // On unloading, we animate down
    Animated.timing(slideAnim, {
      toValue: height,
      useNativeDriver: true,
      duration: 300,
    }).start(({ finished }) => {
      if (finished) {
        setChildren(null);
      }
    });
  } else if (nextChildren !== children) {
    // Otherwise we load new children without animation
    setChildren(nextChildren);
  }

  return (
    <Animated.View
      style={[
        styles.bottomOverlay,
        {
          transform: [
            {
              translateY: slideAnim,
            },
          ],
        },
      ]}
      onLayout={(event) => {
        if (children) {
          if (!height) {
            setHeight(event.nativeEvent.layout.height);
          }
          onLayoutWithChildren(event);
        }
      }}
    >
      {children}
    </Animated.View>
  );
}
