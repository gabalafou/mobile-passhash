import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import ImportScreen from './ImportScreen';
import ExportScreen from './ExportScreen';

const RootStack = createStackNavigator();
const MainStack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootStack.Navigator mode="modal" headerMode="none">
          <RootStack.Screen name="Main" component={MainStackScreen} />
          <RootStack.Screen name="Search" component={SearchScreen} />
          <RootStack.Screen name="Import" component={ImportScreen} />
          <RootStack.Screen name="Export" component={ExportScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

function MainStackScreen() {
  return (
    <MainStack.Navigator headerMode="none">
      <MainStack.Screen name="Home" component={HomeScreen} />
    </MainStack.Navigator>
  );
}
