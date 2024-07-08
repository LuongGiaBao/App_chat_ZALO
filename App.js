import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Welcome from "./screens/Welcome";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ChatScreen from "./screens/chatScreen";
import GroupScreen from "./screens/GroupScreen";
import GroupChatScreen from "./screens/GroupChatScreen";
import FriendScreen from "./screens/FriendScreen";
import AcceptFriendScreen from "./screens/AcceptFriendScreen";
import ProfileScreen from "./screens/ProfileScreen";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
export default function App() {
  const [user, setuser] = useState(null);
  return (
    <NavigationContainer>
      {/* <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="User" component={Users} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="ChatApp" component={ChatApp} />
      </Stack.Navigator> */}
      <Stack.Navigator screenOptions={"Login"}>
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
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen name="ChatScreen" component={ChatScreen} />

        <Stack.Screen name="GroupScreen" component={GroupScreen} />

        <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} />

        <Stack.Screen name="FriendScreen" component={FriendScreen} />

        <Stack.Screen
          name="AcceptFriendScreen"
          component={AcceptFriendScreen}
        />

        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
