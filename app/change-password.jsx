"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/theme-context"
import { supabase, updatePassword, requestPasswordReset } from "../lib/supabase"

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { isDarkMode } = useTheme()

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long")
      return
    }

    setLoading(true)
    try {
      // First verify current password by trying to sign in
      const { data: user } = await supabase.auth.getUser()

      if (!user?.user?.email) {
        throw new Error("User not found")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: currentPassword,
      })

      if (error) {
        Alert.alert("Error", "Current password is incorrect")
        setLoading(false)
        return
      }

      // Update password
      const { success, error: updateError } = await updatePassword(newPassword)

      if (!success) throw updateError

      Alert.alert("Success", "Password updated successfully")
      router.back()
    } catch (error) {
      console.error("Error changing password:", error)
      Alert.alert("Error", error.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    try {
      const { data: user } = await supabase.auth.getUser()

      if (!user?.user?.email) {
        throw new Error("User not found")
      }

      setLoading(true)
      const { success, error } = await requestPasswordReset(user.user.email)

      if (!success) throw error

      Alert.alert("Password Reset Email Sent", "Please check your email for instructions to reset your password")
    } catch (error) {
      console.error("Error requesting password reset:", error)
      Alert.alert("Error", error.message || "Failed to send password reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" }]}>
      <View style={[styles.header, { backgroundColor: "#8B0000" }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
        <View style={[styles.card, { backgroundColor: isDarkMode ? "#1E1E1E" : "white" }]}>
          <Text style={[styles.title, { color: isDarkMode ? "white" : "#333" }]}>Update Your Password</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>CURRENT PASSWORD</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#333" : "#F5F5F5",
                  color: isDarkMode ? "white" : "#333",
                  borderColor: isDarkMode ? "#444" : "#ddd",
                },
              ]}
              placeholder="Enter current password"
              placeholderTextColor={isDarkMode ? "#999999" : "#999999"}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>NEW PASSWORD</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#333" : "#F5F5F5",
                  color: isDarkMode ? "white" : "#333",
                  borderColor: isDarkMode ? "#444" : "#ddd",
                },
              ]}
              placeholder="Enter new password"
              placeholderTextColor={isDarkMode ? "#999999" : "#999999"}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>CONFIRM NEW PASSWORD</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#333" : "#F5F5F5",
                  color: isDarkMode ? "white" : "#333",
                  borderColor: isDarkMode ? "#444" : "#ddd",
                },
              ]}
              placeholder="Confirm new password"
              placeholderTextColor={isDarkMode ? "#999999" : "#999999"}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: "#8B0000" }]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.updateButtonText}>{loading ? "Updating..." : "Update Password"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPasswordLink} onPress={handleForgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: "#8B0000" }]}>Forgot your current password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  updateButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordLink: {
    marginTop: 20,
    alignItems: "center",
  },
  forgotPasswordText: {
    fontSize: 14,
  },
})
