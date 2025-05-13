"use client"

import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { useTheme } from "../context/theme-context"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")

export default function SideMenu({ onClose }) {
  const { isDarkMode } = useTheme()
  const router = useRouter()

  const navigateTo = (route) => {
    onClose()
    router.push(route)
  }

  const handleSignOut = () => {
    onClose()
    router.replace("/login")
  }

  return (
    <View style={styles.container}>
      <View style={[styles.menuContainer, { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" }]}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileImageText}>A</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: isDarkMode ? "#fff" : "#333" }]}>Admin User</Text>
              <Text style={[styles.profileEmail, { color: isDarkMode ? "#ccc" : "#666" }]}>admin@citiglobal.edu</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuItems}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("/(tabs)")} activeOpacity={1}>
            <Ionicons name="home" size={22} color={isDarkMode ? "#fff" : "#333"} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("/(tabs)/accounts")} activeOpacity={1}>
            <Ionicons name="people" size={22} color={isDarkMode ? "#fff" : "#333"} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Accounts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("/(tabs)/sections")} activeOpacity={1}>
            <FontAwesome5 name="chalkboard" size={22} color={isDarkMode ? "#fff" : "#333"} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Sections</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("/(tabs)/strands")} activeOpacity={1}>
            <MaterialIcons name="school" size={22} color={isDarkMode ? "#fff" : "#333"} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Strands</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("/(tabs)/subjects")} activeOpacity={1}>
            <MaterialIcons name="subject" size={22} color={isDarkMode ? "#fff" : "#333"} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Subjects</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("/(tabs)/schedules")} activeOpacity={1}>
            <Ionicons name="calendar" size={22} color={isDarkMode ? "#fff" : "#333"} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Schedules</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: isDarkMode ? "#333" : "#ddd" }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("/settings")} activeOpacity={1}>
            <Ionicons name="settings" size={22} color={isDarkMode ? "#fff" : "#333"} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut} activeOpacity={1}>
            <Ionicons name="log-out" size={22} color="#8B0000" />
            <Text style={[styles.menuItemText, { color: "#8B0000" }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? "#ccc" : "#666" }]}>CitiPass Admin v1.0.0</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 300, // Width of the menu
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    width: 300,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#8B0000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileImageText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  menuItems: {
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  footer: {
    padding: 16,
    marginTop: "auto",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
})
