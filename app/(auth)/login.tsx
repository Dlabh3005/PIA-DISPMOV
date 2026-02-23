import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

interface LoginProps {
  onLogin?: (username: string, isAdmin: boolean) => void
}

const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'user' | 'admin'>('user')
  const [error, setError] = useState('')

  // Register form state (visible only for non-admin)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

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

    // Mock authentication: accept any password as long as one is provided
    const isAdmin = userType === 'admin'

    console.log('Login exitoso:', { username, isAdmin, userType })

    // Callback si existe
    if (onLogin) {
      onLogin(username, isAdmin)
    }

    // Navegar según rol seleccionado
    if (isAdmin) {
      router.push('/(admin)')
    } else {
      router.push('/(user)')
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
          {/* User Type Selector */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">👥 Tipo de Usuario</Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => {
                  setUserType('user')
                  // if previously auto-filled admin, clear it when switching back
                  if (username === 'admin') setUsername('')
                }}
                className={`flex-1 py-2 rounded-lg items-center ${userType === 'user' ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <Text className={`${userType === 'user' ? 'text-white' : 'text-gray-700'}`}>Usuario Normal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setUserType('admin')
                  // autocomplete username when admin selected
                  setUsername('admin')
                  // close register form if open
                  setIsRegisterOpen(false)
                }}
                className={`flex-1 py-2 rounded-lg items-center ${userType === 'admin' ? 'bg-purple-600' : 'bg-gray-200'}`}
              >
                <Text className={`${userType === 'admin' ? 'text-white' : 'text-gray-700'}`}>Administrador</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register toggle - only for non-admin */}
          {userType === 'user' && (
            <View className="mb-4">
              <TouchableOpacity onPress={() => setIsRegisterOpen(prev => !prev)}>
                <Text className="text-blue-600 font-medium">{isRegisterOpen ? 'Cancelar registro' : '¿No tienes una cuenta? Regístrate'}</Text>
              </TouchableOpacity>

              {isRegisterOpen && (
                <View className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Correo</Text>
                  <TextInput
                    placeholder="tu@email.com"
                    value={registerEmail}
                    onChangeText={setRegisterEmail}
                    className="border border-gray-300 rounded-lg p-3 mb-3 text-gray-800"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text className="text-sm font-semibold text-gray-700 mb-2">Contraseña</Text>
                  <TextInput
                    placeholder="Contraseña"
                    value={registerPassword}
                    onChangeText={setRegisterPassword}
                    secureTextEntry
                    className="border border-gray-300 rounded-lg p-3 mb-3 text-gray-800"
                    placeholderTextColor="#999"
                  />

                  <TouchableOpacity
                    onPress={() => {
                      if (!registerEmail.trim() || !registerPassword.trim()) {
                        Alert.alert('Error', 'Ingresa correo y contraseña para registrarte')
                        return
                      }
                      // Mock register: set username to email (local part) and close
                      const local = registerEmail.split('@')[0]
                      setUsername(local)
                      setIsRegisterOpen(false)
                      setRegisterEmail('')
                      setRegisterPassword('')
                      Alert.alert('Registro', 'Cuenta creada. Ahora puedes iniciar sesión.')
                    }}
                    className="bg-green-600 py-3 rounded-lg"
                  >
                    <Text className="text-white text-center font-semibold">Crear cuenta</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

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

