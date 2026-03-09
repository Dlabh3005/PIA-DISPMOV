import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { authService } from "../../src/services/authService";

const RegisterScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Error", "Ingresa correo y contraseña");
        return;
      }

      await authService.register(email, password);

      Alert.alert("Éxito", "Cuenta creada correctamente");
      // _layout redirige automáticamente
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 justify-center p-6 min-h-screen">

        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Crear Cuenta
          </Text>
        </View>

        <View className="bg-white rounded-2xl shadow-lg p-6">

          {/* Email */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              📧 Correo
            </Text>
            <TextInput
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              placeholderTextColor="#999"
            />
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              🔒 Contraseña
            </Text>
            <TextInput
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            className="bg-green-600 py-3 rounded-lg mb-4"
          >
            <Text className="text-white text-center font-semibold text-base">
              Registrarse
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-600 text-center font-semibold">
              Volver
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;