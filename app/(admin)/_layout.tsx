import { Stack } from 'expo-router'
import React from 'react'

const AdminLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Panel Admin',
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}

export default AdminLayout