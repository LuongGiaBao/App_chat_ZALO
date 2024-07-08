// import React, { useState, useEffect } from "react";
// import { FlatList, Pressable, StatusBar, StyleSheet, Text, TextInput, View, Button, TouchableOpacity } from "react-native";
// import { collection, addDoc, onSnapshot, query, where } from "firebase/firestore";
// import { db } from "../firebase";
// import { auth } from "../firebase";

// const GroupScreen = ({ navigation }) => {
//   const [groupName, setGroupName] = useState("");
//   const [groups, setGroups] = useState([]);

//   const [textInputRef, setTextInputRef] = useState(null); // Thêm state để lưu reference đến TextInput

//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "groups"), (snapshot) => {
//       const updatedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       // Chỉ hiển thị nhóm mà người dùng hiện tại là người tạo
//       const currentUserUid = auth.currentUser.uid;
//       const filteredGroups = updatedGroups.filter(group => group.creatorId === currentUserUid);
//       setGroups(filteredGroups);
//     });

//     return () => unsubscribe();
//   }, []);

//   // const handleCreateNewGroup = async () => {
//   //   try {
//   //     const currentUser = auth.currentUser;
//   //     if (currentUser) {
//   //       const currentUserUid = currentUser.uid;
//   //       const docRef = await addDoc(collection(db, "groups"), {
//   //         name: groupName,
//   //         creatorId: currentUserUid,
//   //         members: [currentUserUid] // Thêm userUID vào mảng members
//   //       });
//   //       setGroupName("");
//   //       // Đảm bảo TextInputRef đã được thiết lập trước khi sử dụng
//   //       if (textInputRef) {
//   //         textInputRef.blur();
//   //       }
//   //     } else {
//   //       console.error("No user is currently logged in.");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error adding document: ", error);
//   //   }
//   // };

//   const handleCreateNewGroup = async () => {
//     try {
//       const currentUser = auth.currentUser;
//       if (currentUser) {
//         const currentUserUid = currentUser.uid;
//         const members = [currentUserUid]; // Khởi tạo mảng thành viên với userUID của người tạo nhóm
//         // Thêm userUID của các thành viên vào mảng members
//         // Ví dụ: Thêm userUID của các thành viên đã được chọn từ một danh sách
//         // members.push(userUID1, userUID2, userUID3, ...);

//         const docRef = await addDoc(collection(db, "groups"), {
//           name: groupName,
//           creatorId: currentUserUid,
//           members: members // Sử dụng mảng members đã được cập nhật
//         });
//         setGroupName("");
//         // Đảm bảo TextInputRef đã được thiết lập trước khi sử dụng
//         if (textInputRef) {
//           textInputRef.blur();
//         }
//       } else {
//         console.error("No user is currently logged in.");
//       }
//     } catch (error) {
//       console.error("Error adding document: ", error);
//     }
//   };
//   const handleGroupPress = (groupId) => {
//     navigation.navigate("GroupChatScreen", { groupId });
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.groupSection}>
//         <Text style={styles.title}>Tạo nhóm chat mới</Text>
//         <TextInput
//           ref={(ref) => {
//             setTextInputRef(ref); // Sử dụng setTextInputRef để cập nhật giá trị của textInputRef
//           }}
//           style={styles.input}
//           placeholder="Nhập tên nhóm"
//           value={groupName}
//           onChangeText={setGroupName}
//         />
//         <TouchableOpacity
//           style={styles.button}
//           onPress={handleCreateNewGroup}
//         >
//           <Text style={styles.buttonText}>Tạo nhóm</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={groups}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <Pressable
//             style={styles.groupItem}
//             onPress={() => handleGroupPress(item.id)}
//           >
//             <Text style={styles.groupName}>{item.name}</Text>
//           </Pressable>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   input: {
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//   },
//   button: {
//     width: '100%',
//     backgroundColor: '#007bff',
//     borderRadius: 10,
//     paddingVertical: 15,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   groupItem: {
//     backgroundColor: '#f0f0f0',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 10,
//   },
//   // Đổi tên thành groupItemButton
//   groupItemButton: {
//     backgroundColor: '#007bff',
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     marginBottom: 20,
//     elevation: 2,
//     shadowColor: '#000000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     fontWeight: 'bold',
//   },
//   groupName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   groupSection: {
//     marginBottom: 20,
//   },
// });

// export default GroupScreen;

import React, { useState, useEffect } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import {
  collection,
  addDoc,
  onSnapshot,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

const GroupScreen = ({ navigation, userID }) => {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);

  const [textInputRef, setTextInputRef] = useState(null);

  useEffect(() => {
    const currentUserUid = auth.currentUser.uid;
    const q = query(
      collection(db, "groups"),
      where("members", "array-contains", currentUserUid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedGroups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(updatedGroups);
    });

    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   const fetchGroups = async () => {
  //     try {
  //       const q = query(
  //         collection(db, "groups"),
  //         where(`members.${userID}`, "==", true)
  //       );
  //       const querySnapshot = await getDocs(q);
  //       const groupList = querySnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));
  //       setGroups(groupList);
  //     } catch (error) {
  //       console.error("Error fetching groups:", error);
  //     }
  //   };

  //   fetchGroups();
  // }, [userID]);

  // const renderGroupItem = ({ item }) => (
  //   <TouchableOpacity
  //     style={styles.item}
  //     onPress={() => navigateToGroupChat(item.id)}
  //   >
  //     <Text style={styles.title}>{item.name}</Text>
  //   </TouchableOpacity>
  // );
  const handleCreateNewGroup = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const currentUserUid = currentUser.uid;
        const members = [currentUserUid];
        const docRef = await addDoc(collection(db, "groups"), {
          name: groupName,
          creatorId: currentUserUid,
          members: members,
        });
        setGroupName("");
        if (textInputRef) {
          textInputRef.blur();
        }
      } else {
        console.error("No user is currently logged in.");
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleGroupPress = (groupId) => {
    navigation.navigate("GroupChatScreen", { groupId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.groupSection}>
        <Text style={styles.title}>Tạo nhóm chat mới</Text>
        <TextInput
          ref={(ref) => {
            setTextInputRef(ref);
          }}
          style={styles.input}
          placeholder="Nhập tên nhóm"
          value={groupName}
          onChangeText={setGroupName}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateNewGroup}>
          <Text style={styles.buttonText}>Tạo nhóm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.groupItem}
            onPress={() => handleGroupPress(item.id)}
          >
            <Text style={styles.groupName}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  groupItem: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  groupSection: {
    marginBottom: 20,
  },
});

export default GroupScreen;
