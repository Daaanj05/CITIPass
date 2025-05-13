"use client"

import { useState } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, StatusBar, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/theme-context"
import { useRouter } from "expo-router"

export default function Settings() {
  const { isDarkMode, toggleTheme } = useTheme()
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState("30")

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" }]}>
      <StatusBar backgroundColor="#8B0000" barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: "#8B0000" }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Appearance</Text>
          <View style={[styles.settingItem, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? "#ccc" : "#666" }]}>
                Toggle between light and dark theme
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#8B0000" }}
              thumbColor={"#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Notifications</Text>
          <View style={[styles.settingItem, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? "#ccc" : "#666" }]}>
                Receive notifications on your device
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: "#8B0000" }}
              thumbColor={"#f4f3f4"}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Email Notifications</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? "#ccc" : "#666" }]}>
                Receive notifications via email
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: "#767577", true: "#8B0000" }}
              thumbColor={"#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Data Synchronization</Text>
          <View style={[styles.settingItem, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Auto Sync</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? "#ccc" : "#666" }]}>
                Automatically sync data with server
              </Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: "#767577", true: "#8B0000" }}
              thumbColor={"#f4f3f4"}
            />
          </View>

          {autoSync && (
            <View style={[styles.settingItem, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#333" }]}>
                  Sync Interval (minutes)
                </Text>
                <Text style={[styles.settingDescription, { color: isDarkMode ? "#ccc" : "#666" }]}>
                  How often to sync data with server
                </Text>
              </View>
              <TextInput
                style={[
                  styles.intervalInput,
                  {
                    backgroundColor: isDarkMode ? "#333" : "#fff",
                    color: isDarkMode ? "#fff" : "#333",
                    borderColor: isDarkMode ? "#444" : "#ddd",
                  },
                ]}
                value={syncInterval}
                onChangeText={setSyncInterval}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Account</Text>
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Change Password</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? "#ccc" : "#666" }]}>
                Update your account password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#ccc" : "#666"} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Privacy Settings</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? "#ccc" : "#666" }]}>
                Manage your privacy preferences
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#ccc" : "#666"} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#333" }]}>About</Text>
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#333" }]}>App Version</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? "#ccc" : "#666" }]}>1.0.0</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#ccc" : "#666"} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDarkMode ? "#333" : "#eee" }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#ccc" : "#666"} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: "#8B0000" }]}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  intervalInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    textAlign: "center",
    fontSize: 16,
  },
  signOutButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  signOutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
