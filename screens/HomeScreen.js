import {
  Button,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import ListItem from "../component/ListItem";
import Users from "../tabs/Users";
import Setting from "../tabs/Setting";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

const HomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedTab, setSelectedtab] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State để theo dõi trạng thái đăng nhập
  const navigation = useNavigation();

  // const getUsers = async () => {
  //   const docsRef = collection(db, "users");
  //   const q = query(docsRef, where("userUID", "!=", auth?.currentUser?.email));
  //   const docSnap = onSnapshot(q, (onSnap) => {
  //     let data = [];
  //     onSnap.docs.forEach((user) => {
  //       data.push({ ...user.data() });
  //       setUsers(data);
  //       console.log(user.data());
  //     });
  //   });
  // };

  // useEffect(() => {
  //   getUsers();
  // }, []);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const usersCollection = await getDocs(collection(db, "users"));
  //       const usersList = usersCollection.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));
  //       setUsers(usersList);
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //     }
  //   };

  //   fetchUsers();
  // }, []);
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const usersCollection = await getDocs(collection(db, "users"));
  //       const usersList = usersCollection.docs
  //         .map((doc) => ({
  //           id: doc.id,
  //           ...doc.data(),
  //         }))
  //         .filter((user) => user.userUID !== auth?.currentUser?.email); // Lọc ra các người dùng có userUID khác với user hiện đang đăng nhập
  //       setUsers(usersList);
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

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

    if (!isLoggedIn) {
      // Chỉ fetch danh sách bạn bè nếu người dùng chưa đăng nhập
      fetchUsers();
    }
  }, [isLoggedIn]); // Đảm bảo fetchUsers chỉ gọi một lần khi isLoggedIn thay đổi

  const openChat = (recipientID) => {
    navigation.navigate("ChatScreen", { recipientID }); // Navigate to ChatScreen with recipientID
  };

  const renderItem = ({ item }) =>
    // Kiểm tra nếu người dùng hiện đang đăng nhập không nằm trong danh sách
    // hoặc nếu người dùng đang đăng nhập là chính họ, thì hiển thị mục danh sách
    !isLoggedIn || item.userUID !== auth?.currentUser?.email ? (
      <TouchableOpacity style={styles.item} onPress={() => openChat(item.id)}>
        <Text style={styles.title}>{item.name}</Text>
      </TouchableOpacity>
    ) : null; // Nếu không, ẩn mục danh sách
  return (
    <View style={styles.container}>
      {selectedTab == 0 ? <Users /> : <Setting />}
      {/* <Button title="Create new Group" /> */}
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => {
            navigation.navigate("ProfileScreen"); // Điều hướng tới màn hình "ProfileScreen"
          }}
        >
          <View>
            <Ionicons name="person-sharp" size={30} color="black" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("GroupScreen"); // Điều hướng tới màn hình "Groupscreen"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FontAwesome name="group" size={24} color="black" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => {
            navigation.navigate("FriendScreen"); // Điều hướng tới màn hình "Groupscreen"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FontAwesome5 name="user-friends" size={24} color="black" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  bottomTab: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 70,
    backgroundColor: "purple",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  tab: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabIcon: {
    width: 30,
    height: 30,
  },
});

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
// } from "react-native";
// import { getDocs, collection, onSnapshot, doc } from "firebase/firestore";
// import { db, auth } from "../firebase";
// import { FontAwesome5 } from "@expo/vector-icons";

// const HomeScreen = ({ navigation }) => {
//   const [userList, setUserList] = useState([]);
//   const [isLoggedIn, setIsLoggedIn] = useState(true); // State để theo dõi trạng thái đăng nhập
//   const [isFriendListLoaded, setIsFriendListLoaded] = useState(true); // State để theo dõi trạng thái của danh sách bạn bè

//   useEffect(() => {
//     const fetchFriends = async () => {
//       try {
//         const currentUser = auth.currentUser;
//         if (!currentUser) {
//           console.error("No user is currently logged in.");
//           return;
//         }

//         const userDocRef = collection(db, "users").doc(currentUser.uid);
//         const unsubscribe = onSnapshot(userDocRef, (doc) => {
//           const userData = doc.data();
//           const userFriends = userData.friends || [];

//           const friendsPromises = userFriends.map(async (friendId) => {
//             const friendDocRef = collection(db, "users").doc(friendId);
//             const friendDoc = await getDocs(friendDocRef);
//             return { id: friendDoc.id, ...friendDoc.data() };
//           });

//           Promise.all(friendsPromises).then((friendsList) => {
//             setUserList(friendsList);
//             setIsFriendListLoaded(true); // Đánh dấu rằng danh sách bạn bè đã được tải
//           });
//         });

//         return () => unsubscribe();
//       } catch (error) {
//         console.error("Error fetching friend list: ", error);
//       }
//     };

//     if (isLoggedIn) {
//       fetchFriends();
//     }
//   }, [isLoggedIn]);

//   return (
//     <View style={styles.container}>
//       {isFriendListLoaded ? (
//         <FlatList
//           data={userList}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               style={styles.item}
//               onPress={() => {
//                 // Do something when clicking on a friend in the list
//               }}
//             >
//               <Text style={styles.title}>{item.name}</Text>
//             </TouchableOpacity>
//           )}
//           keyExtractor={(item) => item.id}
//         />
//       ) : (
//         <Text>Loading...</Text>
//       )}
//       {/* Your bottom tab navigation */}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   item: {
//     padding: 15,
//     backgroundColor: "#f9f9f9",
//     borderBottomWidth: 1,
//     borderBottomColor: "#ccc",
//   },
//   title: {
//     fontSize: 18,
//   },
// });

// export default HomeScreen;
