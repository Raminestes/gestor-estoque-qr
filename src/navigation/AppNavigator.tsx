import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AddProductScreen from "../screens/AddProductScreen";
import EditProductScreen from "../screens/EditProductScreen";
import MovementScreen from "../screens/MovementScreen";
import GenerateQRScreen from "../screens/GenerateQRScreen";  
import QRScannerScreen from "../screens/QRScannerScreen";    
import HistoryScreen from "../screens/HistoryScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AddProduct"
          component={AddProductScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="EditProduct"
          component={EditProductScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Movement"
          component={MovementScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="GenerateQR"
          component={GenerateQRScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
