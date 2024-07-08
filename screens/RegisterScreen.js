import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Input, Button } from "react-native-elements";
import { db, auth, storage } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { doc, setDoc } from "firebase/firestore";
import "firebase/storage"; // Import Firebase Storage
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarURI, setAvatarURI] = useState("");
  const navigation = useNavigation();

  // useEffect(() => {
  //   (async () => {
  //     if (Platform.OS !== "web") {
  //       const { status } =
  //         await ImagePicker.requestMediaLibraryPermissionsAsync();
  //       if (status !== "granted") {
  //         alert("Sorry, we need camera roll permissions to make this work!");
  //       }
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    console.log("Avatar URI changed:", avatarURI);
  }, [avatarURI]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setAvatarURI(result.assets[0].uri);
      } else {
        console.log("Image picking cancelled");
      }
    } catch (error) {
      console.error("Error picking image: ", error);
    }
  };

  const uploadImageToFirebase = async (imageURI, userUID) => {
    try {
      const response = await fetch(imageURI);
      const blob = await response.blob();

      const storageRef = ref(storage, `avatars/${userUID}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      console.log("Image download URL:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error("Image upload failed: " + error.message);
    }
  };

  const registerUser = async () => {
    try {
      console.log("Starting user registration:", email);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userUID = userCredential.user.uid;
      console.log("User created with UID:", userUID);

      let photoURL =
        "https://gravatar.com/avatar/94d45dbdba988afacf30d916e7aaad69?s=200&d=mp&r=x";
      if (avatarURI) {
        try {
          console.log("Uploading user avatar:", avatarURI);
          const downloadURL = await uploadImageToFirebase(avatarURI, userUID);
          photoURL = downloadURL;
        } catch (uploadError) {
          Alert.alert("Failed to upload image: " + uploadError.message);
          return; // Dừng lại nếu tải lên ảnh thất bại
        }
      }

      console.log(
        "Saving user document to Firestore with photo URL:",
        photoURL
      );
      const docRef = doc(db, "users", userUID);
      await setDoc(docRef, {
        photoURL: photoURL,
        name: name,
        email: email,
        userUID: userUID,
      });

      console.log("User registration successful, navigating to Home");
      navigation.navigate("Home"); // Điều hướng sau khi đăng ký thành công
    } catch (error) {
      console.error("Registration failed:", error);
      Alert.alert("Registration failed: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Enter your name"
        label="Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <Input
        placeholder="Enter your email"
        label="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <Input
        placeholder="Enter your password"
        label="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>Chọn ảnh đại diện</Text>
      </TouchableOpacity>
      {avatarURI ? (
        <View>
          <Image source={{ uri: avatarURI }} style={styles.avatar} />
          <Text>Image selected</Text>
        </View>
      ) : (
        <Text>No image selected</Text>
      )}

      <Button title="register" onPress={registerUser} style={styles.button} />
      <Text onPress={() => navigation.navigate("Login")}>Have an Account</Text>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    marginTop: 100,
  },
  button: {
    width: 370,
    marginTop: 10,
  },
  imagePicker: {
    width: 200,
    height: 50,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerText: {
    color: "#000",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
});
