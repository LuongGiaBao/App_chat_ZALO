import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Input, Button } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { firestore, collection } from "@react-native-firebase/firestore";
import { auth, db } from "../firebase";
import { uuid } from "react-native-uuid";
import { doc, setDoc } from "firebase/firestore";
const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");

  //firestore collection user
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.navigate("Home");
      } else {
        console.log("No User");
      }
    });
  }, []);

  const LoginUser = async () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const userUID = userCredential.user.uid;
        const docRef = doc(db, "users", userUID);
      })
      .then(() => {
        navigation.navigate("Home");
      })
      .catch((error) => {
        alert(error.message);
      })

      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  };

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        navigation.navigate("Home");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  };
  const openRegisterScreen = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Enter your email"
        label="Email"
        leftIcon={{ type: "material", name: "email" }}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <Input
        placeholder="Enter your password"
        label="Password"
        leftIcon={{ type: "material", name: "lock" }}
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <View style={styles.button}>
        <Button title="sign in" onPress={LoginUser} />
      </View>
      <View style={styles.button}>
        <Button title="register" onPress={openRegisterScreen} />
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    marginTop: 100,
  },
  button: {
    width: 250,
    marginTop: 20,
  },
});
