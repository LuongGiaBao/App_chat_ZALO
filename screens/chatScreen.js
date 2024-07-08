// import React, {
//   useEffect,
//   useCallback,
//   useState,
//   useLayoutEffect,
// } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Alert,
// } from "react-native";
// import { Avatar } from "react-native-elements";
// import { auth, db, storage } from "../firebase";
// import { signOut } from "firebase/auth";
// import { GiftedChat, Actions, Message } from "react-native-gifted-chat";
// import { AntDesign } from "@expo/vector-icons";
// //import { Camera } from "react-native-camera";

// import { Camera } from "expo-camera";
// import {
//   collection,
//   addDoc,
//   query,
//   orderBy,
//   onSnapshot,
//   where,
//   updateDoc,
//   doc,
//   deleteDoc,
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import * as ImagePicker from "expo-image-picker";
// import { launchCamera } from "expo-image-picker";
// const ChatScreen = ({ navigation, route }) => {
//   const [messages, setMessages] = useState([]);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [cameraRef, setCameraRef] = useState(null);
//   const [hasCameraPermission, setHasCameraPermission] = useState(null);
//   const currentUser = auth.currentUser;
//   const { recipientID } = route.params;

//   // const signOutNow = () => {
//   //   signOut(auth)
//   //     .then(() => {
//   //       navigation.replace("Login");
//   //     })
//   //     .catch((error) => {
//   //       console.error("Sign out error:", error);
//   //     });
//   // };

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerLeft: () => (
//         <View style={{ marginLeft: 30 }}>
//           <Avatar
//             rounded
//             source={{
//               uri: auth?.currentUser?.photoURL,
//             }}
//           />
//         </View>
//       ),
//       // headerRight: () => (
//       //   <TouchableOpacity
//       //     style={{
//       //       marginRight: 10,
//       //     }}
//       //     onPress={signOutNow}
//       //   >
//       //     <Text>Đăng xuất</Text>
//       //   </TouchableOpacity>
//       // ),
//       headerLeft: () => (
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={{ marginLeft: 15 }}
//           >
//             <AntDesign name="arrowleft" size={24} color="black" />
//           </TouchableOpacity>
//         </View>
//       ),
//     });
//   }, [navigation, currentUser]);

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerTitle: "Chat", // Set header title
//     });
//   }, [navigation]);

//   useEffect(() => {
//     (async () => {
//       const { status } = await Camera.requestCameraPermissionsAsync();
//       setHasCameraPermission(status === "granted");
//     })();

//     const unsubscribe = onSnapshot(
//       query(
//         collection(db, "chats"),
//         where("users", "array-contains", currentUser?.uid),
//         orderBy("createdAt", "desc")
//       ),
//       (snapshot) => {
//         const newMessages = snapshot.docs
//           .filter(
//             (doc) =>
//               (doc.data().senderID === currentUser?.uid &&
//                 doc.data().receiverID === recipientID) ||
//               (doc.data().senderID === recipientID &&
//                 doc.data().receiverID === currentUser?.uid)
//           )
//           .map((doc) => ({
//             _id: doc.id,
//             createdAt: doc.data().createdAt.toDate(),
//             text: doc.data().text,
//             image: doc.data().image || null,
//             file: doc.data().file || null,
//             user: doc.data().user,
//           }));
//         setMessages(newMessages);
//       },
//       (error) => {
//         console.error("Error fetching messages:", error);
//       }
//     );

//     return () => unsubscribe();
//   }, [currentUser, recipientID]);

//   const onSend = useCallback(
//     async (messages = []) => {
//       const newMessage = messages[0];
//       const { _id, createdAt, text, user, image, file } = newMessage;

//       if (!recipientID) {
//         console.error("recipientID is undefined");
//         return;
//       }

//       await addDoc(collection(db, "chats"), {
//         _id,
//         createdAt,
//         text,
//         user,
//         image: image || null,
//         file: file || null,
//         users: [currentUser?.uid, recipientID],
//         senderID: currentUser?.uid,
//         receiverID: recipientID,
//       });

//       const senderDocRef = doc(db, "users", currentUser.uid);
//       const receiverDocRef = doc(db, "users", recipientID);

//       await updateDoc(senderDocRef, {
//         lastMessageSent: {
//           text,
//           createdAt,
//         },
//       });

//       await updateDoc(receiverDocRef, {
//         lastMessageReceived: {
//           text,
//           createdAt,
//         },
//       });
//     },
//     [currentUser, recipientID]
//   );

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const source = result.assets[0];
//       const storageRef = ref(storage, `chat_images/${source.fileName}`);
//       const img = await fetch(source.uri);
//       const bytes = await img.blob();
//       await uploadBytes(storageRef, bytes);
//       const imageUrl = await getDownloadURL(storageRef);

//       const message = {
//         _id: Math.random().toString(36).substring(7),
//         createdAt: new Date(),
//         text: "",
//         user: {
//           _id: currentUser?.email,
//           name: currentUser?.displayName,
//           avatar: currentUser?.photoURL,
//         },
//         image: imageUrl,
//       };

//       onSend([message]);
//     }
//   };

//   const takePhoto = async () => {
//     if (cameraRef) {
//       const options = { quality: 0.5, base64: true };
//       const data = await cameraRef.takePictureAsync(options);

//       const storageRef = ref(storage, `chat_images/${Date.now()}.jpg`);
//       const img = await fetch(data.uri);
//       const bytes = await img.blob();
//       await uploadBytes(storageRef, bytes);
//       const imageUrl = await getDownloadURL(storageRef);

//       const message = {
//         _id: Math.random().toString(36).substring(7),
//         createdAt: new Date(),
//         text: "",
//         user: {
//           _id: currentUser?.email,
//           name: currentUser?.displayName,
//           avatar: currentUser?.photoURL,
//         },
//         image: imageUrl,
//       };

//       onSend([message]);
//       setCameraVisible(false);
//     }
//   };

//   const renderActions = (props) => (
//     <Actions
//       {...props}
//       options={{
//         ["Choose Photo"]: pickImage,
//         ["Take Photo"]: () => setCameraVisible(true),
//       }}
//       icon={() => <AntDesign name="plus" size={24} color="black" />}
//       onSend={(args) => console.log(args)}
//     />
//   );
//   if (hasCameraPermission === null) {
//     return <View />;
//   }
//   if (hasCameraPermission === false) {
//     return <Text>No access to camera</Text>;
//   }

//   const recallMessage = (messageId) => {
//     Alert.alert(
//       "Thu hồi tin nhắn",
//       "Bạn có chắc chắn muốn thu hồi tin nhắn này không?",
//       [
//         { text: "Hủy", style: "cancel" },
//         {
//           text: "Đồng ý",
//           onPress: async () => {
//             await deleteMessage(messageId);
//           },
//         },
//       ]
//     );
//   };

//   const deleteMessage = async (messageId) => {
//     const messageRef = doc(db, "chats", messageId);
//     try {
//       await deleteDoc(messageRef);
//       console.log("Tin nhắn đã được thu hồi");
//     } catch (error) {
//       console.error("Error recalling message: ", error);
//     }
//   };

//   const renderMessage = (props) => {
//     const { currentMessage } = props;
//     const currentUser = auth.currentUser;

//     if (currentMessage.user._id === currentUser?.email) {
//       return (
//         <View style={styles.messageContainer}>
//           <Message {...props} />
//           <TouchableOpacity
//             style={styles.recallButton}
//             onPress={() => recallMessage(currentMessage._id)}
//           >
//             <Text style={styles.recallButtonText}>Thu hồi</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     return <Message {...props} />;
//   };

//   return (
//     <View style={styles.container}>
//       <GiftedChat
//         messages={messages}
//         showAvatarForEveryMessage={true}
//         showUserAvatar={true}
//         onSend={(messages) => onSend(messages)}
//         user={{
//           _id: currentUser?.email,
//           name: currentUser?.displayName,
//           avatar: currentUser?.photoURL,
//         }}
//         renderActions={renderActions}
//       />

//       <Modal visible={cameraVisible} animationType="slide">
//         <Camera
//           style={styles.camera}
//           type={Camera.Constants.Type.back}
//           ref={(ref) => setCameraRef(ref)}
//         >
//           <View style={styles.cameraButtonContainer}>
//             <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
//               <Text style={styles.cameraButtonText}>Chụp ảnh</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.cameraButton}
//               onPress={() => setCameraVisible(false)}
//             >
//               <Text style={styles.cameraButtonText}>Hủy</Text>
//             </TouchableOpacity>
//           </View>
//         </Camera>
//       </Modal>
//     </View>
//   );
// };

// export default ChatScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     fontSize: 20,
//   },
//   messageContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   recallButton: {
//     marginLeft: 10,
//     padding: 5,
//     backgroundColor: "#ff0000",
//     borderRadius: 5,
//   },
//   recallButtonText: {
//     color: "#fff",
//     fontSize: 12,
//   },
//   camera: {
//     flex: 1,
//     justifyContent: "flex-end",
//   },
//   cameraButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 20,
//   },
//   cameraButton: {
//     alignItems: "center",
//     justifyContent: "center",
//     height: 60,
//     width: 100,
//     borderRadius: 30,
//     backgroundColor: "#007AFF",
//   },
//   cameraButtonText: {
//     color: "#fff",
//     fontSize: 18,
//   },
// });

import React, {
  useEffect,
  useCallback,
  useState,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Avatar } from "react-native-elements";
import { auth, db, storage } from "../firebase";
import { GiftedChat, Actions, Message } from "react-native-gifted-chat";
import { AntDesign } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { launchCamera } from "expo-image-picker";

const ChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const currentUser = auth.currentUser;
  const { recipientID } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={{ marginLeft: 30 }}>
          <Avatar
            rounded
            source={{
              uri: auth?.currentUser?.photoURL,
            }}
          />
        </View>
      ),
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, currentUser]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Chat",
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();

    const unsubscribe = onSnapshot(
      query(
        collection(db, "chats"),
        where("users", "array-contains", currentUser?.uid),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const newMessages = snapshot.docs
          .filter(
            (doc) =>
              (doc.data().senderID === currentUser?.uid &&
                doc.data().receiverID === recipientID) ||
              (doc.data().senderID === recipientID &&
                doc.data().receiverID === currentUser?.uid)
          )
          .map((doc) => ({
            _id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text,
            image: doc.data().image || null,
            file: doc.data().file || null,
            user: doc.data().user,
          }));
        setMessages(newMessages);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser, recipientID]);

  const onSend = useCallback(
    async (messages = []) => {
      const newMessage = messages[0];
      const { _id, createdAt, text, user, image, file } = newMessage;

      if (!recipientID) {
        console.error("recipientID is undefined");
        return;
      }

      await addDoc(collection(db, "chats"), {
        _id,
        createdAt,
        text,
        user,
        image: image || null,
        file: file || null,
        users: [currentUser?.uid, recipientID],
        senderID: currentUser?.uid,
        receiverID: recipientID,
      });

      const senderDocRef = doc(db, "users", currentUser.uid);
      const receiverDocRef = doc(db, "users", recipientID);

      await updateDoc(senderDocRef, {
        lastMessageSent: {
          text,
          createdAt,
        },
      });

      await updateDoc(receiverDocRef, {
        lastMessageReceived: {
          text,
          createdAt,
        },
      });
    },
    [currentUser, recipientID]
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const source = result.assets[0];
      const storageRef = ref(storage, `chat_images/${source.fileName}`);
      const img = await fetch(source.uri);
      const bytes = await img.blob();
      await uploadBytes(storageRef, bytes);
      const imageUrl = await getDownloadURL(storageRef);

      const message = {
        _id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        text: "",
        user: {
          _id: currentUser?.email,
          name: currentUser?.displayName,
          avatar: currentUser?.photoURL,
        },
        image: imageUrl,
      };

      onSend([message]);
    }
  };

  const takePhoto = async () => {
    if (cameraRef) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.takePictureAsync(options);

      const storageRef = ref(storage, `chat_images/${Date.now()}.jpg`);
      const img = await fetch(data.uri);
      const bytes = await img.blob();
      await uploadBytes(storageRef, bytes);
      const imageUrl = await getDownloadURL(storageRef);

      const message = {
        _id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        text: "",
        user: {
          _id: currentUser?.email,
          name: currentUser?.displayName,
          avatar: currentUser?.photoURL,
        },
        image: imageUrl,
      };

      onSend([message]);
      setCameraVisible(false);
    }
  };

  const recallMessage = (messageId) => {
    Alert.alert(
      "Thu hồi tin nhắn",
      "Bạn có chắc chắn muốn thu hồi tin nhắn này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            await deleteMessage(messageId);
          },
        },
      ]
    );
  };

  const deleteMessage = async (messageId) => {
    const messageRef = doc(db, "chats", messageId);
    try {
      await deleteDoc(messageRef);
      console.log("Tin nhắn đã được thu hồi");
    } catch (error) {
      console.error("Error recalling message: ", error);
    }
  };

  const renderMessage = (props) => {
    const { currentMessage } = props;
    const currentUser = auth.currentUser;

    const isOwnMessage = currentMessage.user._id === currentUser?.email;

    return (
      <TouchableOpacity
        onPress={() => isOwnMessage && deleteMessage(currentMessage._id)}
      >
        <View
          style={[styles.messageContainer, isOwnMessage && styles.ownMessage]}
        >
          <Message {...props} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderActions = (props) => (
    <Actions
      {...props}
      options={{
        ["Choose Photo"]: pickImage,
        ["Take Photo"]: () => setCameraVisible(true),
      }}
      icon={() => <AntDesign name="plus" size={24} color="black" />}
      onSend={(args) => console.log(args)}
    />
  );

  if (hasCameraPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={true}
        showUserAvatar={true}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser?.email,
          name: currentUser?.displayName,
          avatar: currentUser?.photoURL,
        }}
        renderActions={renderActions}
        //renderMessage={renderMessage}
      />

      <Modal visible={cameraVisible} animationType="slide">
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          ref={(ref) => setCameraRef(ref)}
        >
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
              <Text style={styles.cameraButtonText}>Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setCameraVisible(false)}
            >
              <Text style={styles.cameraButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </Modal>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontSize: 20,
  },
  ownMessage: {
    justifyContent: "flex-end",
    //backgroundColor: "red", // Dịch tin nhắn của người dùng hiện tại sang bên phải
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recallButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: "#ff0000",
    borderRadius: 5,
  },
  recallButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cameraButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  cameraButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    width: 100,
    borderRadius: 30,
    backgroundColor: "#007AFF",
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});
