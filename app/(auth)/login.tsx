import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

interface LoginProps {
  onLogin?: (username: string, isAdmin: boolean) => void
}

const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')

    if (!username.trim()) {
      setError('Por favor ingresa un nombre de usuario')
      return
    }

    if (!password.trim()) {
      setError('Por favor ingresa una contraseña')
      return
    }

    // Mock authentication - in production this would call an API
    if (password === 'demo' || password.length >= 4) {
      const isAdmin = password === 'admin'
      
      console.log('Login exitoso:', { username, isAdmin })
      
      // Callback si existe
      if (onLogin) {
        onLogin(username, isAdmin)
      }
      
      // Navegar según rol
      if (isAdmin) {
        router.push('/(admin)')
      } else {
        router.push('/(user)')
      }
    } else {
      setError('Contraseña debe tener al menos 4 caracteres')
    }
  }

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100">
      <View className="flex-1 justify-center p-6 min-h-screen">
        {/* Logo Section */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
            <Text className="text-5xl">🚗</Text>
          </View>
          <Text className="text-4xl font-bold text-gray-900 mb-2">Fix My Car</Text>
          <Text className="text-gray-600 text-center">Bitácora Inteligente de Mantenimiento</Text>
        </View>

        {/* Form Container */}
        <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Username Field */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">👤 Usuario</Text>
            <TextInput
              placeholder="Ingresa tu usuario"
              value={username}
              onChangeText={setUsername}
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              placeholderTextColor="#999"
            />
          </View>

          {/* Password Field */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">🔒 Contraseña</Text>
            <TextInput
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              placeholderTextColor="#999"
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-blue-600 py-3 rounded-lg mb-4"
          >
            <Text className="text-white text-center font-semibold text-base">Iniciar Sesión</Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-600 text-center font-semibold">Volver</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Info Section */}
        <View className="gap-3">
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text className="text-blue-800 font-semibold text-center mb-1">👤 Usuario Normal</Text>
            <Text className="text-blue-700 text-center text-xs">Usuario: cualquiera / Contraseña: demo</Text>
          </View>

          <View className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <Text className="text-purple-800 font-semibold text-center mb-1">🛡️ Administrador</Text>
            <Text className="text-purple-700 text-center text-xs">Usuario: cualquiera / Contraseña: admin</Text>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-8 pt-6 border-t border-gray-300">
          <Text className="text-gray-600 text-center text-xs">© 2026 Fix My Car - Bitácora Inteligente</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default LoginScreen
export { LoginScreen }

