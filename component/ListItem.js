import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Image,
} from "react-native";
import React from "react";
import AppTest from "./AppTest";
import { MaterialCommunityIcons } from "@expo/vector-icons";
export default function ListItem({
  title,
  subTitle,
  image,
  ImageComponent,
  onPress,
}) {
  return (
    <TouchableWithoutFeedback underLaycolor="#333" onPress={onPress}>
      {/* <View style={styles.container}>
        {ImageComponent}
        {image && (
          <Image
            source={{
              uri: image,
            }}
            style={styles.image}
          />
        )}
        <View style={styles.ownerHolder}>
          <AppTest
            inputText={title}
            stylesLing={styles.name}
            numberOfLines={1}
          />
          {subTitle && (
            <AppTest
              inputText={subTitle}
              stylesLing={styles.listing}
              noOfLines={2}
            />
          )}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#000" />
      </View> */}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    alignItems: "center",
    marginHorizontal: 30,
    marginVertical: 20,
    borderRadius: 10,
  },
  image: {
    width: 80,
    height: 150,
    borderRadius: 50,
    marginLeft: 10,
    marginVertical: 10,
  },
  ownerHolder: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 15,
    justifyContent: "center",
  },
  name: {
    fontWeight: "bold",
  },
  listing: {
    color: "#6e6969",
    marginTop: 5,
  },
});
