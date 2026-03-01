import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { authService } from "../../src/services/authService";
// Obtenemos el código desde el archivo .env
const SECRET_ADMIN_CODE = process.env.EXPO_PUBLIC_ADMIN_CODE || "MASTER123"; 

const LoginScreen = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");

  const handleLogin = async () => {
    try {
      // 1. Validaciones generales (Email y Pass son obligatorios siempre)
      if (!email.trim() || !password.trim()) {
        Alert.alert("Error", "Ingresa correo y contraseña");
        return;
      }

      // 2. Validación específica de ADMIN
      if (isAdmin) {
        if (!adminCode.trim()) {
          Alert.alert("Requerido", "El modo Admin requiere el Código de Acceso");
          return;
        }
        
        if (adminCode !== SECRET_ADMIN_CODE) {
          Alert.alert("Acceso Denegado", "El código de acceso es incorrecto");
          return;
        }
      }

      // 3. Si pasamos las validaciones locales, intentamos iniciar sesión en Firebase
      // Esto verifica que el email y pass sean reales en tu base de datos
      await authService.login(email, password);

      // 4. Redirección según el rol
      if (isAdmin) {
        Alert.alert("Bienvenido Admin", "Acceso concedido al panel.");
        router.replace('/(admin)');
      } else {
        router.replace('/(user)');
      }

    } catch (error: any) {
      Alert.alert("Error de Autenticación", error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 justify-center p-6 min-h-screen">

        {/* Logo y Título */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full overflow-hidden mb-4">
  <Image
    source={require("../../assets/Imagen2.jpg")} // ruta de tu imagen
    className="w-20 h-20"
    resizeMode="cover"
  />
</View>
          <Text className="text-4xl font-bold text-gray-900 mb-2">Fix My Car</Text>
          <Text className="text-gray-600">
            {isAdmin ? "Acceso Administrativo" : "Bitácora Inteligente"}
          </Text>
        </View>

        {/* Switch Selector */}
        <View className="flex-row items-center justify-center mb-6 bg-gray-100 p-2 rounded-full self-center">
            <Text className={`mr-3 font-semibold ${!isAdmin ? 'text-blue-600' : 'text-gray-400'}`}>Usuario</Text>
            <Switch
                trackColor={{ false: "#767577", true: "#333" }}
                thumbColor={"#f4f3f4"}
                onValueChange={(val) => {
                    setIsAdmin(val);
                    setAdminCode(""); // Limpiar código al cambiar
                }}
                value={isAdmin}
            />
            <Text className={`ml-3 font-semibold ${isAdmin ? 'text-gray-900' : 'text-gray-400'}`}>Admin</Text>
        </View>

        <View className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            
          {/* --- CAMPO EXTRA PARA ADMIN --- */}
          {isAdmin && (
            <View className="mb-6 border-b-2 border-gray-200 pb-4">
                <Text className="text-sm font-bold text-red-600 mb-2">
                  🛡️ Código de Seguridad
                </Text>
                <TextInput
                  placeholder="Código Maestro"
                  value={adminCode}
                  onChangeText={setAdminCode}
                  secureTextEntry
                  className="border border-red-200 bg-red-50 rounded-lg p-3 text-gray-800 text-center font-bold"
                  placeholderTextColor="#999"
                />
            </View>
          )}

          {/* Email (Siempre visible) */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">📧 Correo</Text>
            <TextInput
              placeholder="correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
            />
          </View>

          {/* Password (Siempre visible) */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">🔒 Contraseña</Text>
            <TextInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
            />
          </View>

          {/* Botón Login */}
          <TouchableOpacity
            onPress={handleLogin}
            className={`py-3 rounded-lg mb-4 ${isAdmin ? 'bg-gray-900' : 'bg-blue-600'}`}
          >
            <Text className="text-white text-center font-semibold text-base">
              {isAdmin ? "Entrar como Admin" : "Iniciar Sesión"}
            </Text>
          </TouchableOpacity>

          {/* Registro (Solo usuarios) */}
          {!isAdmin && (
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="text-blue-600 text-center font-semibold">
                ¿No tienes cuenta? Regístrate
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </ScrollView>
  );
};

export default LoginScreen;