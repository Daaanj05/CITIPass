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
  ScrollView,
  Alert,
  Image,
} from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../../context/theme-context"
import DropDownPicker from "react-native-dropdown-picker"
import {
  createStudent,
  createTeacher,
  getStudents,
  getTeachers,
  getSections,
  getStrands,
  updateTeacher,
  deleteTeacher,
  deleteStudent,
  updateStudent,
} from "../../lib/supabase"

export default function Accounts() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState("students")
  const [searchQuery, setSearchQuery] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [accountType, setAccountType] = useState("")
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [sections, setSections] = useState([])

  // Form states
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [id, setId] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [department, setDepartment] = useState("")
  const [position, setPosition] = useState("")

  // Dropdown states
  const [openSection, setOpenSection] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [sectionOptions, setSectionOptions] = useState([])

  // New dropdown states for student form
  const [openStrand, setOpenStrand] = useState(false)
  const [selectedStrand, setSelectedStrand] = useState(null)
  const [strandOptions, setStrandOptions] = useState([])

  const [openGradeLevel, setOpenGradeLevel] = useState(false)
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(null)
  const [gradeLevelOptions, setGradeLevelOptions] = useState([
    { label: "Grade 11", value: "Grade 11" },
    { label: "Grade 12", value: "Grade 12" },
  ])

  const [selectedAccount, setSelectedAccount] = useState(null)
  const [menuVisible, setMenuVisible] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch students
      const { data: studentsData, success: studentsSuccess } = await getStudents()
      if (studentsSuccess) {
        setStudents(studentsData)
      }

      // Fetch teachers
      const { data: teachersData, success: teachersSuccess } = await getTeachers()
      if (teachersSuccess) {
        setTeachers(teachersData)
      }

      // Fetch sections for dropdown
      const { data: sectionsData, success: sectionsSuccess } = await getSections()
      if (sectionsSuccess) {
        setSections(sectionsData)
        setSectionOptions(
          sectionsData.map((section) => ({
            label: section.name,
            value: section.id,
          })),
        )
      }

      // Fetch strands for dropdown
      console.log("Fetching strands...")
      const { data: strandsData, success: strandsSuccess, error: strandsError } = await getStrands()
      console.log("Strands response:", { strandsData, strandsSuccess, strandsError })
      if (strandsSuccess && Array.isArray(strandsData)) {
        console.log("Setting strand options:", strandsData)
        setStrandOptions(
          strandsData.map((strand) => ({
            label: strand.name || "Unnamed Strand",
            value: strand.id,
          })),
        )
      } else {
        console.error("Failed to fetch strands:", strandsError)
        setStrandOptions([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      Alert.alert("Error", "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const closeAllDropdowns = () => {
    setOpenSection(false)
    setOpenStrand(false)
    setOpenGradeLevel(false)
  }

  const handleOpenSection = (open) => {
    if (open) closeAllDropdowns()
    setOpenSection(open)
  }

  const handleOpenStrand = (open) => {
    if (open) closeAllDropdowns()
    setOpenStrand(open)
  }

  const handleOpenGradeLevel = (open) => {
    if (open) closeAllDropdowns()
    setOpenGradeLevel(open)
  }

  const filteredData =
    activeTab === "students"
      ? students.filter(
          (student) =>
            `${student.profiles.first_name} ${student.profiles.last_name}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) || student.student_id.includes(searchQuery),
        )
      : teachers.filter(
          (teacher) =>
            `${teacher.profiles.first_name} ${teacher.profiles.last_name}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) || teacher.teacher_id.includes(searchQuery),
        )

  const handleAddAccount = () => {
    // Clear any selected account when adding new
    setSelectedAccount(null)
    setAccountType(activeTab === "students" ? "Student" : "Teacher")
    resetForm()
    setModalVisible(true)
  }

  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setId("")
    setEmail("")
    setPassword("")
    setSelectedSection(null)
    setSelectedStrand(null)
    setSelectedGradeLevel(null)
    setDepartment("")
    setPosition("")
  }

  const handleMenuPress = (item) => {
    setSelectedAccount(item)
    setMenuVisible(true)
  }

  const handleUpdateAccount = () => {
    setMenuVisible(false)
    if (selectedAccount) {
      setAccountType(activeTab === "students" ? "Student" : "Teacher")
      setFirstName(selectedAccount.profiles.first_name)
      setLastName(selectedAccount.profiles.last_name)
      setId(activeTab === "students" ? selectedAccount.student_id : selectedAccount.teacher_id)
      setEmail(selectedAccount.profiles.email)

      if (activeTab === "students") {
        setSelectedStrand(selectedAccount.strand_id)
        setSelectedGradeLevel(selectedAccount.year_level)
        setSelectedSection(selectedAccount.section_id)
      } else {
        setDepartment(selectedAccount.department)
        setPosition(selectedAccount.position)
      }
      setModalVisible(true)
    }
  }

  const handleDeleteAccount = async () => {
    setMenuVisible(false)
    if (selectedAccount) {
      Alert.alert(
        "Confirm Delete",
        `Are you sure you want to delete ${selectedAccount.profiles.first_name} ${selectedAccount.profiles.last_name}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                if (activeTab === "teachers") {
                  const { success, error } = await deleteTeacher(selectedAccount.id)
                  if (!success) throw error
                } else {
                  const { success, error } = await deleteStudent(selectedAccount.id)
                  if (!success) throw error
                }
                Alert.alert("Success", "Account deleted successfully")
                fetchData()
              } catch (error) {
                console.error("Error deleting account:", error)
                Alert.alert("Error", "Failed to delete account")
              }
            },
          },
        ],
      )
    }
  }

  const handleSubmit = async () => {
    if (!firstName || !lastName || !id || !email) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    // Only require password for new accounts
    if (!selectedAccount && !password) {
      Alert.alert("Error", "Please enter a password for the new account")
      return
    }

    if (accountType === "Student") {
      if (!selectedSection) {
        Alert.alert("Error", "Please select a section")
        return
      }

      if (!selectedStrand) {
        Alert.alert("Error", "Please select a strand")
        return
      }

      if (!selectedGradeLevel) {
        Alert.alert("Error", "Please select a grade level")
        return
      }
    }

    setLoading(true)
    try {
      if (accountType === "Student") {
        if (selectedAccount) {
          // Update existing student
          const { success, error } = await updateStudent(selectedAccount.id, {
            first_name: firstName,
            last_name: lastName,
            id,
            email,
            strandId: selectedStrand,
            yearLevel: selectedGradeLevel,
            sectionId: selectedSection,
          })

          if (!success) throw error
          Alert.alert("Success", "Student account updated successfully")
        } else {
          // Create new student
          const selectedStrandName = strandOptions.find((option) => option.value === selectedStrand)?.label || ""

          const { success, error } = await createStudent(email, password, {
            first_name: firstName,
            last_name: lastName,
            id,
            strandId: selectedStrand,
            strand: selectedStrandName,
            yearLevel: selectedGradeLevel,
            sectionId: selectedSection,
          })

          if (!success) throw error
          Alert.alert("Success", "New student account created successfully")
        }
      } else {
        if (selectedAccount) {
          // Update existing teacher
          const { success, error } = await updateTeacher(selectedAccount.id, {
            first_name: firstName,
            last_name: lastName,
            id,
            email,
            department,
            position,
          })

          if (!success) throw error
          Alert.alert("Success", "Teacher account updated successfully")
        } else {
          // Create new teacher
          const { success, error } = await createTeacher(email, password, {
            first_name: firstName,
            last_name: lastName,
            id,
            email,
            department,
            position,
          })

          if (!success) throw error
          Alert.alert("Success", "New teacher account created successfully")
        }
      }

      resetForm()
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error("Error creating/updating account:", error)
      Alert.alert(
        "Error",
        error.message || `Failed to ${selectedAccount ? "update" : "create"} ${accountType.toLowerCase()} account`,
      )
    } finally {
      setLoading(false)
    }
  }

  const renderAccountItem = ({ item }) => {
    const isStudentTab = activeTab === "students"
    const displayName = `${item.profiles.first_name} ${item.profiles.last_name}`
    const displayId = isStudentTab ? item.student_id : item.teacher_id
    const displaySection = isStudentTab
      ? item.sections
        ? item.sections.name
        : "No Section"
      : item.department || "No Department"

    return (
      <TouchableOpacity style={[styles.accountCard, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
        <View style={styles.accountInfo}>
          <View style={[styles.avatarContainer, { marginRight: 16 }]}>
            {item.profiles.avatar_url ? (
              <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: isDarkMode ? "#fff" : "#333" }]}>
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            )}
          </View>
          <View style={styles.accountDetails}>
            <Text style={[styles.accountName, { color: isDarkMode ? "#fff" : "#333" }]}>{displayName}</Text>
            <Text style={[styles.accountId, { color: isDarkMode ? "#ccc" : "#666" }]}>ID: {displayId}</Text>
            <Text style={[styles.accountSection, { color: isDarkMode ? "#ccc" : "#666" }]}>
              {isStudentTab ? "Section: " : "Department: "}
              {displaySection}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => handleMenuPress(item)}>
          <MaterialIcons name="more-vert" size={24} color={isDarkMode ? "#ccc" : "#666"} />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" }]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "students" && [styles.activeTab, { backgroundColor: "#8B0000" }]]}
          onPress={() => setActiveTab("students")}
        >
          <Text style={[styles.tabText, activeTab === "students" && styles.activeTabText]}>Students</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "teachers" && [styles.activeTab, { backgroundColor: "#8B0000" }]]}
          onPress={() => setActiveTab("teachers")}
        >
          <Text style={[styles.tabText, activeTab === "teachers" && styles.activeTabText]}>Teachers</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
          <Ionicons name="search" size={20} color={isDarkMode ? "#ccc" : "#666"} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? "#fff" : "#333" }]}
            placeholder="Search by name or ID"
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

        <TouchableOpacity style={[styles.addButton, { backgroundColor: "#8B0000" }]} onPress={handleAddAccount}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading && filteredData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={{ color: isDarkMode ? "#fff" : "#333" }}>Loading...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: isDarkMode ? "#fff" : "#333" }}>No {activeTab} found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderAccountItem}
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
              <Text style={[styles.modalTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Add New {accountType}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#fff" : "#333"} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.formScrollContainer}
              contentContainerStyle={styles.formContentContainer}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>First Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#333",
                  },
                ]}
                placeholder="Enter first name"
                placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
                value={firstName}
                onChangeText={setFirstName}
              />

              <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Last Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#333",
                  },
                ]}
                placeholder="Enter last name"
                placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
                value={lastName}
                onChangeText={setLastName}
              />

              <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>
                {accountType === "Student" ? "Student ID" : "Employee ID"}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#333",
                  },
                ]}
                placeholder={`Enter ${accountType === "Student" ? "student" : "employee"} ID`}
                placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
                value={id}
                onChangeText={setId}
              />

              <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#333",
                  },
                ]}
                placeholder="Enter email address"
                placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#333",
                  },
                ]}
                placeholder="Enter password"
                placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {accountType === "Student" ? (
                <>
                  {/* Strand Dropdown */}
                  <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Strand</Text>
                  <View style={{ zIndex: 5000, marginBottom: 20, elevation: 5 }}>
                    <DropDownPicker
                      open={openStrand}
                      value={selectedStrand}
                      items={strandOptions}
                      setOpen={handleOpenStrand}
                      setValue={setSelectedStrand}
                      setItems={setStrandOptions}
                      placeholder="Select strand"
                      style={{
                        backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                        borderColor: isDarkMode ? "#555" : "#ddd",
                      }}
                      textStyle={{
                        color: isDarkMode ? "#fff" : "#333",
                      }}
                      dropDownContainerStyle={{
                        backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                        borderColor: isDarkMode ? "#555" : "#ddd",
                        elevation: 5,
                        maxHeight: 150,
                      }}
                      zIndex={5000}
                      zIndexInverse={1000}
                      listMode="SCROLLVIEW"
                      scrollViewProps={{
                        nestedScrollEnabled: true,
                      }}
                      maxHeight={150}
                    />
                  </View>

                  {/* Grade Level Dropdown */}
                  <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Grade Level</Text>
                  <View style={{ zIndex: 4000, marginBottom: 20, elevation: 4 }}>
                    <DropDownPicker
                      open={openGradeLevel}
                      value={selectedGradeLevel}
                      items={gradeLevelOptions}
                      setOpen={handleOpenGradeLevel}
                      setValue={setSelectedGradeLevel}
                      setItems={setGradeLevelOptions}
                      placeholder="Select grade level"
                      style={{
                        backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                        borderColor: isDarkMode ? "#555" : "#ddd",
                      }}
                      textStyle={{
                        color: isDarkMode ? "#fff" : "#333",
                      }}
                      dropDownContainerStyle={{
                        backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                        borderColor: isDarkMode ? "#555" : "#ddd",
                        elevation: 5,
                        maxHeight: 150,
                      }}
                      zIndex={4000}
                      zIndexInverse={2000}
                      listMode="SCROLLVIEW"
                      scrollViewProps={{
                        nestedScrollEnabled: true,
                      }}
                      maxHeight={150}
                    />
                  </View>

                  {/* Section Dropdown */}
                  <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Section</Text>
                  <View style={{ zIndex: 3000, marginBottom: 20, elevation: 3 }}>
                    <DropDownPicker
                      open={openSection}
                      value={selectedSection}
                      items={sectionOptions}
                      setOpen={handleOpenSection}
                      setValue={setSelectedSection}
                      setItems={setSectionOptions}
                      placeholder="Select section"
                      style={{
                        backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                        borderColor: isDarkMode ? "#555" : "#ddd",
                      }}
                      textStyle={{
                        color: isDarkMode ? "#fff" : "#333",
                      }}
                      dropDownContainerStyle={{
                        backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                        borderColor: isDarkMode ? "#555" : "#ddd",
                        elevation: 5,
                        maxHeight: 150,
                      }}
                      zIndex={3000}
                      zIndexInverse={3000}
                      listMode="SCROLLVIEW"
                      scrollViewProps={{
                        nestedScrollEnabled: true,
                      }}
                      maxHeight={150}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Department</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                        color: isDarkMode ? "#fff" : "#333",
                      },
                    ]}
                    placeholder="Enter department"
                    placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
                    value={department}
                    onChangeText={setDepartment}
                  />

                  <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Position</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                        color: isDarkMode ? "#fff" : "#333",
                      },
                    ]}
                    placeholder="Enter position"
                    placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
                    value={position}
                    onChangeText={setPosition}
                  />
                </>
              )}

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: "#8B0000" }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menu, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleUpdateAccount}>
              <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Edit</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: isDarkMode ? "#444" : "#eee" }]} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
              <Text style={[styles.menuItemText, { color: "#ff4444" }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  // Keep existing styles and add these new ones
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 14,
  },
  // Keep all the existing styles...
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  activeTab: {
    backgroundColor: "#8B0000",
  },
  tabText: {
    fontWeight: "500",
    color: "#333",
  },
  activeTabText: {
    color: "white",
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
  accountCard: {
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
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  accountDetails: {
    flex: 1,
    marginLeft: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  accountId: {
    fontSize: 14,
    marginBottom: 2,
  },
  accountSection: {
    fontSize: 14,
  },
  moreButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
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
    zIndex: 1001,
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
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  formScrollContainer: {
    width: "100%",
  },
  formContentContainer: {
    paddingBottom: 20,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
})
