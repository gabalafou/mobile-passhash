import React, { PureComponent } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Platform,
} from 'react-native';
// TODO: replace RectButton so the dependency can be removed
import { RectButton } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';

const rightTrayWidth = 64;

type Props = {
  index: number;
  onDelete: () => void;
  onTouchStart: (self: DeletableRow) => void;
  onResponderGrant?: () => void;
  onResponderRelease?: () => void;
  onSwipeableOpen: (self: DeletableRow) => void;
  onPress: () => void;
};
export default class DeletableRow extends PureComponent<Props> {
  // This is similar to the CSS `right` property when using absolute
  // positioning. It keeps track how far from the right the row has moved after
  // a pan gesture. Basically it goes from 0 to -rightTrayWidth.
  right = new Animated.Value(0);
  // This property ONLY keeps track of how far the user has dragged their during
  // a touch and resets to zero at the end of the gesture.
  pan = new Animated.Value(0);
  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return (
        // Add a little dx threshold
        Math.abs(gestureState.dx) > 2 &&
        // More horizontal than vertical, the velocity of the gesture
        Math.abs(gestureState.vx) > Math.abs(gestureState.vy)
      );
    },
    onPanResponderGrant: () => {
      if (this.props.onResponderGrant) {
        // Once panning/swiping on row has begun, disable list scroll
        this.props.onResponderGrant();
      }
    },
    onPanResponderMove: Animated.event([null, { dx: this.pan }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, { dx, vx }) => {
      if (Math.abs(dx) <= rightTrayWidth / 2 && Math.abs(vx) > 0.1) {
        this.handleHorizontalFlick({ dx, vx });
      } else {
        this.handleRelease({ dx });
      }

      if (this.props.onResponderRelease) {
        // Once panning/swiping has stopped, enable list scroll
        this.props.onResponderRelease();
      }
    },
  });

  // A flick is a small but fast gesture in a particular direction
  handleHorizontalFlick({ dx, vx }) {
    const sharedAnimationConfig = {
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    };
    const duration = (rightTrayWidth - Math.abs(dx)) / Math.abs(vx);
    const shouldOpen = vx < 0;

    const panReset = Animated.timing(this.pan, {
      ...sharedAnimationConfig,
      toValue: 0,
      duration,
    });
    const rightCompensate = Animated.timing(this.right, {
      ...sharedAnimationConfig,
      toValue: shouldOpen ? -rightTrayWidth : 0,
      duration,
    });

    Animated.parallel([rightCompensate, panReset]).start();

    if (shouldOpen && this.props.onSwipeableOpen) {
      this.props.onSwipeableOpen(this);
    }
  }

  // If the user does not flick the row, then it will either spring forward or
  // spring back. It will spring all the way open or shut if the user has swiped
  // the row mostly open or mostly shut; otherwise, it will spring back to where
  // it was when the user started the panning gesture.
  handleRelease({ dx }) {
    const threshold = rightTrayWidth / 2.1;
    const shouldOpen = dx < -threshold;
    const shouldClose = dx > threshold;
    const toValueRight = shouldOpen ? -rightTrayWidth : shouldClose ? 0 : null;
    this.springRelease({ toValueRight });

    if (shouldOpen && this.props.onSwipeableOpen) {
      this.props.onSwipeableOpen(this);
    }
  }

  springRelease({ toValueRight = null }) {
    const sharedAnimationConfig = {
      useNativeDriver: true,
      overshootClamping: true,
    };
    const panReset = Animated.spring(this.pan, {
      ...sharedAnimationConfig,
      toValue: 0,
    });
    if (toValueRight !== null) {
      const rightCompensate = Animated.spring(this.right, {
        ...sharedAnimationConfig,
        toValue: toValueRight,
      });
      Animated.parallel([rightCompensate, panReset]).start();
    } else {
      panReset.start();
    }
  }

  handleDeleteButtonPress = () => {
    this.props.onDelete();
  };

  closeRow() {
    this.springRelease({ toValueRight: 0 });
  }

  render() {
    const { children } = this.props;
    // `this.right` serves as an offset for `this.pan`. The interpolate() call
    // limits the panning in one direction to the width of the right tray.
    const trans = Animated.add(this.right, this.pan).interpolate({
      inputRange: [
        -(rightTrayWidth + 1),
        -rightTrayWidth,
        -10,
        -1,
        -0.001,
        0,
        1,
      ],
      outputRange: [-rightTrayWidth, -rightTrayWidth, -10, -1, -0.001, 0, 0],
      // This keeps the bounds tightly within [-rightTrayWidth, 0]
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={{
          transform: [
            {
              translateX: trans,
            },
          ],
        }}
        onTouchStart={() => {
          this.props.onTouchStart(this);
        }}
      >
        {children}
        <View style={styles.rightTray}>
          <RectButton
            style={styles.deleteAction}
            onPress={this.handleDeleteButtonPress}
          >
            {Platform.OS === 'ios' ? (
              <Text style={styles.actionText}>Delete</Text>
            ) : (
              <Icon
                name="delete-forever"
                size={30}
                color="#fff"
                style={[styles.actionIcon]}
              />
            )}
          </RectButton>
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 10,
  },
  deleteAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#dd2c00',
  },
  rightTray: {
    position: 'absolute',
    width: rightTrayWidth,
    right: -rightTrayWidth,
    top: 0,
    bottom: 0,
  },
  actionIcon: {
    width: 30,
    marginHorizontal: 10,
  },
});
