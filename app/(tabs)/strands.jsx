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
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/theme-context"
import { getStrands, createStrand, updateStrand, deleteStrand } from "../../lib/supabase"

export default function Strands() {
  const { isDarkMode, theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentStrandId, setCurrentStrandId] = useState(null)
  const [strands, setStrands] = useState([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedStrand, setSelectedStrand] = useState(null)
  const [menuVisible, setMenuVisible] = useState(false)

  useEffect(() => {
    fetchStrands()
  }, [])

  const fetchStrands = async () => {
    setLoading(true)
    try {
      const { data, success } = await getStrands()
      if (success) {
        setStrands(data)
      } else {
        Alert.alert("Error", "Failed to load strands")
      }
    } catch (error) {
      console.error("Error fetching strands:", error)
      Alert.alert("Error", "Failed to load strands")
    } finally {
      setLoading(false)
    }
  }

  const filteredStrands = strands.filter(
    (strand) =>
      strand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (strand.description && strand.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAddStrand = () => {
    resetForm()
    setEditMode(false)
    setCurrentStrandId(null)
    setModalVisible(true)
  }

  const handleEditStrand = (strand) => {
    setName(strand.name)
    setDescription(strand.description || "")
    setEditMode(true)
    setCurrentStrandId(strand.id)
    setModalVisible(true)
  }

  const handleDeleteStrand = async () => {
    setMenuVisible(false)
    if (selectedStrand) {
      Alert.alert(
        "Confirm Delete",
        `Are you sure you want to delete strand ${selectedStrand.name}?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const { success, error } = await deleteStrand(selectedStrand.id)
                if (!success) throw error
                Alert.alert("Success", "Strand deleted successfully")
                fetchStrands()
              } catch (error) {
                console.error("Error deleting strand:", error)
                Alert.alert("Error", "Failed to delete strand")
              }
            }
          }
        ]
      )
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setSelectedStrand(null)
  }

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert("Error", "Please enter a strand name")
      return
    }

    setLoading(true)
    try {
      if (editMode) {
        const { success, error } = await updateStrand(currentStrandId, {
          name,
          description,
        })

        if (!success) throw error
        Alert.alert("Success", "Strand updated successfully")
      } else {
        const { success, error } = await createStrand({
          name,
          description,
        })

        if (!success) throw error
        Alert.alert("Success", "Strand created successfully")
      }

      resetForm()
      setModalVisible(false)
      fetchStrands() // Refresh data
    } catch (error) {
      console.error("Error saving strand:", error)
      Alert.alert("Error", error.message || "Failed to save strand")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStrand = () => {
    setMenuVisible(false)
    if (selectedStrand) {
      setName(selectedStrand.name)
      setDescription(selectedStrand.description || "")
      setEditMode(true)
      setCurrentStrandId(selectedStrand.id)
      setModalVisible(true)
    }
  }

  const renderStrandItem = ({ item }) => {
    return (
      <View style={[styles.strandCard, { backgroundColor: isDarkMode ? theme.cardBackground : "#fff" }]}>
        <View style={styles.strandInfo}>
          <Text style={[styles.strandName, { color: isDarkMode ? "#fff" : "#000" }]}>{item.name}</Text>
          {item.description && (
            <Text style={[styles.strandDescription, { color: isDarkMode ? "#ccc" : "#666" }]}>{item.description}</Text>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={() => {
            setSelectedStrand(item)
            setMenuVisible(true)
          }}>
            <Ionicons name="pencil" size={20} color={isDarkMode ? "#ccc" : "#666"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteStrand}>
            <Ionicons name="trash" size={20} color={isDarkMode ? "#ccc" : "#666"} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading && strands.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: isDarkMode ? theme.background : "#f5f5f5" }, styles.loadingContainer]}
      >
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={{ color: isDarkMode ? "#fff" : "#333", marginTop: 10 }}>Loading strands...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : "#f5f5f5" }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
          <Ionicons name="search" size={20} color={isDarkMode ? "#ccc" : "#666"} />
          <TextInput
            style={[styles.searchInput, { color: isDarkMode ? "#fff" : "#333" }]}
            placeholder="Search strands"
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

        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={handleAddStrand}>
          <Text style={styles.addButtonText}>Add Strand</Text>
        </TouchableOpacity>
      </View>

      {filteredStrands.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: isDarkMode ? "#fff" : "#333" }}>No strands found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStrands}
          renderItem={renderStrandItem}
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
          <View style={[styles.modalView, { backgroundColor: isDarkMode ? theme.cardBackground : "#fff" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? "#fff" : "#000" }]}>
                {editMode ? "Edit Strand" : "Add New Strand"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Strand Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#000",
                },
              ]}
              placeholder="Enter strand name"
              placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.inputLabel, { color: isDarkMode ? "#ccc" : "#666" }]}>Description (Optional)</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#000",
                },
              ]}
              placeholder="Enter description"
              placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Saving..." : editMode ? "Update Strand" : "Create Strand"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              styles.menuContent,
              { backgroundColor: isDarkMode ? theme.cardBackground : "#fff" }
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleUpdateStrand}
            >
              <Text style={[styles.menuItemText, { color: isDarkMode ? "#fff" : "#000" }]}>
                Edit
              </Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: isDarkMode ? "#444" : "#eee" }]} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteStrand}
            >
              <Text style={[styles.menuItemText, { color: "#ff4444" }]}>
                Delete
              </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
  strandCard: {
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
  strandInfo: {
    flex: 1,
  },
  strandName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  strandDescription: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
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
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    width: 200,
    borderRadius: 8,
    padding: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
})
