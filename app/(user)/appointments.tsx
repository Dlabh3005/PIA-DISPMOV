import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../src/config/firebase";
import {
  Appointment,
  AppointmentsService,
} from "../../src/services/AppointmentsService";

const AVAILABLE_SERVICES = [
  "Cambio de aceite",
  "Revisión general",
  "Cambio de frenos",
  "Alineación y balanceo",
  "Cambio de llantas",
  "Diagnóstico electrónico",
];

// Valida la fecha y hora contra el horario del taller
// Lunes-Sábado 9:00 AM – 7:00 PM, domingos cerrado
const validateSchedule = (dateStr: string, timeStr: string): string | null => {
  // Parsear fecha DD/MM/AAAA
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) return "Ingresa la fecha en formato DD/MM/AAAA.";

  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year))
    return "La fecha no es válida. Usa el formato DD/MM/AAAA.";

  const date = new Date(year, month - 1, day);
  const weekday = date.getDay(); // 0=domingo, 6=sábado

  if (weekday === 0)
    return "Los domingos el taller está cerrado. Por favor elige otro día.";

  // Parsear hora — acepta "10:00 AM", "2:30 PM", "14:00"
  const timeClean = timeStr.trim().toUpperCase();
  const match = timeClean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return "Ingresa la hora en formato HH:MM AM/PM (ej: 10:00 AM).";

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const meridiem = match[3];

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const totalMinutes = hours * 60 + minutes;
  const openMinutes = 9 * 60;   // 9:00 AM
  const closeMinutes = 19 * 60; // 7:00 PM

  if (totalMinutes < openMinutes || totalMinutes >= closeMinutes)
    return "El horario del taller es de Lunes a Sábado de 9:00 AM a 7:00 PM.";

  return null; // Todo válido
};

const AppointmentsScreen = () => {
  const user = auth.currentUser;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsubscribe = AppointmentsService.subscribeUserAppointments(
      user.uid,
      setAppointments
    );
    return () => unsubscribe();
  }, [user]);

  const handleCreate = async () => {
    if (!selectedService || !date.trim() || !time.trim()) {
      Alert.alert("Error", "Selecciona un servicio, fecha y hora.");
      return;
    }

    const scheduleError = validateSchedule(date, time);
    if (scheduleError) {
      Alert.alert("Horario no disponible", scheduleError);
      return;
    }

    setLoading(true);
    try {
      await AppointmentsService.createAppointment({
        userId: user!.uid,
        userEmail: user!.email ?? "",
        serviceName: selectedService,
        date: date.trim(),
        time: time.trim(),
      });
      Alert.alert("✅ Cita enviada", "Tu cita quedó pendiente de confirmación.");
      setModalVisible(false);
      setSelectedService("");
      setDate("");
      setTime("");
    } catch (e) {
      Alert.alert("Error", "No se pudo crear la cita. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = (status: string) => {
    if (status === "confirmed") return { bg: "bg-green-100", text: "text-green-700", label: "✅ Confirmada" };
    if (status === "rejected")  return { bg: "bg-red-100",   text: "text-red-700",   label: "❌ Rechazada"  };
    return                             { bg: "bg-yellow-100", text: "text-yellow-700", label: "⏳ Pendiente"  };
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const s = statusStyle(item.status);
    return (
      <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-base font-bold text-gray-800 flex-1">
            {item.serviceName}
          </Text>
          <View className={`px-3 py-1 rounded-full ${s.bg}`}>
            <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
          </View>
        </View>
        <Text className="text-gray-500 text-sm">📅 {item.date}</Text>
        <Text className="text-gray-500 text-sm">🕐 {item.time}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-2">
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-blue-600 py-3 rounded-xl"
        >
          <Text className="text-white text-center font-semibold text-base">
            + Nueva Cita
          </Text>
        </TouchableOpacity>
      </View>

      {appointments.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 text-base">No tienes citas aún</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 30 }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Nueva Cita</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-blue-500 font-semibold">Cancelar</Text>
              </TouchableOpacity>
            </View>

            {/* Horario visible para el usuario */}
            <View className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
              <Text className="text-blue-700 text-xs font-semibold">
                🕘 Horario: Lunes a Sábado · 9:00 AM – 7:00 PM
              </Text>
            </View>

            <Text className="text-sm font-semibold text-gray-600 mb-2">🔧 Servicio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              {AVAILABLE_SERVICES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSelectedService(s)}
                  className={`mr-2 px-4 py-2 rounded-full border ${
                    selectedService === s
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text className={`text-sm font-medium ${selectedService === s ? "text-white" : "text-gray-700"}`}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="text-sm font-semibold text-gray-600 mb-2">📅 Fecha</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="DD/MM/AAAA"
              className="border border-gray-300 rounded-xl p-3 mb-5 text-gray-800"
              placeholderTextColor="#9ca3af"
            />

            <Text className="text-sm font-semibold text-gray-600 mb-2">🕐 Hora</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM AM/PM  (ej: 10:00 AM)"
              className="border border-gray-300 rounded-xl p-3 mb-6 text-gray-800"
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity
              onPress={handleCreate}
              disabled={loading}
              className={`py-4 rounded-xl ${loading ? "bg-gray-400" : "bg-blue-600"}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-base">
                  Enviar Cita
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AppointmentsScreen;
