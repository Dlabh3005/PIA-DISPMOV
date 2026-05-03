import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { Appointment, AppointmentsService } from '../../src/services/AppointmentsService'
import { VehiclesService } from '../../src/services/VehiclesService'

const AdminScreen = () => {
  const router = useRouter()

  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([])
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    const unsubscribe = VehiclesService.subscribePendingRequests((requests) => {
      setPendingRequests(requests)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = AppointmentsService.subscribePendingAppointments(setPendingAppointments)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = AppointmentsService.subscribeConfirmedAppointments(setConfirmedAppointments)
    return () => unsubscribe()
  }, [])

  const handleApprove = async (id: string, model: string) => {
    try {
      await VehiclesService.approveVehicle(id)
      Alert.alert("Éxito", `El vehículo ${model} ha sido aprobado.`)
    } catch {
      Alert.alert("Error", "No se pudo aprobar el vehículo.")
    }
  }

  const handleReject = (id: string) => {
    Alert.alert(
      "Rechazar Solicitud",
      "¿Estás seguro de que deseas eliminar esta solicitud de alta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => VehiclesService.deleteVehicle(id)
        }
      ]
    )
  }

  // 🔥 MARCAR DÍAS CON CITAS (usando dateISO)
  const markedDates = confirmedAppointments.reduce((acc, appointment) => {
    const date = appointment.dateISO // 👈 CAMBIO IMPORTANTE
    if (!date) return acc

    if (!acc[date]) {
      acc[date] = { marked: true, dotColor: 'blue' }
    }
    return acc
  }, {} as any)

  // 🔥 FILTRAR CITAS POR DÍA (usando dateISO)
  const selectedDayAppointments = confirmedAppointments.filter(
    (app) => app.dateISO === selectedDate // 👈 CAMBIO IMPORTANTE
  )

  // 🔍 DEBUG (puedes borrarlo después)
  useEffect(() => {
    if (!selectedDate) return

    console.log("Selected:", selectedDate)
    console.log("Confirmed:", confirmedAppointments)
    console.log("Filtradas:", selectedDayAppointments)
  }, [selectedDate, confirmedAppointments])

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</Text>

      {/* --- SOLICITUDES DE ALTA --- */}
      <View className="mb-8">
        <Text className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
          Solicitudes de Alta
        </Text>

        {pendingRequests.length === 0 ? (
          <Text className="text-gray-400">No hay solicitudes pendientes</Text>
        ) : (
          pendingRequests.map((item) => (
            <View key={item.id} className="bg-gray-50 p-4 rounded-xl border mb-4">
              <Text className="font-bold">{item.model}</Text>

              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  onPress={() => handleApprove(item.id, item.model)}
                  className="bg-green-600 flex-1 py-3 rounded-lg"
                >
                  <Text className="text-white text-center font-bold">Aprobar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleReject(item.id)}
                  className="bg-red-100 flex-1 py-3 rounded-lg"
                >
                  <Text className="text-red-600 text-center font-bold">Rechazar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* --- CITAS PENDIENTES --- */}
      <View className="mb-8">
        <Text className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-4">
          Citas Pendientes
        </Text>

        {pendingAppointments.map((item) => (
          <View key={item.id} className="bg-gray-50 p-4 rounded-xl border mb-4">
            <Text className="font-bold">{item.serviceName}</Text>
            <Text>👤 {item.userEmail}</Text>
            <Text>📅 {item.date} 🕐 {item.time}</Text>

            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                onPress={() => AppointmentsService.confirmAppointment(item.id!)}
                className="bg-green-600 flex-1 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-bold">Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => AppointmentsService.rejectAppointment(item.id!)}
                className="bg-red-100 flex-1 py-3 rounded-lg"
              >
                <Text className="text-red-600 text-center font-bold">Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* --- CALENDARIO --- */}
      <View className="mb-8">
        <Text className="text-sm font-bold text-green-600 uppercase tracking-widest mb-4">
          Calendario de Citas Confirmadas
        </Text>

        <Calendar
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              selected: true,
              selectedColor: 'green'
            }
          }}
          onDayPress={(day) => {
            console.log("Día presionado:", day.dateString)
            setSelectedDate(day.dateString)
          }}
        />

        {selectedDate && (
          <View className="mt-4">
            <Text className="text-lg font-bold mb-2">
              Citas para {selectedDate}
            </Text>

            {selectedDayAppointments.length === 0 ? (
              <Text className="text-gray-400">
                No hay citas para este día
              </Text>
            ) : (
              selectedDayAppointments.map((item) => (
                <View key={item.id} className="bg-green-50 p-3 rounded-lg border mb-2">
                  <Text className="font-bold">{item.serviceName}</Text>
                  <Text>👤 {item.userEmail}</Text>
                  <Text>🕐 {item.time}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* --- CERRAR SESIÓN --- */}
      <TouchableOpacity
        onPress={() => router.replace('/(auth)/login')}
        className="mt-10 mb-10 bg-red-500 py-4 rounded-lg"
      >
        <Text className="text-white text-center font-bold">Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default AdminScreen