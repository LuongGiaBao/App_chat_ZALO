import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();

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
    navigation.navigate("Chat", { recipientID });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => openChat(item.id)}>
      <Text style={styles.title}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 18,
  },
});
