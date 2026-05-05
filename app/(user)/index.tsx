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
import { AppointmentsService } from '../../src/services/AppointmentsService';
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
  kmRemaining: number;   // km que faltan para el próximo servicio
  interval: number;      // intervalo fijo del tipo de servicio
  priority: 'high' | 'medium' | 'low';
}

// Intervalos de servicio en km
const SERVICE_INTERVALS = {
  oilChange: 8_000,
  generalReview: 15_000,
  brakeChange: 25_000,
};

// Mapa entre el nombre en Firestore y el intervalo correspondiente
const SERVICE_MAP: { id: string; service: string; interval: number }[] = [
  { id: '1', service: 'Cambio de aceite',  interval: SERVICE_INTERVALS.oilChange },
  { id: '2', service: 'Revisión general',   interval: SERVICE_INTERVALS.generalReview },
  { id: '3', service: 'Cambio de frenos',   interval: SERVICE_INTERVALS.brakeChange },
];

/** Determina prioridad (semáforo) según porcentaje del intervalo restante. */
const getPriority = (kmRemaining: number, interval: number): 'high' | 'medium' | 'low' => {
  const ratio = kmRemaining / interval;
  if (ratio <= 0.2) return 'high';
  if (ratio <= 0.5) return 'medium';
  return 'low';
};

/**
 * Calcula los próximos servicios de forma asíncrona.
 * Para cada tipo de servicio:
 *   1. Consulta la última cita confirmada + pasada con mileageAtService.
 *   2. Si existe: kmRestantes = (mileageAtService + intervalo) - currentKm
 *   3. Si no:     kmRestantes = intervalo - (currentKm % intervalo)  [fallback]
 * Siempre se clampea a mínimo 0 (servicio vencido).
 */
const calculateUpcomingServicesAsync = async (
  userId: string,
  currentKm: number
): Promise<UpcomingService[]> => {
  return Promise.all(
    SERVICE_MAP.map(async ({ id, service, interval }) => {
      let kmRemaining: number;

      try {
        const lastMileage = await AppointmentsService.getLatestMileageByService(userId, service);

        if (lastMileage !== null) {
          // Cálculo basado en historial real
          kmRemaining = (lastMileage + interval) - currentKm;
        } else {
          // Fallback: cálculo por módulo
          kmRemaining = currentKm === 0 ? interval : interval - (currentKm % interval);
        }
      } catch {
        // Si Firestore falla (ej. índice no creado aún), usar fallback
        kmRemaining = currentKm === 0 ? interval : interval - (currentKm % interval);
      }

      // Clampear: si ya se superó el intervalo, mostrar 0 (vencido)
      kmRemaining = Math.max(0, kmRemaining);

      return { id, service, kmRemaining, interval, priority: getPriority(kmRemaining, interval) };
    })
  );
};

// Servicios por defecto cuando no hay vehículo registrado
const defaultUpcomingServices: UpcomingService[] = [
  { id: '1', service: 'Cambio de aceite', kmRemaining: SERVICE_INTERVALS.oilChange,    interval: SERVICE_INTERVALS.oilChange,    priority: 'low' },
  { id: '2', service: 'Revisión general',  kmRemaining: SERVICE_INTERVALS.generalReview, interval: SERVICE_INTERVALS.generalReview, priority: 'low' },
  { id: '3', service: 'Cambio de frenos',  kmRemaining: SERVICE_INTERVALS.brakeChange,  interval: SERVICE_INTERVALS.brakeChange,  priority: 'low' },
];

const UserHomeScreen = () => {
  const router = useRouter();
  const user = auth.currentUser;

  // ESTADOS
  const [myVehicle, setMyVehicle] = useState<VehicleData | null>(null);
  const [upcomingServices, setUpcomingServices] = useState<UpcomingService[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    model: '',
    year: '',
    plate: '',
    currentKm: ''
  });
  // Estado para editar kilometraje
  const [isKmModalVisible, setKmModalVisible] = useState(false);
  const [newKm, setNewKm] = useState('');
  const [kmLoading, setKmLoading] = useState(false);

  // Suscripción a Firebase para obtener el vehículo del usuario
  useEffect(() => {
    if (!user) return;
    const unsubscribe = VehiclesService.subscribeUserVehicles(user.uid, async (vehicles) => {
      const vehicle = vehicles.length > 0 ? (vehicles[0] as VehicleData) : null;
      setMyVehicle(vehicle);

      if (vehicle?.currentKm) {
        // Calcular con historial real (async) y actualizar estado
        const services = await calculateUpcomingServicesAsync(user.uid, vehicle.currentKm);
        setUpcomingServices(services);
      } else {
        setUpcomingServices([]);
      }
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

  // Actualizar kilometraje con validación
  const handleUpdateKm = async () => {
    const parsed = parseInt(newKm);
    if (!newKm || isNaN(parsed)) {
      Alert.alert('Error', 'Ingresa un número válido.');
      return;
    }
    if (parsed < (myVehicle?.currentKm ?? 0)) {
      Alert.alert(
        'Kilometraje inválido',
        `El nuevo kilometraje no puede ser menor al actual (${myVehicle?.currentKm?.toLocaleString()} km).`
      );
      return;
    }
    if (!myVehicle?.id) return;
    setKmLoading(true);
    try {
      await VehiclesService.updateKilometrage(myVehicle.id, parsed);
      setKmModalVisible(false);
      setNewKm('');
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el kilometraje. Verifica tu conexión.');
    } finally {
      setKmLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Dar de baja", "¿Estás seguro de eliminar este vehículo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => VehiclesService.deleteVehicle(id) }
    ]);
  };

  // Colores del semáforo por prioridad
  const trafficLight = {
    high: { dot: '#EF4444', bar: 'bg-red-500', label: 'Urgente', bg: 'bg-red-50', border: 'border-red-200' },
    medium: { dot: '#F59E0B', bar: 'bg-yellow-400', label: 'Próximo', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    low: { dot: '#22C55E', bar: 'bg-green-500', label: 'Al día', bg: 'bg-green-50', border: 'border-green-200' },
  };

  const renderServiceCard = ({ item }: { item: UpcomingService }) => {
    const colors = trafficLight[item.priority];
    // porcentaje CONSUMIDO del intervalo (para la barra de progreso)
    const consumed = Math.max(0, Math.min(100, ((item.interval - item.kmRemaining) / item.interval) * 100));

    return (
      <View className={`rounded-2xl p-4 mb-3 border ${colors.bg} ${colors.border}`}>
        <View className="flex-row items-center justify-between mb-2">
          {/* Semáforo + Nombre */}
          <View className="flex-row items-center flex-1">
            <View
              style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.dot, marginRight: 8 }}
            />
            <Text className="text-base font-semibold text-gray-800 flex-1">{item.service}</Text>
          </View>
          {/* Badge de prioridad */}
          <View style={{ backgroundColor: colors.dot + '22', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 }}>
            <Text style={{ color: colors.dot, fontSize: 11, fontWeight: '700' }}>{colors.label}</Text>
          </View>
        </View>

        {/* km restantes */}
        <Text className="text-sm text-gray-500 mb-3 ml-5">
          Faltan{' '}
          <Text className="font-bold text-gray-700">{item.kmRemaining.toLocaleString()} km</Text>
          {' '}para el próximo servicio
        </Text>

        {/* Barra de progreso */}
        <View className="w-full h-2 bg-white/60 rounded-full overflow-hidden border border-white">
          <View
            className={`h-full rounded-full ${colors.bar}`}
            style={{ width: `${consumed}%` }}
          />
        </View>
        <View className="flex-row justify-between mt-1">
          <Text className="text-xs text-gray-400">0 km</Text>
          <Text className="text-xs text-gray-400">{item.interval.toLocaleString()} km</Text>
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
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-bold text-white">{myVehicle.currentKm.toLocaleString()} km</Text>
              <TouchableOpacity
                onPress={() => {
                  setNewKm(String(myVehicle.currentKm));
                  setKmModalVisible(true);
                }}
                className="bg-white/20 p-2 rounded-full ml-2"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </TouchableOpacity>
            </View>
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
          data={myVehicle ? upcomingServices : defaultUpcomingServices}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Quick Actions */}
      <View className="mt-2 mb-10">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Opciones rápidas</Text>
        <TouchableOpacity onPress={() => router.push('/(user)/services')} className="bg-gray-100 p-4 rounded-lg mb-3 flex-row justify-between">

          <Text className="text-gray-800 font-semibold">🔧 Servicios</Text>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(user)/expenses')} className="bg-gray-100 p-4 rounded-lg flex-row justify-between">
          <Text className="text-gray-800 font-semibold">💰 Bitacora de Gastos</Text>

          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL EDICIÓN DE KILOMETRAJE --- */}
      <Modal visible={isKmModalVisible} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white rounded-3xl p-6 w-full shadow-2xl">
            <Text className="text-xl font-bold text-gray-800 mb-1">Actualizar Kilometraje</Text>
            <Text className="text-sm text-gray-400 mb-5">
              Actual: {myVehicle?.currentKm?.toLocaleString()} km
            </Text>

            <Text className="text-gray-500 mb-2 ml-1">Nuevo kilometraje</Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-xl text-gray-800 text-base mb-1"
              placeholder={`Mínimo ${myVehicle?.currentKm?.toLocaleString()} km`}
              keyboardType="numeric"
              value={newKm}
              onChangeText={setNewKm}
              autoFocus
            />
            <Text className="text-xs text-gray-400 mb-6 ml-1">
              El valor no puede ser menor al actual.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setKmModalVisible(false); setNewKm(''); }}
                className="flex-1 border border-gray-200 py-3 rounded-xl"
              >
                <Text className="text-center text-gray-500 font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateKm}
                disabled={kmLoading}
                className={`flex-1 py-3 rounded-xl ${kmLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
              >
                {kmLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold">Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                  onChangeText={(t) => setForm({ ...form, model: t })}
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
                    onChangeText={(t) => setForm({ ...form, year: t })}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 mb-1 ml-1">Placa</Text>
                  <TextInput
                    className="bg-gray-100 p-4 rounded-xl"
                    placeholder="ABC-1234"
                    autoCapitalize="characters"
                    value={form.plate}
                    onChangeText={(t) => setForm({ ...form, plate: t })}
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
                  onChangeText={(t) => setForm({ ...form, currentKm: t })}
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