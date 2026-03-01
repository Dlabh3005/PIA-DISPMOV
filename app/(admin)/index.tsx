import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
// Importamos el servicio para gestionar los datos
import { VehiclesService } from '../../src/services/VehiclesService'

const AdminScreen = () => {
  const router = useRouter()
  
  // Estado para almacenar las solicitudes pendientes de Firebase
  const [pendingRequests, setPendingRequests] = useState<any[]>([])

  // Suscripción en tiempo real a las solicitudes con status 'pending'
  useEffect(() => {
    const unsubscribe = VehiclesService.subscribePendingRequests((requests) => {
      setPendingRequests(requests)
    })
    return () => unsubscribe()
  }, [])

  const handleApprove = async (id: string, model: string) => {
    try {
      await VehiclesService.approveVehicle(id)
      Alert.alert("Éxito", `El vehículo ${model} ha sido aprobado.`)
    } catch (error) {
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

  const menuItems = [
    { label: 'Usuarios', icon: '👥' },
    { label: 'Servicios', icon: '🔧' },
    { label: 'Citas', icon: '📅' },
    { label: 'Reportes', icon: '📊' },
  ]

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</Text>

      {/* --- SECCIÓN DE SOLICITUDES DE ALTA (NUEVO) --- */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm font-bold text-blue-600 uppercase tracking-widest">
            Solicitudes de Alta
          </Text>
          <View className="bg-blue-100 px-2 py-1 rounded-full">
            <Text className="text-blue-600 text-xs font-bold">{pendingRequests.length}</Text>
          </View>
        </View>

        {pendingRequests.length === 0 ? (
          <View className="bg-gray-50 p-6 rounded-xl border border-gray-100 items-center">
            <Text className="text-gray-400">No hay solicitudes pendientes</Text>
          </View>
        ) : (
          pendingRequests.map((item) => (
            <View key={item.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
              <View className="mb-3">
                <Text className="text-lg font-bold text-gray-800">{item.model}</Text>
                <Text className="text-gray-500 text-sm">
                  Año: {item.year} • Placa: {item.plate}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">KM Inicial: {item.currentKm}</Text>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity 
                  onPress={() => handleApprove(item.id, item.model)}
                  className="bg-green-600 flex-1 py-3 rounded-lg shadow-sm"
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

      {/* --- GESTIÓN GENERAL (TU CÓDIGO ORIGINAL) --- */}
      <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
        Gestión General
      </Text>
      <View className="gap-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-gray-100 p-4 rounded-lg flex-row items-center"
          >
            <Text className="text-3xl mr-4">{item.icon}</Text>
            <Text className="text-lg font-semibold text-gray-800 flex-1">{item.label}</Text>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
  onPress={() => {
    router.replace('/(auth)/login');
  }}
  className="mt-10 mb-10 bg-red-500 py-4 rounded-lg shadow-sm"
>
  <Text className="text-white text-center font-bold">
    Cerrar Sesión
  </Text>
</TouchableOpacity>
    </ScrollView>
  )
}

export default AdminScreen