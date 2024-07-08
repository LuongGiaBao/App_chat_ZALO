// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Image,
//   Alert,
// } from "react-native";
// import {
//   collection,
//   getDocs,
//   updateDoc,
//   arrayUnion,
//   arrayRemove,
//   doc,
//   getDoc,
// } from "firebase/firestore";
// import { db, auth } from "../firebase"; // Đảm bảo đã import biến 'auth' từ firebase
// import { useNavigation } from "@react-navigation/native";
// import { Ionicons } from "@expo/vector-icons";
// import firebase from "firebase/app";
// import "firebase/auth";

// const AcceptFriendScreen = ({ route, navigation }) => {
//   const { userList } = route.params;
//   const [friendRequests, setFriendRequests] = useState([]);

//   useEffect(() => {
//     const fetchFriendRequests = async () => {
//       try {
//         const currentUser = auth.currentUser;
//         if (!currentUser) {
//           console.error("No user is currently logged in.");
//           return;
//         }

//         // Lấy danh sách lời mời kết bạn của người dùng hiện tại
//         const userDoc = doc(db, "users", currentUser.uid);
//         const userDocSnapshot = await getDoc(userDoc);
//         const userData = userDocSnapshot.data();
//         const userFriendRequests = userData.friendRequests || [];
//         const friendRequestsDetails = [];

//         // Lặp qua danh sách lời mời kết bạn và lấy thông tin của từng người gửi
//         for (const requestId of userFriendRequests) {
//           const userDocRef = doc(db, "users", requestId);
//           const userDocSnapshot = await getDoc(userDocRef);
//           const userData = userDocSnapshot.data();
//           friendRequestsDetails.push({ id: requestId, ...userData });
//         }

//         setFriendRequests(friendRequestsDetails);
//       } catch (error) {
//         console.error("Error getting friend requests: ", error);
//       }
//     };

//     fetchFriendRequests();
//   }, []);

//   // const handleAcceptFriendRequest = async (userId, userName) => {
//   //     try {
//   //         const currentUser = auth.currentUser;
//   //         if (!currentUser) {
//   //             // Xử lý trường hợp người dùng không đăng nhập
//   //             return;
//   //         }

//   //         // Cập nhật trạng thái isFriend cho cả hai người dùng
//   //         const currentUserDocRef = doc(db, 'users', currentUser.uid);
//   //         await updateDoc(currentUserDocRef, { friends: arrayUnion(userId) });

//   //         const userDocRef = doc(db, 'users', userId);
//   //         await updateDoc(userDocRef, { friends: arrayUnion(currentUser.uid) });

//   //         // Xóa lời mời kết bạn từ người gửi trong danh sách lời mời của người nhận
//   //         await updateDoc(userDocRef, { friendRequests: arrayRemove(currentUser.uid) });

//   //         Alert.alert('Thành công', `Đã chấp nhận lời mời kết bạn từ ${userName}!`);
//   //     } catch (error) {
//   //         console.error('Lỗi khi chấp nhận lời mời kết bạn: ', error);
//   //     }
//   // };
//   // Hàm xử lý chấp nhận lời mời kết bạn
//   const handleAcceptFriendRequest = async (userId, userName) => {
//     try {
//       const currentUser = auth.currentUser;
//       if (!currentUser) {
//         // Xử lý trường hợp người dùng không đăng nhập
//         return;
//       }

//       // Cập nhật trạng thái isFriend cho cả hai người dùng
//       const currentUserDocRef = doc(db, "users", currentUser.uid);
//       await updateDoc(currentUserDocRef, { friends: arrayUnion(userId) });

//       const userDocRef = doc(db, "users", userId);
//       await updateDoc(userDocRef, { friends: arrayUnion(currentUser.uid) });

//       // Xóa lời mời kết bạn từ người gửi trong danh sách lời mời của người nhận
//       await updateDoc(userDocRef, {
//         friendRequests: arrayRemove(currentUser.uid),
//       });

//       // Cập nhật lại danh sách lời mời kết bạn trên màn hình
//       const updatedFriendRequests = friendRequests.filter(
//         (request) => request.id !== userId
//       );
//       setFriendRequests(updatedFriendRequests);

//       Alert.alert("Thành công", `Đã chấp nhận lời mời kết bạn từ ${userName}!`);
//     } catch (error) {
//       console.error("Lỗi khi chấp nhận lời mời kết bạn: ", error);
//     }
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.userItem}>
//       <Image source={{ uri: item.photoURL }} style={styles.avatar} />
//       <View style={styles.userInfo}>
//         <Text style={styles.userName}>{item.name}</Text>
//       </View>
//       <TouchableOpacity
//         onPress={() => handleAcceptFriendRequest(item.userUID, item.name)} // Truyền thông tin tên người gửi
//         style={styles.acceptButton}
//       >
//         <Text style={styles.acceptButtonText}>Chấp nhận</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={friendRequests}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.userUID} // Sử dụng userUID làm key
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   userItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 50,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     flex: 1,
//     marginTop: 12,
//   },
//   acceptButton: {
//     padding: 8,
//     borderRadius: 5,
//     backgroundColor: "#007bff",
//     alignSelf: "flex-end",
//     marginLeft: 50,
//   },
//   acceptButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });

// export default AcceptFriendScreen;

import React, { useState, useEffect } from "react";
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
import { db, auth } from "../firebase"; // Đảm bảo đã import biến 'auth' từ firebase
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "firebase/app";
import "firebase/auth";

const AcceptFriendScreen = ({ route, navigation }) => {
  const { userList } = route.params;
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("No user is currently logged in.");
          return;
        }

        // Lấy danh sách lời mời kết bạn của người dùng hiện tại
        const userDoc = doc(db, "users", currentUser.uid);
        const userDocSnapshot = await getDoc(userDoc);
        const userData = userDocSnapshot.data();
        const userFriendRequests = userData.friendRequests || [];
        const friendRequestsDetails = [];

        // Lặp qua danh sách lời mời kết bạn và lấy thông tin của từng người gửi
        for (const requestId of userFriendRequests) {
          const userDocRef = doc(db, "users", requestId);
          const userDocSnapshot = await getDoc(userDocRef);
          const userData = userDocSnapshot.data();
          friendRequestsDetails.push({ id: requestId, ...userData });
        }

        setFriendRequests(friendRequestsDetails);
      } catch (error) {
        console.error("Error getting friend requests: ", error);
      }
    };

    fetchFriendRequests();
  }, []);

  // Hàm xử lý chấp nhận lời mời kết bạn
  // const handleAcceptFriendRequest = async (userId, userName) => {
  //     try {
  //         const currentUser = auth.currentUser;
  //         if (!currentUser) {
  //             // Xử lý trường hợp người dùng không đăng nhập
  //             return;
  //         }

  //         // Cập nhật trạng thái isFriend cho cả hai người dùng
  //         const currentUserDocRef = doc(db, 'users', currentUser.uid);
  //         await updateDoc(currentUserDocRef, { friends: arrayUnion(userId) });

  //         const userDocRef = doc(db, 'users', userId);
  //         await updateDoc(userDocRef, { friends: arrayUnion(currentUser.uid) });

  //         // Xóa lời mời kết bạn từ người gửi trong danh sách lời mời của người nhận
  //         await updateDoc(userDocRef, { friendRequests: arrayRemove(currentUser.uid) });

  //         Alert.alert('Thành công', `Đã chấp nhận lời mời kết bạn từ ${userName}!`);
  //     } catch (error) {
  //         console.error('Lỗi khi chấp nhận lời mời kết bạn: ', error);
  //     }
  // };
  // Hàm xử lý chấp nhận lời mời kết bạn
  const handleAcceptFriendRequest = async (userId, userName) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // Xử lý trường hợp người dùng không đăng nhập
        return;
      }

      // Cập nhật trạng thái isFriend cho cả hai người dùng
      const currentUserDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(currentUserDocRef, { friends: arrayUnion(userId) });

      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { friends: arrayUnion(currentUser.uid) });

      // Xóa lời mời kết bạn từ người gửi trong danh sách lời mời của người nhận
      await updateDoc(userDocRef, {
        friendRequests: arrayRemove(currentUser.uid),
      });

      // Cập nhật lại danh sách lời mời kết bạn trên màn hình
      const updatedFriendRequests = friendRequests.filter(
        (request) => request.id !== userId
      );
      setFriendRequests(updatedFriendRequests);

      Alert.alert("Thành công", `Đã chấp nhận lời mời kết bạn từ ${userName}!`);
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn: ", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleAcceptFriendRequest(item.userUID, item.name)} // Truyền thông tin tên người gửi
        style={styles.acceptButton}
      >
        <Text style={styles.acceptButtonText}>Chấp nhận</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={friendRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item.userUID} // Sử dụng userUID làm key
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginRight: 50,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginTop: 12,
  },
  acceptButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#007bff",
    alignSelf: "flex-end",
    marginLeft: 50,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AcceptFriendScreen;
