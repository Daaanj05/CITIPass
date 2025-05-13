"use client"

import { Stack } from "expo-router"
import { ThemeProvider } from "../context/theme-context"
import { DrawerProvider } from "../context/drawer-context"
import { StatusBar } from "react-native"

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DrawerProvider>
        <StatusBar backgroundColor="#8B0000" barStyle="light-content" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#fff" },
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </DrawerProvider>
    </ThemeProvider>
  )
}
