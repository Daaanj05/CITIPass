"use client"

import { createContext, useContext, useState, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from "react-native"
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "./theme-context"

// Create the context with a default value
const DrawerContext = createContext({
  isOpen: false,
  toggleDrawer: () => {},
  closeDrawer: () => {},
})

// Export the useDrawer hook
export const useDrawer = () => useContext(DrawerContext)

export function DrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const slideAnim = useRef(new Animated.Value(-300)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const router = useRouter()
  const { isDarkMode } = useTheme()

  const toggleDrawer = () => {
    if (isOpen) {
      // Close drawer
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -300,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsOpen(false)
      })
    } else {
      // Open drawer
      setIsOpen(true)
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }

  const closeDrawer = () => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -300,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsOpen(false)
      })
    }
  }

  const navigateTo = (route) => {
    closeDrawer()
    // Add a small delay to ensure the drawer closes before navigation
    setTimeout(() => {
      router.push(route)
    }, 300)
  }

  const handleSignOut = () => {
    closeDrawer()
    // Add a small delay to ensure the drawer closes before navigation
    setTimeout(() => {
      router.replace("/login")
    }, 300)
  }

  const renderDrawer = () => {
    return (
      <>
        <Animated.View
          style={[
            styles.overlay,
            {
              backgroundColor: "rgba(0,0,0,0.5)",
              opacity: fadeAnim,
              display: isOpen ? "flex" : "none",
            },
          ]}
        >
          <TouchableOpacity style={styles.overlayTouch} onPress={closeDrawer} activeOpacity={1} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
              backgroundColor: isDarkMode ? "#121212" : "#f5f5f5",
            },
          ]}
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

          <ScrollView style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("/(tabs)")} activeOpacity={0.7}>
              <Ionicons name="home" size={22} color={isDarkMode ? "#fff" : "#333"} />
              <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo("/(tabs)/accounts")}
              activeOpacity={0.7}
            >
              <Ionicons name="people" size={22} color={isDarkMode ? "#fff" : "#333"} />
              <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Accounts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo("/(tabs)/sections")}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="chalkboard" size={22} color={isDarkMode ? "#fff" : "#333"} />
              <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Sections</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo("/(tabs)/subjects")}
              activeOpacity={0.7}
            >
              <MaterialIcons name="subject" size={22} color={isDarkMode ? "#fff" : "#333"} />
              <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Subjects</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo("/(tabs)/schedules")}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar" size={22} color={isDarkMode ? "#fff" : "#333"} />
              <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Schedules</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isDarkMode ? "#333" : "#ddd" }]} />

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("/settings")} activeOpacity={0.7}>
              <Ionicons name="settings" size={22} color={isDarkMode ? "#fff" : "#333"} />
              <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut} activeOpacity={0.7}>
              <Ionicons name="log-out" size={22} color="#8B0000" />
              <Text style={[styles.menuItemText, { color: "#8B0000" }]}>Sign Out</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: isDarkMode ? "#ccc" : "#666" }]}>CitiPass Admin v1.0.0</Text>
          </View>
        </Animated.View>
      </>
    )
  }

  return (
    <DrawerContext.Provider value={{ isOpen, toggleDrawer, closeDrawer }}>
      {children}
      {renderDrawer()}
    </DrawerContext.Provider>
  )
}

// Update the styles for the overlay to ensure it's properly positioned and clickable
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayTouch: {
    width: "100%",
    height: "100%",
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 300,
    height: "100%",
    zIndex: 1001,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
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
    flex: 1,
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
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
  },
})
