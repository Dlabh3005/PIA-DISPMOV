import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

const ProfileScreen = () => {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+34 666 123 456',
    vehicle: 'Toyota Corolla 2020',
  })

  const handleLogout = () => {
    // TODO: Implementar lógica de logout
    router.push('/')
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
          <Text className="text-white text-3xl">👤</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-800">{profile.name}</Text>
      </View>

      <View className="bg-gray-100 p-4 rounded-lg mb-6">
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Correo Electrónico</Text>
          {isEditing ? (
            <TextInput
              value={profile.email}
              onChangeText={(text) => setProfile({ ...profile, email: text })}
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              placeholderTextColor="#999"
            />
          ) : (
            <Text className="text-gray-600">{profile.email}</Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Teléfono</Text>
          {isEditing ? (
            <TextInput
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              placeholderTextColor="#999"
            />
          ) : (
            <Text className="text-gray-600">{profile.phone}</Text>
          )}
        </View>

        <View>
          <Text className="text-gray-700 font-semibold mb-2">Vehículo</Text>
          {isEditing ? (
            <TextInput
              value={profile.vehicle}
              onChangeText={(text) => setProfile({ ...profile, vehicle: text })}
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              placeholderTextColor="#999"
            />
          ) : (
            <Text className="text-gray-600">{profile.vehicle}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setIsEditing(!isEditing)}
        className={`py-3 rounded-lg mb-3 ${isEditing ? 'bg-green-500' : 'bg-blue-500'}`}
      >
        <Text className="text-white text-center font-semibold">
          {isEditing ? 'Guardar cambios' : 'Editar perfil'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 py-3 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default ProfileScreen
