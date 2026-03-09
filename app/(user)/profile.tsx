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
  onPress={() => {
    router.replace('/login');
  }}
  className="mt-10 mb-10 bg-red-500 py-4 rounded-lg shadow-sm"
>
  <Text className="text-white text-center font-bold">
    Cerrar Sesión
  </Text>
</TouchableOpacity>
    </ScrollView>
  )
}

export default ProfileScreen

// React Native version of vehicle profile form

interface VehicleData {
  model: string
  year: string
  plate: string
  currentKm: number
  vin?: string
  color?: string
  fuelType?: string
  transmission?: string
}

interface VehicleProfileProps {
  vehicleData: VehicleData
  onSave: (data: VehicleData) => void
}

export const VehicleProfile: React.FC<VehicleProfileProps> = ({ vehicleData, onSave }) => {
  const [formData, setFormData] = useState<VehicleData>(vehicleData)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field: keyof VehicleData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    setIsSaving(true)
    setTimeout(() => {
      onSave(formData)
      setIsSaving(false)
    }, 500)
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Perfil del Vehículo</Text>
        <Text className="text-gray-600">Detalles técnicos de tu auto</Text>
      </View>

      {/* Section: Información básica */}
      <View className="bg-gray-100 rounded-lg p-4 mb-6">
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-1">Modelo *</Text>
            <TextInput
              value={formData.model}
              onChangeText={text => handleChange('model', text)}
              placeholder="Ej. Toyota Corolla"
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
            />
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Año *</Text>
              <TextInput
                value={formData.year}
                onChangeText={text => handleChange('year', text)}
                placeholder="2020"
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Placa *</Text>
              <TextInput
                value={formData.plate}
                onChangeText={text => handleChange('plate', text.toUpperCase())}
                placeholder="ABC-123"
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-1">Kilometraje Actual *</Text>
            <TextInput
              value={String(formData.currentKm)}
              onChangeText={text => handleChange('currentKm', parseInt(text) || 0)}
              placeholder="50000"
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              keyboardType="numeric"
            />
          </View>

          {/* Additional optional fields could be added similarly */}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSaving}
        className={`py-3 rounded-lg mb-3 ${isSaving ? 'bg-gray-400' : 'bg-blue-500'}`}
      >
        <Text className="text-white text-center font-semibold">
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
