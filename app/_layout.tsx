import { Stack } from 'expo-router'
import React from 'react'
import "../global.css"

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(user)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  )
}

export default RootLayout