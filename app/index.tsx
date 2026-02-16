import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const HomeScreen = () => {
  const router = useRouter()

  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      <Text className="text-3xl font-bold mb-8 text-gray-800">FixMyCar</Text>
      
      <TouchableOpacity
        onPress={() => router.push('/(auth)/login')}
        className="w-full bg-blue-500 py-3 rounded-lg mb-4"
      >
        <Text className="text-white text-center font-semibold">Iniciar Sesión</Text>
      </TouchableOpacity>

      <View className="flex-row gap-4 mt-8">
        <TouchableOpacity
          onPress={() => router.push('/(user)')}
          className="flex-1 bg-gray-200 py-3 rounded-lg"
        >
          <Text className="text-gray-800 text-center font-semibold">Usuario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(admin)')}
          className="flex-1 bg-gray-200 py-3 rounded-lg"
        >
          <Text className="text-gray-800 text-center font-semibold">Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default HomeScreen