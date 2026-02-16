import React, { useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'

const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([
    {
      id: '1',
      date: '15 Febrero, 2026',
      time: '10:00 AM',
      service: 'Cambio de aceite',
      status: 'Confirmada',
    },
    {
      id: '2',
      date: '22 Febrero, 2026',
      time: '2:00 PM',
      service: 'Inspección general',
      status: 'Pendiente',
    },
  ])

  const renderAppointment = ({ item }: any) => (
    <View className="bg-gray-100 p-4 rounded-lg mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-bold text-gray-800">{item.service}</Text>
        <View className={`px-2 py-1 rounded ${item.status === 'Confirmada' ? 'bg-green-200' : 'bg-yellow-200'}`}>
          <Text className={item.status === 'Confirmada' ? 'text-green-800' : 'text-yellow-800'}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text className="text-gray-600 mb-1">📅 {item.date}</Text>
      <Text className="text-gray-600">🕐 {item.time}</Text>
    </View>
  )

  return (
    <View className="flex-1 bg-white">
      <View className="p-6">
        <TouchableOpacity className="bg-blue-500 py-3 rounded-lg mb-6">
          <Text className="text-white text-center font-semibold">+ Nueva Cita</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
      />
    </View>
  )
}

export default AppointmentsScreen
