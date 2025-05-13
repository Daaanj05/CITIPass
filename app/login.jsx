"use client"

import { useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/theme-context"
import { supabase } from "../lib/supabase" // Import supabase client

const { height } = Dimensions.get("window")

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { isDarkMode, toggleTheme } = useTheme()

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password")
      return
    }

    try {
      setLoading(true)

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      })

      if (authError) throw authError

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (profileError) throw profileError

      if (!profile) {
        throw new Error("Profile not found")
      }

      // Check if user is an admin
      if (profile.role !== "admin") {
        await supabase.auth.signOut()
        Alert.alert("Access Denied", "You don't have admin privileges")
        return
      }

      // Navigate to admin dashboard
      router.replace("/(tabs)")
    } catch (error) {
      console.error("Login error:", error)
      Alert.alert("Error", error.message || "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#8B0000" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#8B0000" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          {isDarkMode ? (
            <Ionicons name="sunny" size={24} color="white" />
          ) : (
            <Ionicons name="moon" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image source={require("../assets/icon.png")} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#8B0000" />
        </View>
      </View>

      <Text style={styles.loginTitle}>Login</Text>
      <Text style={styles.loginSubtitle}>Admin Mode</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>USERNAME</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: isDarkMode ? "#333" : "white", color: isDarkMode ? "white" : "#333" },
          ]}
          placeholder="Enter your username"
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
          value={username}
          onChangeText={setUsername}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: isDarkMode ? "#333" : "white", color: isDarkMode ? "white" : "#333" },
          ]}
          placeholder="Enter your password"
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: isDarkMode ? "#8B0000" : "white" }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={[styles.loginButtonText, { color: isDarkMode ? "white" : "#8B0000" }]}>
            {loading ? "Logging in..." : "Enter"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 CITI Global College Inc.</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 20,
  },
  themeToggle: {
    padding: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: height * 0.02, // Reduced top margin
  },
  logo: {
    width: 120,
    height: 120,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 15,
  },
  loginSubtitle: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  loginButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    marginTop: "auto",
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    color: "white",
    fontSize: 12,
  },
})
