import {
  Button,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Avatar } from "react-native-elements";
import { AntDesign } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

const Users = () => {
  const [users, setUsers] = useState([]);
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  const signOutNow = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 20 }} onPress={signOutNow}>
          <AntDesign name="logout" size={24} color="purple" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = await getDocs(collection(db, "users"));
        const usersList = usersCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const openChat = (recipientID) => {
    navigation.navigate("ChatScreen", { recipientID });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => openChat(item.id)}>
      <Image source={{ uri: item.photoURL }} style={styles.userIcon} />
      <View style={styles.itemAll}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemEmail}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Xin chào, {auth?.currentUser?.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={signOutNow}>
          <AntDesign name="logout" size={24} color="purple" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </ScrollView>
    </View>
  );
};

export default Users;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    width: "100%",
    height: 60,
    backgroundColor: "white",
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    color: "purple",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 30,
  },
  logoutButton: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  userItem: {
    width: Dimensions.get("window").width - 20,
    alignSelf: "center",
    marginTop: 10,
    flexDirection: "row",
    height: 80,
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  itemName: {
    color: "black",
    fontSize: 18,
    marginLeft: 10,
  },
  itemEmail: {
    color: "gray",
    fontSize: 14,
    marginLeft: 10,
  },
  itemAll: {
    marginLeft: 10,
  },
});
