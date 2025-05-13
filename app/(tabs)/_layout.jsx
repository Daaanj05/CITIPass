"use client"

import { Tabs } from "expo-router"
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../../context/theme-context"
import Header from "../../components/Header"

export default function TabLayout() {
  const { isDarkMode } = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8B0000",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: isDarkMode ? "#222" : "#fff",
          borderTopColor: isDarkMode ? "#333" : "#eee",
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        header: (props) => <Header {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Accounts",
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sections"
        options={{
          title: "Sections",
          tabBarIcon: ({ color }) => <FontAwesome5 name="chalkboard" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: "Subjects",
          tabBarIcon: ({ color }) => <MaterialIcons name="subject" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedules"
        options={{
          title: "Schedules",
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="strands"
        options={{
          title: "Strands",
          tabBarIcon: ({ color }) => <MaterialIcons name="school" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
