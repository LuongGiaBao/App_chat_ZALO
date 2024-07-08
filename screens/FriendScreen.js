import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import {
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "firebase/app";
import "firebase/auth";

const FriendScreen = ({ navigation }) => {
  const [userList, setUserList] = useState([]);
  const route = useRoute();

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("No user is currently logged in.");
          return;
        }

        const userDoc = doc(db, "users", currentUser.uid);
        const userDocSnapshot = await getDoc(userDoc);
        const userData = userDocSnapshot.data();
        const userFriends = userData.friends || [];

        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);
        const allUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isSelected: false,
          friendRequestSent: false,
          isFriend: userFriends.includes(doc.id),
        }));

        const currentUserUid = auth.currentUser.uid;
        const usersNotInFriendList = allUsers.filter(
          (user) => user.id !== currentUserUid
        );

        setUserList(usersNotInFriendList);
      } catch (error) {
        console.error("Error getting user list: ", error);
      }
    };

    fetchUserList();
  }, []);

  // const handleToggleFriend = async (userId, userName, isFriend) => {
  //     try {
  //         const currentUser = auth.currentUser;
  //         if (!currentUser) {
  //             return;
  //         }

  //         const currentUserDocRef = doc(db, 'users', currentUser.uid);
  //         const userDocRef = doc(db, 'users', userId);

  //         if (isFriend) {
  //             Alert.alert(
  //                 'Xác nhận',
  //                 `Bạn có chắc là muốn hủy kết bạn với ${userName} không?`,
  //                 [
  //                     {
  //                         text: 'Hủy',
  //                         style: 'cancel',
  //                     },
  //                     {
  //                         text: 'Đồng ý',
  //                         onPress: async () => {
  //                             await updateDoc(currentUserDocRef, { friends: arrayRemove(userId) });
  //                             await updateDoc(userDocRef, { friends: arrayRemove(currentUser.uid) });
  //                             const updatedUsers = userList.map(user => {
  //                                 if (user.id === userId) {
  //                                     return { ...user, isFriend: false };
  //                                 }
  //                                 return user;
  //                             });
  //                             setUserList(updatedUsers);
  //                             Alert.alert('Đã hủy kết bạn', `Bạn đã hủy kết bạn với ${userName}.`);
  //                         },
  //                     },
  //                 ]
  //             );
  //         } else {
  //             await updateDoc(currentUserDocRef, { friends: arrayUnion(userId) });
  //             await updateDoc(userDocRef, { friends: arrayUnion(currentUser.uid) });
  //             const updatedUsers = userList.map(user => {
  //                 if (user.id === userId) {
  //                     return { ...user, isFriend: true };
  //                 }
  //                 return user;
  //             });
  //             setUserList(updatedUsers);
  //             Alert.alert('Thành công', `Bạn đã kết bạn với ${userName}.`);
  //         }
  //     } catch (error) {
  //         console.error('Lỗi khi thêm hoặc hủy bạn bè: ', error);
  //     }
  // };

  const handleToggleFriend = async (userId, userName, isFriend) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return;
      }

      const currentUserDocRef = doc(db, "users", currentUser.uid);
      const userDocRef = doc(db, "users", userId);

      if (isFriend) {
        Alert.alert(
          "Xác nhận",
          `Bạn có chắc là muốn hủy kết bạn với ${userName} không?`,
          [
            {
              text: "Hủy",
              style: "cancel",
            },
            {
              text: "Đồng ý",
              onPress: async () => {
                await updateDoc(currentUserDocRef, {
                  friends: arrayRemove(userId),
                });
                await updateDoc(userDocRef, {
                  friends: arrayRemove(currentUser.uid),
                });
                const updatedUsers = userList.map((user) => {
                  if (user.id === userId) {
                    return { ...user, isFriend: false };
                  }
                  return user;
                });
                setUserList(updatedUsers);
                Alert.alert(
                  "Đã hủy kết bạn",
                  `Bạn đã hủy kết bạn với ${userName}.`
                );
              },
            },
          ]
        );
      } else {
        await updateDoc(userDocRef, {
          friendRequests: arrayUnion(currentUser.uid),
        });
        const updatedUsers = userList.map((user) => {
          if (user.id === userId) {
            return { ...user, friendRequestSent: true };
          }
          return user;
        });
        setUserList(updatedUsers);
        Alert.alert("Thành công", `Đã gửi lời mời kết bạn đến ${userName}.`);
      }
    } catch (error) {
      console.error("Lỗi khi thêm hoặc hủy bạn bè: ", error);
    }
  };

  // const renderItem = ({ item }) => (
  //     <View style={styles.userItem}>
  //         <Image source={{ uri: item.photoURL }} style={styles.avatar} />
  //         <View style={styles.userInfo}>
  //             <Text style={styles.userName}>{item.name}</Text>
  //         </View>
  //         <TouchableOpacity
  //             onPress={() => handleToggleFriend(item.id, item.name, item.isFriend)}
  //             style={[styles.addButton, { backgroundColor: item.isFriend ? '#4caf50' : '#007bff' }]}
  //         >
  //             <Text style={styles.addButtonText}>{item.isFriend ? 'Bạn bè' : 'Kết bạn'}</Text>
  //         </TouchableOpacity>
  //     </View>
  // );
  const renderItem = ({ item }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleToggleFriend(item.id, item.name, item.isFriend)}
        style={[
          styles.addButton,
          {
            backgroundColor: item.isFriend
              ? "#4caf50"
              : item.friendRequestSent
              ? "#cccccc"
              : "#007bff",
          },
        ]}
        disabled={item.friendRequestSent}
      >
        <Text style={styles.addButtonText}>
          {item.isFriend
            ? "Bạn bè"
            : item.friendRequestSent
            ? "Đã gửi"
            : "Kết bạn"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => {
            navigation.navigate("AcceptFriendScreen", { userList });
          }}
        >
          <Ionicons name="people-outline" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={userList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // container: {
  //     flex: 1,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  // },
  // userItem: {
  //     flexDirection: 'row',
  //     alignItems: 'center',
  //     padding: 10,
  // },
  // avatar: {
  //     width: 50,
  //     height: 50,
  //     borderRadius: 25,
  //     marginRight: 50,
  // },
  // userName: {
  //     fontSize: 16,
  //     fontWeight: 'bold',
  //     flex: 1,
  //     marginTop: 12,
  // },
  // addButton: {
  //     padding: 8,
  //     borderRadius: 5,
  //     alignSelf: 'flex-end',
  //     marginLeft: 50,
  //     marginTop: 15,
  // },
  // addButtonText: {
  //     color: '#fff',
  //     fontWeight: 'bold',
  // },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-end",
    marginLeft: 20,
    backgroundColor: "#007bff",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default FriendScreen;
