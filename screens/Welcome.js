import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
const Welcome = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Button title="Login" onPress={() => navigation.navigate("Login")} />
      <Button
        title="Register"
        onPress={() => navigation.navigate("Register")}
      />
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    fontSize: 20,
    justifyContent: "center",
    alignItems: "center",
    width: "auto",
    height: 100,
  },
});
