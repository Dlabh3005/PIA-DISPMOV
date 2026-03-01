import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// Importaciones de servicios y configuración
import { auth } from '../../src/config/firebase';
import { VehiclesService } from '../../src/services/VehiclesService';

interface VehicleData {
  id?: string;
  model: string;
  year: string;
  plate: string;
  currentKm: number;
  status?: 'pending' | 'approved' | 'rejected';
}

interface UpcomingService {
  id: string;
  service: string;
  dueKm: number;
  daysUntil: number;
  priority: 'high' | 'medium' | 'low';
}

const defaultUpcomingServices: UpcomingService[] = [
  { id: '1', service: 'Cambio de aceite', dueKm: 50000, daysUntil: 30, priority: 'high' },
  { id: '2', service: 'Revisión general', dueKm: 60000, daysUntil: 60, priority: 'medium' },
  { id: '3', service: 'Cambio de frenos', dueKm: 70000, daysUntil: 90, priority: 'low' },
];

const UserHomeScreen = () => {
  const router = useRouter();
  const user = auth.currentUser;

  // ESTADOS
  const [myVehicle, setMyVehicle] = useState<VehicleData | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    model: '',
    year: '',
    plate: '',
    currentKm: ''
  });

  // Suscripción a Firebase para obtener el vehículo del usuario
  useEffect(() => {
    if (!user) return;
    const unsubscribe = VehiclesService.subscribeUserVehicles(user.uid, (vehicles) => {
      setMyVehicle(vehicles.length > 0 ? (vehicles[0] as VehicleData) : null);
    });
    return () => unsubscribe();
  }, [user]);

  // Lógica para registrar vehículo
  const handleRegister = async () => {
    if (!form.model || !form.year || !form.plate || !form.currentKm) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      await VehiclesService.requestVehicle(user!.uid, {
        model: form.model,
        year: form.year,
        plate: form.plate,
        currentKm: parseInt(form.currentKm)
      });
      setModalVisible(false);
      setForm({ model: '', year: '', plate: '', currentKm: '' });
      Alert.alert("Éxito", "Solicitud de alta enviada al administrador");
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el registro");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Dar de baja", "¿Estás seguro de eliminar este vehículo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => VehiclesService.deleteVehicle(id) }
    ]);
  };

  // Funciones auxiliares de estilo (Mantenidas de tu original)
  const getProgressColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const renderServiceCard = ({ item }: { item: UpcomingService }) => {
    const currentKm = myVehicle?.currentKm || 0;
    const kmRemaining = item.dueKm - currentKm;
    const progress = Math.max(0, Math.min(100, (currentKm / item.dueKm) * 100));

    return (
      <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800 mb-1">{item.service}</Text>
            <Text className="text-sm text-gray-500">En {kmRemaining.toLocaleString()} km</Text>
          </View>
        </View>
        <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <View className={`h-full ${getProgressColor(item.priority)}`} style={{ width: `${progress}%` }} />
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      {/* Welcome Section */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</Text>
        <Text className="text-gray-600">{user?.email || 'Usuario'}</Text>
      </View>

      {/* Lógica de Tarjeta: Mostrar Vehículo o Botón de Registro */}
      {myVehicle ? (
        <LinearGradient
          colors={myVehicle.status === 'pending' ? ['#9ca3af', '#4b5563'] : ['#2563eb', '#1e40af']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          className="rounded-lg p-6 mb-6 shadow-xl"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-lg font-semibold text-white">
                {myVehicle.status === 'pending' ? '⏳ Solicitud Pendiente' : '🚗 Mi Vehículo'}
              </Text>
              <Text className="text-blue-100">{myVehicle.model} • {myVehicle.year}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => myVehicle.id && handleDelete(myVehicle.id)}
              className="bg-red-500/40 px-3 py-1 rounded-full"
            >
              <Text className="text-white text-xs font-bold">Baja</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-blue-100">Kilometraje Actual</Text>
            <Text className="text-2xl font-bold text-white">{myVehicle.currentKm.toLocaleString()} km</Text>
          </View>
          <View className="bg-white/20 rounded-lg p-3">
            <Text className="text-xs text-blue-100 mb-1">Placa</Text>
            <Text className="text-lg font-semibold text-white">{myVehicle.plate}</Text>
          </View>
        </LinearGradient>
      ) : (
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="border-2 border-dashed border-blue-500 rounded-xl p-10 mb-6 items-center"
        >
          <Text className="text-blue-500 font-bold text-lg">+ Registrar Vehículo</Text>
        </TouchableOpacity>
      )}

      {/* Upcoming Services Section */}
      <View className="mb-4">
        <View className="flex-row items-center gap-2 mb-4">
          <Text className="text-lg font-semibold text-gray-800">Próximos Servicios</Text>
        </View>
        <FlatList
          data={defaultUpcomingServices}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Quick Actions */}
      <View className="mt-2 mb-10">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Opciones rápidas</Text>
        <TouchableOpacity onPress={() => router.push('/(user)/services')} className="bg-gray-100 p-4 rounded-lg mb-3 flex-row justify-between">
          <Text className="text-gray-800 font-semibold">🔧 Historial de Servicios</Text>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(user)/expenses')} className="bg-gray-100 p-4 rounded-lg flex-row justify-between">
          <Text className="text-gray-800 font-semibold">💰 Gestor de Gastos</Text>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL FORMULARIO DE REGISTRO --- */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[85%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Alta de Vehículo</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-blue-500 font-bold">Cancelar</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-500 mb-1 ml-1">Modelo (Marca y línea)</Text>
                <TextInput 
                  className="bg-gray-100 p-4 rounded-xl"
                  placeholder="Ej: Toyota Corolla"
                  value={form.model}
                  onChangeText={(t) => setForm({...form, model: t})}
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-gray-500 mb-1 ml-1">Año</Text>
                  <TextInput 
                    className="bg-gray-100 p-4 rounded-xl"
                    placeholder="2020"
                    keyboardType="numeric"
                    value={form.year}
                    onChangeText={(t) => setForm({...form, year: t})}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 mb-1 ml-1">Placa</Text>
                  <TextInput 
                    className="bg-gray-100 p-4 rounded-xl"
                    placeholder="ABC-1234"
                    autoCapitalize="characters"
                    value={form.plate}
                    onChangeText={(t) => setForm({...form, plate: t})}
                  />
                </View>
              </View>

              <View>
                <Text className="text-gray-500 mb-1 ml-1">Kilometraje Inicial</Text>
                <TextInput 
                  className="bg-gray-100 p-4 rounded-xl"
                  placeholder="Ej: 45000"
                  keyboardType="numeric"
                  value={form.currentKm}
                  onChangeText={(t) => setForm({...form, currentKm: t})}
                />
              </View>

              <TouchableOpacity 
                disabled={loading}
                onPress={handleRegister}
                className={`mt-6 py-4 rounded-xl shadow-lg ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">Solicitar Registro</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default UserHomeScreen;