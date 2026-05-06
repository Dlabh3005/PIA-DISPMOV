import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../src/config/firebase";

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Error", "Por favor ingresa un correo válido");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setIsSuccess(true);
    } catch (error: any) {
      let errorMessage = "Ocurrió un error. Intenta de nuevo";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No existe una cuenta con este correo electrónico";
          break;
        case "auth/invalid-email":
          errorMessage = "Por favor ingresa un correo válido";
          break;
        case "auth/too-many-requests":
          errorMessage = "Demasiados intentos. Espera unos minutos";
          break;
        default:
          errorMessage = error.message || "Ocurrió un error. Intenta de nuevo";
          break;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 justify-center p-6 min-h-screen">
        {/* Title Section */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Recuperar Contraseña
          </Text>
          <Text className="text-gray-600 text-center">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu
            contraseña.
          </Text>
        </View>

        <View className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          {isSuccess ? (
            <View className="items-center py-4">
              <Text className="text-5xl mb-4">✅</Text>
              <Text className="text-gray-800 font-bold text-lg text-center mb-6">
                Te enviamos un enlace a tu correo para restablecer tu
                contraseña.
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/login")}
                className="bg-blue-600 py-3 px-6 rounded-lg w-full"
              >
                <Text className="text-white text-center font-semibold text-base">
                  Volver al inicio de sesión
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  📧 Correo
                </Text>
                <TextInput
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="border border-gray-300 rounded-lg p-3 text-gray-800"
                  editable={!loading}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={loading}
                className={`py-3 rounded-lg mb-4 ${loading ? "bg-blue-400" : "bg-blue-600"
                  }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-base">
                    Enviar enlace de recuperación
                  </Text>
                )}
              </TouchableOpacity>

              {/* Back to Login Link */}
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-gray-600 text-center font-semibold mt-2">
                  Volver al inicio de sesión
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
