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
  ScrollView,
} from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../../context/theme-context"
import DropDownPicker from "react-native-dropdown-picker"
import {
  getSections,
  createSection,
  getGradeLevels,
  getAcademicYears,
  getTeachers,
  updateSection,
  deleteSection,
} from "../../lib/supabase"

export default function Sections() {
  const { isDarkMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [sectionName, setSectionName] = useState("")
  const [roomNumber, setRoomNumber] = useState("")

  // Dropdown states
  const [openGradeLevel, setOpenGradeLevel] = useState(false)
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(null)
  const [gradeLevelOptions, setGradeLevelOptions] = useState([])

  const [openAcademicYear, setOpenAcademicYear] = useState(false)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null)
  const [academicYearOptions, setAcademicYearOptions] = useState([])

  // Add advisor dropdown states
  const [openAdvisor, setOpenAdvisor] = useState(false)
  const [selectedAdvisor, setSelectedAdvisor] = useState(null)
  const [advisorOptions, setAdvisorOptions] = useState([])

  const [selectedSection, setSelectedSection] = useState(null)
  const [menuVisible, setMenuVisible] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch sections
      const { data: sectionsData, success: sectionsSuccess } = await getSections()
      if (sectionsSuccess) {
        setSections(sectionsData)
      }

      // Fetch grade levels
      const { data: gradeLevelsData, success: gradeLevelsSuccess } = await getGradeLevels()
      if (gradeLevelsSuccess) {
        setGradeLevelOptions(
          gradeLevelsData.map((level) => ({
            label: level.name,
            value: level.id,
          })),
        )
      }

      // Fetch academic years
      const { data: academicYearsData, success: academicYearsSuccess } = await getAcademicYears()
      if (academicYearsSuccess) {
        setAcademicYearOptions(
          academicYearsData.map((year) => ({
            label: year.name,
            value: year.id,
          })),
        )
      }

      // Fetch teachers for advisor selection
      const { data: teachersData, success: teachersSuccess } = await getTeachers()
      if (teachersSuccess) {
        setAdvisorOptions(
          teachersData.map((teacher) => ({
            label: `${teacher.profiles.first_name} ${teacher.profiles.last_name}`,
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

  // Add these functions after the fetchData function
  const closeAllDropdowns = () => {
    setOpenGradeLevel(false)
    setOpenAcademicYear(false)
    setOpenAdvisor(false)
  }

  const handleOpenGradeLevel = (open) => {
    if (open) closeAllDropdowns()
    setOpenGradeLevel(open)
  }

  const handleOpenAcademicYear = (open) => {
    if (open) closeAllDropdowns()
    setOpenAcademicYear(open)
  }

  const handleOpenAdvisor = (open) => {
    if (open) closeAllDropdowns()
    setOpenAdvisor(open)
  }

  const filteredSections = sections.filter(
    (section) =>
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.grade_levels?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddSection = () => {
    resetForm()
    setModalVisible(true)
  }

  const resetForm = () => {
    setSectionName("")
    setRoomNumber("")
    setSelectedGradeLevel(null)
    setSelectedAcademicYear(null)
    setSelectedAdvisor(null)
    setSelectedSection(null)
  }

  const handleUpdateSection = () => {
    setMenuVisible(false)
    if (selectedSection) {
      setSectionName(selectedSection.name)
      setSelectedGradeLevel(selectedSection.grade_level_id)
      setSelectedAcademicYear(selectedSection.academic_year_id)
      setRoomNumber(selectedSection.room_number)
      setSelectedAdvisor(selectedSection.advisor_id)
      setModalVisible(true)
    }
  }

  const handleDeleteSection = async () => {
    setMenuVisible(false)
    if (selectedSection) {
      Alert.alert("Confirm Delete", `Are you sure you want to delete section ${selectedSection.name}?`, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { success, error } = await deleteSection(selectedSection.id)
              if (!success) throw error
              Alert.alert("Success", "Section deleted successfully")
              fetchData()
            } catch (error) {
              console.error("Error deleting section:", error)
              Alert.alert("Error", "Failed to delete section")
            }
          },
        },
      ])
    }
  }

  const handleSubmit = async () => {
    if (!sectionName || !selectedGradeLevel || !selectedAcademicYear || !roomNumber) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      if (selectedSection) {
        // Update existing section
        const { success, error } = await updateSection(selectedSection.id, {
          name: sectionName,
          gradeLevelId: selectedGradeLevel,
          academicYearId: selectedAcademicYear,
          roomNumber,
          advisorId: selectedAdvisor,
        })

        if (!success) throw error
      } else {
        // Create new section
        const { success, error } = await createSection({
          name: sectionName,
          gradeLevelId: selectedGradeLevel,
          academicYearId: selectedAcademicYear,
          roomNumber,
          advisorId: selectedAdvisor,
        })

        if (!success) throw error
      }

      Alert.alert("Success", `Section ${selectedSection ? "updated" : "created"} successfully`)
      resetForm()
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error("Error creating/updating section:", error)
      Alert.alert("Error", error.message || `Failed to ${selectedSection ? "update" : "create"} section`)
    } finally {
      setLoading(false)
    }
  }

  const renderSectionItem = ({ item }) => {
    return (
      <TouchableOpacity style={[styles.sectionCard, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
        <View style={styles.sectionInfo}>
          <Text style={[styles.sectionName, { color: isDarkMode ? "#fff" : "#333" }]}>{item.name}</Text>
          <Text style={[styles.sectionDetails, { color: isDarkMode ? "#ccc" : "#666" }]}>
            {item.grade_levels?.name} • {item.academic_years?.name}
          </Text>
          <Text style={[styles.sectionDetails, { color: isDarkMode ? "#ccc" : "#666" }]}>
            Advisor:{" "}
            {item.teachers?.profiles
              ? `${item.teachers.profiles.first_name} ${item.teachers.profiles.last_name}`
              : "Not assigned"}
          </Text>
          {item.room_number && (
            <Text style={[styles.sectionRoom, { color: isDarkMode ? "#ccc" : "#666" }]}>Room: {item.room_number}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            setSelectedSection(item)
            setMenuVisible(true)
          }}
        >
          <MaterialIcons name="more-vert" size={24} color={isDarkMode ? "#ccc" : "#666"} />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  if (loading && sections.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" }, styles.loadingContainer]}
      >
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={{ color: isDarkMode ? "#fff" : "#333", marginTop: 10 }}>Loading sections...</Text>
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
            placeholder="Search by name or grade level"
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

        <TouchableOpacity style={[styles.addButton, { backgroundColor: "#8B0000" }]} onPress={handleAddSection}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {filteredSections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: isDarkMode ? "#fff" : "#333" }}>No sections found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSections}
          renderItem={renderSectionItem}
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
              <Text style={[styles.modalTitle, { color: isDarkMode ? "#fff" : "#333" }]}>
                {selectedSection ? "Edit Section" : "Add New Section"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#fff" : "#333"} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.formScrollContainer}
              contentContainerStyle={styles.formContentContainer}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Section Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#333",
                  },
                ]}
                placeholder="Enter section name"
                placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
                value={sectionName}
                onChangeText={setSectionName}
              />

              <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Room Number</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#333",
                  },
                ]}
                placeholder="Enter room number"
                placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
                value={roomNumber}
                onChangeText={setRoomNumber}
                keyboardType="numeric"
              />

              <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Grade Level</Text>
              <View style={{ zIndex: 3000, marginBottom: 16 }}>
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
                    maxHeight: 150,
                  }}
                  zIndex={3000}
                  zIndexInverse={1000}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                  maxHeight={150}
                />
              </View>

              <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Academic Year</Text>
              <View style={{ zIndex: 2000, marginBottom: 16 }}>
                <DropDownPicker
                  open={openAcademicYear}
                  value={selectedAcademicYear}
                  items={academicYearOptions}
                  setOpen={handleOpenAcademicYear}
                  setValue={setSelectedAcademicYear}
                  setItems={setAcademicYearOptions}
                  placeholder="Select academic year"
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
                    maxHeight: 150,
                  }}
                  zIndex={2000}
                  zIndexInverse={2000}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                  maxHeight={150}
                />
              </View>

              <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Advisor</Text>
              <View style={{ zIndex: 1000, marginBottom: 16 }}>
                <DropDownPicker
                  open={openAdvisor}
                  value={selectedAdvisor}
                  items={advisorOptions}
                  setOpen={handleOpenAdvisor}
                  setValue={setSelectedAdvisor}
                  setItems={setAdvisorOptions}
                  placeholder="Select advisor"
                  style={{
                    backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                    borderColor: isDarkMode ? "#555" : "#ddd",
                    minHeight: 50,
                  }}
                  textStyle={{
                    color: isDarkMode ? "#fff" : "#333",
                    fontSize: 16,
                  }}
                  dropDownContainerStyle={{
                    backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                    borderColor: isDarkMode ? "#555" : "#ddd",
                    maxHeight: 120,
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
                  zIndexInverse={3000}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{
                    persistentScrollbar: true,
                    showsVerticalScrollIndicator: true,
                  }}
                  maxHeight={120}
                  searchable={false}
                  itemSeparator={true}
                  itemSeparatorStyle={{
                    backgroundColor: isDarkMode ? "#444" : "#eee",
                    height: 1,
                  }}
                  autoScroll={true}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: "#8B0000" }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Saving..." : selectedSection ? "Update Section" : "Create Section"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menu, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleUpdateSection}>
              <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>Edit</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: isDarkMode ? "#444" : "#eee" }]} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteSection}>
              <Text style={[styles.menuItemText, { color: "#ff4444" }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  sectionCard: {
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
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  sectionRoom: {
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
    marginBottom: 4,
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
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
  formScrollContainer: {
    width: "100%",
  },
  formContentContainer: {
    paddingBottom: 20,
  },
})
