import React from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'

const ServicesScreen = () => {
  const [services, setServices] = useState([
    { id: '1', name: 'Cambio de aceite', price: '$500', duration: '30 min' },
    { id: '2', name: 'Revisión general', price: '$800', duration: '1 hora' },
    { id: '3', name: 'Alineación', price: '$1,200', duration: '1.5 horas' },
    { id: '4', name: 'Frenos', price: '$2,000', duration: '2 horas' },
    { id: '5', name: 'Cambio de llantas', price: '$600', duration: '45 min' },
  ])

  const renderService = ({ item }: any) => (
    <TouchableOpacity className="bg-gray-100 p-4 rounded-lg mb-4 flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800 mb-1">{item.name}</Text>
        <Text className="text-gray-600">⏱️ {item.duration}</Text>
      </View>
      <View className="items-end">
        <Text className="text-green-600 font-bold text-lg">{item.price}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-gray-700 mb-4">Nuestros servicios disponibles:</Text>
      </View>

      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
      />
    </View>
  )
}

import { useState } from 'react'
export default ServicesScreen
