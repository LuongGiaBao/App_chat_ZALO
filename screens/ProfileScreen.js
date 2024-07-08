import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { AntDesign } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
const ProfileScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRef, setUserRef] = useState(null);
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        setUserRef(db.collection("users").doc(user.uid));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userRef) {
      userRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            setCurrentUser((prevUser) => ({
              ...prevUser,
              name: userData.name,
              photoURL: userData.photoURL,
            }));
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    }
  }, [userRef]);

  // const handleLogout = () => {
  //   signOut(auth)
  //     .then(() => {
  //       navigation.replace("Home");
  //     })
  //     .catch((error) => {
  //       console.error("Sign out error:", error);
  //     });
  // };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        {currentUser && (
          <>
            <Image
              source={{
                uri:
                  currentUser?.photoURL ||
                  "https://gravatar.com/avatar/94d45dbdba988afacf30d916e7aaad69?s=200&d=mp&r=x",
              }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{currentUser?.name}</Text>
          </>
        )}
        {/* <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <AntDesign name="logout" size={24} color="black" />
        </TouchableOpacity> */}
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.sectionTitle}>Thông tin người dùng</Text>
        <Text style={styles.subtitle}>
          Email: {currentUser?.email || "N/A"}
        </Text>
        <Text style={styles.subtitle}>Tên: {currentUser?.name || "N/A"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  profileInfo: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "#555",
  },
});

export default ProfileScreen;
