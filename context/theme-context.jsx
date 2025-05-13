"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

const ThemeContext = createContext()

const lightTheme = {
  background: "#f5f5f5",
  cardBackground: "#fff",
  text: "#000",
  textSecondary: "#666",
  border: "#eee",
  primary: "#8B0000",
  error: "#dc3545",
  success: "#28a745",
}

const darkTheme = {
  background: "#121212",
  cardBackground: "#1e1e1e",
  text: "#fff",
  textSecondary: "#ccc",
  border: "#333",
  primary: "#8B0000",
  error: "#dc3545",
  success: "#28a745",
}

export function ThemeProvider({ children }) {
  const deviceTheme = useColorScheme()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isThemeLoaded, setIsThemeLoaded] = useState(false)

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme")
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark")
        } else {
          // Use device theme as default if no saved preference
          setIsDarkMode(deviceTheme === "dark")
        }
        setIsThemeLoaded(true)
      } catch (error) {
        console.error("Failed to load theme preference:", error)
        setIsThemeLoaded(true)
      }
    }

    loadTheme()
  }, [deviceTheme])

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode
      setIsDarkMode(newTheme)
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light")
    } catch (error) {
      console.error("Failed to save theme preference:", error)
    }
  }

  const theme = isDarkMode ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isThemeLoaded, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
