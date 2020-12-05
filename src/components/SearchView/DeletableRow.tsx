import React, { Component } from 'react';
import { Animated, StyleSheet, Text, View, I18nManager, Platform } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import Icon from 'react-native-vector-icons/MaterialIcons';


type Props = {
  onDelete: () => void,
  onSwipeableOpen: (ref: React.RefObject<Swipeable>) => void,
};
export default class DeleteableRow extends Component<Props> {
  _swipeableRow: React.RefObject<Swipeable> = React.createRef();

  renderRightAction = progress => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [64, 0],
    });
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <RectButton
          style={styles.deleteAction}
          onPress={this.handlePress}>
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
      </Animated.View>
    );
  };
  renderRightActions = progress => (
    <View
      style={{
        width: 64,
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      }}>
      {this.renderRightAction(progress)}
    </View>
  );
  handlePress = () => {
    this.props.onDelete();
    this._swipeableRow.current?.render();
  };
  render() {
    const { children, onSwipeableOpen } = this.props;
    return (
      <Swipeable
        ref={this._swipeableRow}
        friction={2}
        rightThreshold={40}
        renderRightActions={this.renderRightActions}
        enableTrackpadTwoFingerGesture={true}
        onSwipeableOpen={() => onSwipeableOpen(this._swipeableRow)}>
        {children}
      </Swipeable>
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
  actionIcon: {
    width: 30,
    marginHorizontal: 10
  },
});
