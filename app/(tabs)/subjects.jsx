"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../../context/theme-context"
import DropDownPicker from "react-native-dropdown-picker"
import { getSubjects, createSubject, getTeachers, updateSubject, deleteSubject } from "../../lib/supabase"

export default function Subjects() {
  const { isDarkMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [menuVisible, setMenuVisible] = useState(false)

  // Form states
  const [subjectName, setSubjectName] = useState("")
  const [subjectCode, setSubjectCode] = useState("")
  const [subjectDescription, setSubjectDescription] = useState("")

  // Dropdown states
  const [openTeacher, setOpenTeacher] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [teacherOptions, setTeacherOptions] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch subjects
      const { data: subjectsData, success: subjectsSuccess } = await getSubjects()
      if (subjectsSuccess) {
        setSubjects(subjectsData)
      }

      // Fetch teachers for dropdown
      const { data: teachersData, success: teachersSuccess } = await getTeachers()
      if (teachersSuccess) {
        setTeacherOptions(
          teachersData.map((teacher) => ({
            label: teacher.profiles.full_name,
            value: teacher.id,
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      Alert.alert("Error", "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // Add this function after the fetchData function
  const handleOpenTeacher = (open) => {
    setOpenTeacher(open)
  }

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.teachers?.profiles?.full_name &&
        subject.teachers.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAddSubject = () => {
    setSelectedSubject(null)
    resetForm()
    setModalVisible(true)
  }

  const resetForm = () => {
    setSubjectName("")
    setSubjectCode("")
    setSubjectDescription("")
    setSelectedTeacher(null)
  }

  const handleUpdateSubject = (subject) => {
    setSelectedSubject(subject)
    setSubjectName(subject.name)
    setSubjectCode(subject.code)
    setSubjectDescription(subject.description || "")
    setSelectedTeacher(subject.teacher_id)
    setModalVisible(true)
  }

  const handleDeleteSubject = async (subject) => {
    Alert.alert("Confirm Delete", `Are you sure you want to delete subject ${subject.name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { success, error } = await deleteSubject(subject.id)
            if (!success) throw error
            Alert.alert("Success", "Subject deleted successfully")
            fetchData()
          } catch (error) {
            console.error("Error deleting subject:", error)
            Alert.alert("Error", "Failed to delete subject")
          }
        },
      },
    ])
  }

  const handleSubmit = async () => {
    if (!subjectName || !subjectCode || !selectedTeacher) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      if (selectedSubject) {
        // Update existing subject
        const { success, error } = await updateSubject(selectedSubject.id, {
          name: subjectName,
          code: subjectCode,
          description: subjectDescription,
          teacherId: selectedTeacher,
        })

        if (!success) throw error
      } else {
        // Create new subject
        const { success, error } = await createSubject({
          name: subjectName,
          code: subjectCode,
          description: subjectDescription,
          teacherId: selectedTeacher,
        })

        if (!success) throw error
      }

      Alert.alert("Success", `Subject ${selectedSubject ? "updated" : "created"} successfully`)
      resetForm()
      setModalVisible(false)
      setSelectedSubject(null)
      fetchData()
    } catch (error) {
      console.error("Error creating/updating subject:", error)
      Alert.alert("Error", error.message || `Failed to ${selectedSubject ? "update" : "create"} subject`)
    } finally {
      setLoading(false)
    }
  }

  const renderSubjectItem = ({ item }) => {
    const teacherName = item.teachers?.profiles?.full_name || "Not Assigned"

    return (
      <TouchableOpacity
        style={[styles.subjectCard, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}
        onLongPress={() => {
          setSelectedSubject(item)
          setMenuVisible(true)
        }}
      >
        <View style={styles.subjectInfo}>
          <Text style={[styles.subjectName, { color: isDarkMode ? "#fff" : "#333" }]}>{item.name}</Text>
          <Text style={[styles.subjectCode, { color: isDarkMode ? "#ccc" : "#666" }]}>Code: {item.code}</Text>
          <Text style={[styles.subjectTeacher, { color: isDarkMode ? "#ccc" : "#666" }]}>Teacher: {teacherName}</Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            setSelectedSubject(item)
            setMenuVisible(true)
          }}
        >
          <MaterialIcons name="more-vert" size={24} color={isDarkMode ? "#ccc" : "#666"} />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  if (loading && subjects.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" }, styles.loadingContainer]}
      >
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={{ color: isDarkMode ? "#fff" : "#333", marginTop: 10 }}>Loading subjects...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
          <Ionicons name="search" size={20} color={isDarkMode ? "#ccc" : "#666"} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? "#fff" : "#333" }]}
            placeholder="Search by name, code, or teacher"
            placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={isDarkMode ? "#ccc" : "#666"} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={[styles.addButton, { backgroundColor: "#8B0000" }]} onPress={handleAddSubject}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {filteredSubjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: isDarkMode ? "#fff" : "#333" }}>No subjects found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSubjects}
          renderItem={renderSubjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Add New Subject</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#fff" : "#333"} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Subject Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#333",
                },
              ]}
              placeholder="Enter subject name"
              placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
              value={subjectName}
              onChangeText={setSubjectName}
            />

            <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Subject Code</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#333",
                },
              ]}
              placeholder="Enter subject code"
              placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
              value={subjectCode}
              onChangeText={setSubjectCode}
            />

            <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Description (Optional)</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#333",
                },
              ]}
              placeholder="Enter description"
              placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
              value={subjectDescription}
              onChangeText={setSubjectDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Assigned Teacher</Text>
            <View style={{ zIndex: 1000 }}>
              <DropDownPicker
                open={openTeacher}
                value={selectedTeacher}
                items={teacherOptions}
                setOpen={handleOpenTeacher}
                setValue={setSelectedTeacher}
                setItems={setTeacherOptions}
                placeholder="Select teacher"
                style={{
                  backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                  borderColor: isDarkMode ? "#555" : "#ddd",
                  minHeight: 50,
                  borderRadius: 8,
                }}
                textStyle={{
                  color: isDarkMode ? "#fff" : "#333",
                  fontSize: 16,
                }}
                dropDownContainerStyle={{
                  backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                  borderColor: isDarkMode ? "#555" : "#ddd",
                  borderRadius: 8,
                  maxHeight: 150,
                }}
                listItemLabelStyle={{
                  color: isDarkMode ? "#fff" : "#333",
                  fontSize: 16,
                }}
                placeholderStyle={{
                  color: isDarkMode ? "#aaa" : "#999",
                  fontSize: 16,
                }}
                zIndex={1000}
                zIndexInverse={1000}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                maxHeight={150}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: "#8B0000" }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? "Creating Subject..." : "Create Subject"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subjectCode: {
    fontSize: 14,
    marginBottom: 2,
  },
  subjectTeacher: {
    fontSize: 14,
  },
  moreButton: {
    padding: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
