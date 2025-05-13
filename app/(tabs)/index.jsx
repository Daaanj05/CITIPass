"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/theme-context"
import { getStudents, getTeachers, getSections, getSubjects } from "../../lib/supabase"

export default function Dashboard() {
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    sections: 0,
    subjects: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch real data from Supabase
      const { data: studentsData } = await getStudents()
      const { data: teachersData } = await getTeachers()
      const { data: sectionsData } = await getSections()
      const { data: subjectsData } = await getSubjects()

      setStats({
        students: studentsData?.length || 0,
        teachers: teachersData?.length || 0,
        sections: sectionsData?.length || 0,
        subjects: subjectsData?.length || 0,
      })

      // Generate recent activities based on real data
      const activities = []

      if (studentsData && studentsData.length > 0) {
        const latestStudent = studentsData[0]
        activities.push({
          id: "student-" + latestStudent.id,
          title: "New Student Added",
          description: `Added ${latestStudent.profiles?.full_name || "New Student"} to system`,
          time: "Recently",
          icon: "person-add",
        })
      }

      if (teachersData && teachersData.length > 0) {
        const latestTeacher = teachersData[0]
        activities.push({
          id: "teacher-" + latestTeacher.id,
          title: "New Teacher Added",
          description: `Added ${latestTeacher.profiles?.full_name || "New Teacher"} to system`,
          time: "Recently",
          icon: "school",
        })
      }

      setRecentActivities(activities)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      Alert.alert("Error", "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" }, styles.loadingContainer]}
      >
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={{ color: isDarkMode ? "#fff" : "#333", marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" }]}>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
          <View style={[styles.statIconContainer, { backgroundColor: "#8B0000" }]}>
            <Ionicons name="people" size={24} color="white" />
          </View>
          <View style={styles.statInfo}>
            <Text style={[styles.statCount, { color: isDarkMode ? "#fff" : "#333" }]}>{stats.students}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Students</Text>
          </View>
        </View>

        <View style={[styles.statCard, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
          <View style={[styles.statIconContainer, { backgroundColor: "#8B0000" }]}>
            <Ionicons name="school" size={24} color="white" />
          </View>
          <View style={styles.statInfo}>
            <Text style={[styles.statCount, { color: isDarkMode ? "#fff" : "#333" }]}>{stats.teachers}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Teachers</Text>
          </View>
        </View>

        <View style={[styles.statCard, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
          <View style={[styles.statIconContainer, { backgroundColor: "#8B0000" }]}>
            <Ionicons name="grid" size={24} color="white" />
          </View>
          <View style={styles.statInfo}>
            <Text style={[styles.statCount, { color: isDarkMode ? "#fff" : "#333" }]}>{stats.sections}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Sections</Text>
          </View>
        </View>

        <View style={[styles.statCard, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
          <View style={[styles.statIconContainer, { backgroundColor: "#8B0000" }]}>
            <Ionicons name="book" size={24} color="white" />
          </View>
          <View style={styles.statInfo}>
            <Text style={[styles.statCount, { color: isDarkMode ? "#fff" : "#333" }]}>{stats.subjects}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Subjects</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Recent Activities</Text>

        {recentActivities.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
            <Text style={{ color: isDarkMode ? "#ccc" : "#666" }}>No recent activities</Text>
          </View>
        ) : (
          recentActivities.map((activity) => (
            <View key={activity.id} style={[styles.activityCard, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
              <View style={[styles.activityIconContainer, { backgroundColor: "#8B0000" }]}>
                <Ionicons name={activity.icon} size={20} color="white" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, { color: isDarkMode ? "#fff" : "#333" }]}>{activity.title}</Text>
                <Text style={[styles.activityDesc, { color: isDarkMode ? "#ccc" : "#666" }]}>
                  {activity.description}
                </Text>
                <Text style={[styles.activityTime, { color: isDarkMode ? "#aaa" : "#999" }]}>{activity.time}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={[styles.refreshButton, { backgroundColor: "#8B0000" }]} onPress={fetchData}>
        <Ionicons name="refresh" size={20} color="white" />
        <Text style={styles.refreshButtonText}>Refresh Data</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statCount: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  activityCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 14,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
})
