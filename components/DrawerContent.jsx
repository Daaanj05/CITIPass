"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../context/theme-context"
import { useRouter } from "expo-router"
import { DrawerContentScrollView } from "@react-navigation/drawer"

export default function DrawerContent(props) {
  const { isDarkMode } = useTheme()
  const router = useRouter()

  const handleSignOut = () => {
    // In a real app, you would handle sign out logic here
    router.replace("/login")
  }

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" }]}
    >
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

      <View style={styles.drawerItems}>
        <TouchableOpacity style={styles.drawerItem} onPress={() => router.push("/(tabs)")}>
          <Ionicons name="home" size={22} color={isDarkMode ? "#fff" : "#333"} />
          <Text style={[styles.drawerItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => router.push("/(tabs)/accounts")}>
          <Ionicons name="people" size={22} color={isDarkMode ? "#fff" : "#333"} />
          <Text style={[styles.drawerItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Accounts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => router.push("/(tabs)/sections")}>
          <MaterialIcons name="class" size={22} color={isDarkMode ? "#fff" : "#333"} />
          <Text style={[styles.drawerItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Sections</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => router.push("/(tabs)/subjects")}>
          <MaterialIcons name="subject" size={22} color={isDarkMode ? "#fff" : "#333"} />
          <Text style={[styles.drawerItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Subjects</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={() => router.push("/(tabs)/schedules")}>
          <Ionicons name="calendar" size={22} color={isDarkMode ? "#fff" : "#333"} />
          <Text style={[styles.drawerItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Schedules</Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: isDarkMode ? "#333" : "#ddd" }]} />

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            // Navigate to settings
            console.log("Settings pressed")
          }}
        >
          <Ionicons name="settings" size={22} color={isDarkMode ? "#fff" : "#333"} />
          <Text style={[styles.drawerItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={handleSignOut}>
          <Ionicons name="log-out" size={22} color="#8B0000" />
          <Text style={[styles.drawerItemText, { color: "#8B0000" }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: isDarkMode ? "#ccc" : "#666" }]}>CitiPass Admin v1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  drawerItems: {
    padding: 16,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  drawerItemText: {
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
