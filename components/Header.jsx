"use client"

import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "../context/theme-context"
import { useDrawer } from "../context/drawer-context"

export default function Header({ options }) {
  const router = useRouter()
  const { isDarkMode, toggleTheme } = useTheme()
  const { toggleDrawer } = useDrawer()

  return (
    <>
      <StatusBar backgroundColor="#8B0000" barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: "#8B0000" }]}>
        <View style={styles.leftContainer}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>{options?.title || "CitiPass Admin"}</Text>
        </View>

        <View style={styles.rightContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
            {isDarkMode ? (
              <Ionicons name="sunny" size={24} color="white" />
            ) : (
              <Ionicons name="moon" size={24} color="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              // In a real app, this would show notifications
              console.log("Notifications button pressed")
            }}
          >
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 16,
  },
})
