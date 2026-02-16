import { useRouter } from 'expo-router'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

const AdminScreen = () => {
  const router = useRouter()

  const menuItems = [
    { label: 'Usuarios', icon: '👥' },
    { label: 'Servicios', icon: '🔧' },
    { label: 'Citas', icon: '📅' },
    { label: 'Reportes', icon: '📊' },
  ]

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</Text>

      <View className="gap-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-gray-100 p-4 rounded-lg flex-row items-center"
          >
            <Text className="text-3xl mr-4">{item.icon}</Text>
            <Text className="text-lg font-semibold text-gray-800 flex-1">{item.label}</Text>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => router.push('/')}
        className="mt-8 bg-red-500 py-3 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default AdminScreen