import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  Button,
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  document,
  setDoc,
  listAll,
} from "firebase/firestore";
import { db, auth, storage } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import NetInfo from "@react-native-community/netinfo";
import "firebase/storage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
//import * as FileSystem from "expo-file-system";
import { launchCameraAsync, MediaTypeOptions } from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
const GroupChatScreen = ({ route }) => {
  const { groupId } = route.params;
  const [stateGroupId, setStateGroupId] = useState(groupId); // Khai báo state cho groupId

  const [friendList, setFriendList] = useState([]);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupName, setGroupName] = useState("");
  const scrollViewRef = useRef();
  const navigation = useNavigation();
  const [isSettingsListOpen, setIsSettingsListOpen] = useState(false);
  const [message, setMessage] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [groupImage, setGroupImage] = useState(null);
  const [img, setImg] = useState(null);
  const [imgUrl, setImgUrl] = useState([]);
  const [groupData, setGroupData] = useState(null);
  const currentUser = auth.currentUser;
  const currentUserUid = currentUser ? currentUser.uid : "";

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupDocRef = doc(db, "groups", stateGroupId);
        const groupDocSnapshot = await getDoc(groupDocRef);
        if (groupDocSnapshot.exists()) {
          setGroupData(groupDocSnapshot.data());
        } else {
          console.error("Group does not exist.");
        }
      } catch (error) {
        console.error("Error fetching group data: ", error);
      }
    };

    fetchGroupData();
  }, [stateGroupId]);

  const outGroup = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No user is currently logged in.");
        return;
      }

      if (!groupData) {
        console.error("Group data is not loaded yet.");
        return;
      }

      const groupDocRef = doc(db, "groups", stateGroupId);

      // Kiểm tra nếu người dùng hiện tại là creator thì không cho phép rời khỏi nhóm
      if (groupData.creatorId === currentUser.uid) {
        Alert.alert(
          "Error",
          "Bạn không thể rời khỏi nhóm này vì bạn là người tạo nhóm."
        );
        return;
      }

      // Cập nhật danh sách thành viên
      await updateDoc(groupDocRef, { members: arrayRemove(currentUser.uid) });

      Alert.alert("Thành công", "Bạn đã rời khỏi nhóm.");
      // Điều hướng quay lại màn hình trước
      navigation.goBack();
    } catch (error) {
      console.error("Lỗi khi rời khỏi nhóm: ", error);
    }
  };

  useEffect(() => {
    // Tải dữ liệu ban đầu của group từ Firestore khi component được mount
    const fetchGroupData = async () => {
      try {
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        if (groupDoc.exists()) {
          const groupData = groupDoc.data();
          setGroupName(groupData.name);
          setGroupImage({ uri: groupData.image });
        }
      } catch (error) {
        console.error("Error fetching group data: ", error);
      }
    };
    fetchGroupData();
  }, [groupId]);

  //Hàm để chọn và tải ảnh từ thư viện
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setGroupImage(result.assets[0]); // Cập nhật ảnh khi được chọn từ thư viện
    }
  };

  // Khai báo hàm setGroupId để cập nhật giá trị của groupId
  const setGroupId = (newGroupId) => {
    setStateGroupId(newGroupId);
  };

  const saveChanges = async () => {
    try {
      let imageUrl = null;

      // Nếu có ảnh mới, upload ảnh lên Firebase Storage và lấy URL
      if (groupImage) {
        const fileUri = groupImage.uri;
        if (fileUri) {
          const response = await fetch(fileUri);
          const blob = await response.blob();
          const storageRef = ref(
            storage,
            `groupImages/${new Date().toISOString()}`
          );
          await uploadBytes(storageRef, blob);
          imageUrl = await getDownloadURL(storageRef);
        }
      }

      // Tạo hoặc cập nhật tài liệu trong Firestore
      await updateDoc(doc(db, "groups", groupId), {
        name: groupName,
        image: imageUrl,
      });
      console.log("Document successfully written!");
      toggleModal(); // Đóng modal sau khi lưu thay đổi
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  };

  // // Khai báo hàm saveChanges để lưu thay đổi, bao gồm ảnh mới (nếu có)
  // const saveChanges = async () => {
  //     try {
  //         let imageUrl = null;

  //         // Kiểm tra xem groupImage và groupImage.uri có tồn tại và hợp lệ không
  //         if (groupImage && groupImage.uri) {
  //             // Fetch ảnh từ groupImage.uri
  //             const response = await fetch(groupImage.uri);

  //             // Kiểm tra xem fetch có thành công không
  //             if (response.ok) {
  //                 // Chuyển đổi dữ liệu fetched thành blob
  //                 const blob = await response.blob();

  //                 // Upload blob lên Firebase Storage
  //                 const storageRef = ref(storage, `groupImages/${new Date().toISOString()}`);
  //                 await uploadBytes(storageRef, blob);

  //                 // Lấy URL của ảnh từ Firebase Storage
  //                 imageUrl = await getDownloadURL(storageRef);

  //                 // Thêm timestamp để tránh caching
  //                 imageUrl += `?t=${new Date().getTime()}`;
  //             } else {
  //                 // Nếu fetch không thành công, in ra thông báo lỗi
  //                 console.error('Error fetching image:', response.statusText);
  //             }
  //         }

  //         // Tiếp tục cập nhật tài liệu trong Firestore nếu không có lỗi trong quá trình fetch ảnh
  //         if (imageUrl !== null) {
  //             await updateDoc(doc(db, 'groups', groupId), {
  //                 name: groupName,
  //                 image: imageUrl
  //             });
  //             console.log('Document successfully written!');
  //             // Cập nhật state để phản ánh thay đổi mới
  //             setGroupImage({ uri: imageUrl });
  //             toggleModal(); // Đóng modal sau khi lưu thay đổi
  //         } else {
  //             console.warn('Image URL is null, skipping document update.');
  //         }
  //     } catch (error) {
  //         console.error('Error writing document: ', error);
  //     }
  // };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, `groups/${groupId}/messages`),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroupMessages(messages);
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    const fetchGroupName = async () => {
      try {
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        const groupData = groupDoc.data();
        setGroupName(groupData.name);
      } catch (error) {
        console.error("Error getting group name: ", error);
      }
    };

    const fetchFriendList = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const currentUserDoc = await getDoc(
            doc(db, "users", currentUser.uid)
          );
          const friendIds = currentUserDoc.data().friends || [];

          const friendDocs = await Promise.all(
            friendIds.map((friendId) => getDoc(doc(db, "users", friendId)))
          );
          const friends = friendDocs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            isSelected: false,
          }));

          const groupDoc = await getDoc(doc(db, "groups", groupId));
          const groupMembers = groupDoc.data().members || [];

          const updatedFriends = friends.map((friend) => ({
            ...friend,
            isSelected: groupMembers.includes(friend.id),
          }));

          setFriendList(updatedFriends);
        }
      } catch (error) {
        console.error("Error getting friend list: ", error);
      }
    };

    fetchGroupName();
    fetchFriendList();
  }, [groupId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: groupName,
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 10 }}>
          <View style={{ flexDirection: "row", marginRight: 20 }}>
            <TouchableOpacity
              onPress={handleToggleUserList}
              style={styles.addButton}
            >
              <AntDesign name="addusergroup" size={30} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteGroup}
              style={{ marginLeft: 15 }}
            >
              <MaterialIcons name="cancel" size={33} color="black" />
            </TouchableOpacity>

            {/* <TouchableOpacity
                            style={{ marginLeft: 15 }}
                            onPress={() => {
                                // navigation.navigate("ProfileGroupScreen");
                                onPress = { toggleModal }
                            }}>
                            <AntDesign name="setting" size={33} color="black" />
                        </TouchableOpacity> */}

            <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={toggleModal} // Đặt toggleModal trực tiếp vào onPress
            >
              <AntDesign name="setting" size={33} color="black" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, groupName]);

  const handleToggleUserList = () => {
    setIsUserListOpen((prevState) => !prevState);
  };

  const handleAddUserToGroup = async (userId) => {
    const isUserAdded = friendList.find(
      (user) => user.id === userId && user.isSelected
    );
    if (!isUserAdded) {
      try {
        const groupDocRef = doc(db, "groups", groupId);
        await updateDoc(groupDocRef, { members: arrayUnion(userId) });
        Alert.alert(
          "Thành công",
          "Người dùng đã được thêm vào nhóm thành công!"
        );

        const updatedFriendList = friendList.map((user) => {
          if (user.id === userId) {
            return { ...user, isSelected: true };
          }
          return user;
        });
        setFriendList(updatedFriendList);
      } catch (error) {
        console.error("Lỗi chưa thêm được người dùng vào nhóm:", error);
      }
    } else {
      console.log("Người dùng đã ở trong nhóm:", userId);
      Alert.alert("Người dùng đã ở trong nhóm!");
    }
  };

  const handleRemoveUserFromGroup = async (userId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("Không có người dùng được xác định.");
        return;
      }
      const groupDocRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupDocRef);
      const groupData = groupDoc.data();

      if (groupData.creatorId === currentUser.uid) {
        Alert.alert(
          "Xác nhận",
          "Bạn có chắc muốn xóa người dùng này ra khỏi nhóm không?",
          [
            { text: "Hủy bỏ", style: "cancel" },
            {
              text: "Đồng ý",
              onPress: async () => {
                try {
                  await updateDoc(groupDocRef, {
                    members: arrayRemove(userId),
                  });
                  Alert.alert(
                    "Thành công",
                    "Xóa người dùng ra khỏi nhóm thành công!"
                  );

                  const updatedFriendList = friendList.map((user) => {
                    if (user.id === userId) {
                      return { ...user, isSelected: false };
                    }
                    return user;
                  });
                  setFriendList(updatedFriendList);
                } catch (error) {
                  console.error(
                    "Lỗi chưa xóa được người dùng ra khỏi nhóm:",
                    error
                  );
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Không thể xóa admin",
          "Bạn không thể xóa admin ra khỏi nhóm."
        );
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra quyền xóa người dùng khỏi nhóm:", error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "groupChats"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((message) => message.groupId === groupId);
      setGroupMessages(messages);
    });

    return () => unsubscribe();
  }, [db, groupId]);

  const handleSendMessage = async (imageUrl, isImage = false) => {
    try {
      // Kiểm tra nếu tin nhắn không được nhập và không phải là tin nhắn hình ảnh
      if (!isImage && (!message || !message.trim())) {
        console.error("Message is empty.");
        return;
      }

      // Lấy thông tin người dùng hiện tại
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No user is currently logged in.");
        return;
      }

      const currentUserUid = currentUser.uid;
      const currentUserDocRef = doc(db, "users", currentUserUid);
      const currentUserDoc = await getDoc(currentUserDocRef);

      if (!currentUserDoc.exists()) {
        console.error("User document does not exist.");
        return;
      }

      const userData = currentUserDoc.data();
      console.log("User data:", userData);

      const senderName = userData.name;
      console.log("Sender name:", senderName);

      if (!senderName) {
        console.error("User name is not defined in the document.");
        return;
      }

      // Lấy thông tin nhóm từ Firestore
      const groupDocRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupDocRef);

      if (!groupDoc.exists()) {
        console.error("Group document does not exist.");
        return;
      }

      const groupData = groupDoc.data();
      console.log("Group data:", groupData);

      const groupName = groupData.name;
      console.log("Group name:", groupName);

      if (!groupName) {
        console.error("Group name is not defined in the document.");
        return;
      }

      // Tạo dữ liệu tin nhắn
      const messageData = {
        groupId: groupId,
        groupName: groupName,
        text: isImage ? "" : message, // Nếu là hình ảnh thì để trống text
        senderId: currentUserUid,
        senderName: senderName,
        createdAt: serverTimestamp(),
      };

      // Thêm trường imageUrl vào tin nhắn nếu imageUrl là một chuỗi
      if (typeof imageUrl === "string") {
        messageData.imageUrl = imageUrl;
      }

      console.log("Message data to be sent:", messageData);

      // Thêm tin nhắn vào Firestore
      const messageRef = await addDoc(
        collection(db, "groupChats"),
        messageData
      );
      console.log("Message sent successfully with ID:", messageRef.id);

      setMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  // const renderItem = ({ item }) => {
  //     let formattedTime = '';
  //     if (item.createdAt && item.createdAt.toDate) {
  //         formattedTime = format(item.createdAt.toDate(), 'h:mm a');
  //     }

  //     return (
  //         <Pressable onPress={() => handlePress(item)}>
  //             <View style={[styles.messageContainer, item.senderId === currentUserUid ? styles.sentMessage : styles.receivedMessage]}>
  //                 <Text style={styles.senderName}>{item.senderName}</Text>
  //                 <Text>{item.text}</Text>
  //                 {formattedTime && (
  //                     <Text style={styles.timestamp}>{formattedTime}</Text>
  //                 )}
  //             </View>
  //         </Pressable>
  //     );
  // };

  const renderItem = ({ item }) => {
    let formattedTime = "";
    if (item.createdAt && item.createdAt.toDate) {
      formattedTime = format(item.createdAt.toDate(), "h:mm a");
    }

    return (
      <Pressable onPress={() => handlePress(item)}>
        <View
          style={[
            styles.messageContainer,
            item.senderId === currentUserUid
              ? styles.sentMessage
              : styles.receivedMessage,
          ]}
        >
          <Text style={styles.senderName}>{item.senderName}</Text>
          <Text>{item.text}</Text>
          {formattedTime && (
            <Text style={styles.timestamp}>{formattedTime}</Text>
          )}
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: 100, height: 100 }} // Thay đổi kích thước hình ảnh tùy ý
              resizeMode="cover"
            />
          )}
          {item.replyText && (
            <View style={styles.replyContainer}>
              <Text style={styles.replyLabel}>Tin nhắn trả lời:</Text>
              <Text style={styles.replyText}>{item.replyText}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  // const handleSendImage = async () => {
  //     try {
  //         // Kiểm tra và yêu cầu quyền truy cập vào thư viện ảnh
  //         const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //         if (status !== 'granted') {
  //             console.log('Permission to access media library denied');
  //             return;
  //         }
  //         console.log('Permission granted, opening image library...');

  //         // Chọn hình ảnh từ thư viện ảnh của thiết bị
  //         let result = await ImagePicker.launchImageLibraryAsync({
  //             mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //             quality: 1,
  //         });

  //         console.log('ImagePicker result:', result);

  //         if (!result.canceled && result.assets && result.assets.length > 0) {
  //             const imageAsset = result.assets[0];
  //             console.log('Image selected:', imageAsset.uri);

  //             const fileName = imageAsset.uri.split('/').pop();
  //             const storageRef = ref(storage, `chat_images/${fileName}`);

  //             const imageResponse = await fetch(imageAsset.uri);
  //             const imageBlob = await imageResponse.blob();
  //             await uploadBytes(storageRef, imageBlob);
  //             console.log('Image uploaded to Firebase Storage');

  //             const imageUrl = await getDownloadURL(storageRef);
  //             console.log('Image URL:', imageUrl);

  //             // Gọi hàm handleSendMessage với imageUrl
  //             await handleSendMessage(imageUrl, true);
  //         } else {
  //             console.log('Image selection was cancelled or result.uri is missing');
  //         }
  //     } catch (error) {
  //         console.error('Error sending image message:', error);
  //     }
  // };

  const handleSendImage = async () => {
    try {
      // Kiểm tra và yêu cầu quyền truy cập vào thư viện ảnh
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access media library denied");
        return;
      }
      console.log("Permission granted, opening image library...");

      // Chọn hình ảnh từ thư viện ảnh của thiết bị
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      console.log("ImagePicker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageAsset = result.assets[0];
        console.log("Image selected:", imageAsset.uri);

        // Tạo định danh cho tệp hình ảnh
        const fileName = imageAsset.uri.split("/").pop();
        const storageRef = ref(storage, `chat_images/${fileName}`);

        const imageResponse = await fetch(imageAsset.uri);
        const imageBlob = await imageResponse.blob();
        await uploadBytes(storageRef, imageBlob);
        console.log("Image uploaded to Firebase Storage");

        const imageUrl = await getDownloadURL(storageRef);
        console.log("Image URL:", imageUrl);

        // Gọi hàm handleSendMessage với imageUrl và isImage=true
        await handleSendMessage(imageUrl, true);
      } else {
        console.log("Image selection was cancelled or result.uri is missing");
      }
    } catch (error) {
      console.error("Error sending image message:", error);
    }
  };

  const handleDeleteGroup = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        const groupData = groupDoc.data();
        if (groupData.creatorId === currentUser.uid) {
          Alert.alert(
            "Giải tán nhóm",
            "Bạn có chắc chắn muốn giải tán nhóm này không?",
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    await deleteDoc(doc(db, "groups", groupId));
                    Alert.alert(
                      "Thành công",
                      "Nhóm đã được giải tán thành công!"
                    );
                    navigation.goBack();
                  } catch (error) {
                    console.error("Lỗi khi giải tán nhóm:", error);
                    Alert.alert(
                      "Lỗi",
                      "Không thể giải tán nhóm. Vui lòng thử lại."
                    );
                  }
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert(
            "Không có quyền",
            "Chỉ Admin mới có thể giải tán nhóm này."
          );
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra quyền xóa nhóm:", error);
        Alert.alert(
          "Lỗi",
          "Không thể kiểm tra quyền xóa nhóm. Vui lòng thử lại."
        );
      }
    } else {
      console.error("Không có người dùng đang đăng nhập.");
    }
  };

  const handlePress = (message) => {
    if (!message || !message.id) {
      console.log("Invalid message");
      return;
    }

    setMenuPosition({ top: 0, left: 0 });
    setSelectedMessage(message);
  };

  const handleReply = () => {
    setReplying(true);
  };

  const handleSendReply = () => {
    // Xử lý việc gửi tin nhắn trả lời ở đây
    console.log("Sending reply:", replyContent);

    // Sau khi gửi tin nhắn trả lời, reset các state và ẩn giao diện nhập tin nhắn trả lời
    setReplyContent("");
    setShowReplyInput(false);
    setSelectedMessage(null);
  };

  const handleDelete = async () => {
    try {
      if (!selectedMessage || !selectedMessage.id) {
        console.log("No message selected for recall");
        return;
      }

      const messageId = selectedMessage.id;
      const collectionName = "groupChats"; // collectionName là 'groupChats'
      const docRef = doc(db, collectionName, messageId);

      console.log(
        `Attempting to delete message with ID: ${messageId} from collection: ${collectionName}`
      );

      await deleteDoc(docRef);
      console.log("Message deleted from Firestore");

      // Cập nhật groupMessages sau khi xóa tin nhắn
      const newMessages = groupMessages.filter(
        (message) => message.id !== messageId
      );

      // Làm mới giao diện người dùng
      setGroupMessages(newMessages);

      // Đảm bảo rằng selectedMessage đã được cập nhật thành null
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  const MessageMenu = ({ visible, onClose, onReply, onDelete, position }) => {
    if (!visible) {
      return null;
    }

    return (
      <View style={[styles.menuContainer, position]}>
        <TouchableOpacity onPress={onReply}>
          <Text style={styles.menuItem}>Reply</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onDelete();
            onClose();
          }}
        >
          <Text style={styles.menuItem}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isUserListOpen && (
        <FlatList
          data={friendList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => handleAddUserToGroup(item.id)}
            >
              <Image source={{ uri: item.photoURL }} style={styles.avatar} />
              <View style={styles.userInfoContainer}>
                <Text style={styles.userName}>{item.name}</Text>
                {item.isSelected ? (
                  <TouchableOpacity
                    onPress={() => handleRemoveUserFromGroup(item.id)}
                  >
                    <AntDesign name="minuscircleo" size={24} color="red" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleAddUserToGroup(item.id)}
                    style={styles.addButton}
                  >
                    <AntDesign name="pluscircleo" size={24} color="black" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <Pressable
        style={styles.container}
        onPress={() => setSelectedMessage(null)}
      >
        <FlatList
          data={groupMessages} // Không đảo ngược thứ tự
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted={false} // Không đảo ngược danh sách
        />

        <MessageMenu
          visible={selectedMessage !== null}
          onClose={() => setSelectedMessage(null)} // Thay đổi đây
          onReply={handleReply}
          onDelete={handleDelete}
          position={menuPosition}
        />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          // placeholder="Nhập tin nhắn của bạn..."
          // onChangeText={setMessage}
          // value={message}

          placeholder={
            replying ? "Nhập tin nhắn trả lời..." : "Nhập tin nhắn của bạn..."
          }
          onChangeText={(text) =>
            replying ? setReplyContent(text) : setMessage(text)
          }
          value={replying ? replyContent : message}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={replying ? handleSendReply : handleSendMessage}
        >
          <AntDesign name="rightcircleo" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.imageButton} onPress={handleSendImage}>
          <FontAwesome name="image" size={25} color="black" />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Image
              source={groupImage}
              style={{ width: 170, height: 170, marginBottom: 10 }}
            />
            <TouchableOpacity
              onPress={pickImage}
              style={styles.changeImageButton}
            >
              <Text style={styles.changeImageText}>Thay đổi ảnh</Text>
            </TouchableOpacity>
            <TextInput
              value={groupName}
              onChangeText={(text) => setGroupName(text)}
              placeholder="Nhập tên nhóm"
              style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            {/* <Button title="Lưu" onPress={saveChanges} style={styles.saveButton} /> */}
            <TouchableOpacity onPress={saveChanges} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleModal}>
              <Text style={styles.huyButton}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={outGroup}>
              <Ionicons name="log-out-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    marginLeft: 20,
    marginBottom: 20,
  },
  addButton: {
    marginBottom: 10,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendButton: {
    marginLeft: 10,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  senderName: {
    fontWeight: "bold",
    marginBottom: 5, // Thêm margin dưới cho tên người gửi
    marginRight: 5, // Thêm margin phải cho tên người gửi
  },
  text: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: "grey",
    alignSelf: "flex-end",
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EAEAEA",
  },
  imageButton: {
    padding: 17,
  },
  menuContainer: {
    position: "absolute",
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,
    elevation: 5, // For Android shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    zIndex: 10, // Ensure the menu appears on top
    marginLeft: 150,
    marginTop: 10,
  },
  menuItem: {
    padding: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  changeImageButton: {
    backgroundColor: "#007bff",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 5, // Thêm khoảng cách dọc giữa nút và tấm ảnh
    marginHorizontal: 8, // Thêm khoảng cách ngang giữa nút và tấm ảnh
    alignItems: "center",
    justifyContent: "center",
  },

  changeImageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5, // Thêm khoảng cách dọc giữa nút và tấm ảnh
    marginHorizontal: 8, // Thêm khoảng cách ngang giữa nút và tấm ảnh
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  huyButton: {
    color: "black",
    fontWeight: "bold",
  },
});

export default GroupChatScreen;
