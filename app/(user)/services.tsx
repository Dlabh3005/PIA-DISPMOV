import React, { useState } from 'react'
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

export default ServicesScreen

// React Native version of service log component

export interface Service {
  id: string
  date: string
  service: string
  description?: string
  cost: number
  km: number
  category: 'maintenance' | 'repair' | 'inspection' | 'other'
}

export interface ServiceLogProps {
  services: Service[]
  onAddService: () => void
}

export const ServiceLog: React.FC<ServiceLogProps> = ({ services, onAddService }) => {
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'maintenance':
        return '🔧'
      case 'repair':
        return '🛠️'
      case 'inspection':
        return '🔍'
      default:
        return '📦'
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'maintenance':
        return 'bg-blue-100'
      case 'repair':
        return 'bg-red-100'
      case 'inspection':
        return 'bg-green-100'
      default:
        return 'bg-gray-100'
    }
  }

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'maintenance':
        return 'Mantenimiento'
      case 'repair':
        return 'Reparación'
      case 'inspection':
        return 'Inspección'
      default:
        return 'Otro'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const sorted = [...services].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const processed = sorted.map((s, i) => {
    const prev = sorted[i + 1]
    const showMonthDivider =
      !prev || new Date(s.date).getMonth() !== new Date(prev.date).getMonth()
    return { ...s, showMonthDivider }
  })

  const renderItem = ({ item }: any) => (
    <>
      {item.showMonthDivider && (
        <Text className="text-xs font-semibold text-gray-500 mb-2 px-1">
          {new Date(item.date)
            .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
            .toUpperCase()}
        </Text>
      )}
      <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow">
        <View className="flex-row gap-3">
          <View className="flex-shrink-0 pt-1">
            <View
              className={`${getCategoryColor(item.category)} w-10 h-10 rounded-full items-center justify-center`}
            >
              <Text>{getCategoryIcon(item.category)}</Text>
            </View>
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between mb-1">
              <Text className="font-semibold text-base flex-1">
                {item.service}
              </Text>
              <View className="px-2 py-1 bg-gray-200 rounded-full">
                <Text className="text-xs">
                  {getCategoryLabel(item.category)}
                </Text>
              </View>
            </View>
            {item.description && (
              <Text className="text-sm text-gray-600 mb-2">
                {item.description}
              </Text>
            )}
            <View className="flex-row items-center gap-4 text-xs text-gray-500">
              <View className="flex-row items-center gap-1">
                <Text>📅</Text>
                <Text>{formatDate(item.date)}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text>💲</Text>
                <Text>{item.cost.toLocaleString()}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text>{item.km.toLocaleString()} km</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  )

  return (
    <View className="flex-1 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">Historial de Servicios</Text>
        <TouchableOpacity onPress={onAddService}>
          <Text className="text-sm text-blue-600 font-medium">+ Agregar</Text>
        </TouchableOpacity>
      </View>
      {processed.length === 0 ? (
        <View className="items-center p-8">
          <Text className="text-4xl mb-3 text-gray-400">🔧</Text>
          <Text className="text-gray-500 mb-2">No hay servicios registrados</Text>
          <Text className="text-sm text-gray-400">
            Comienza agregando tu primer servicio
          </Text>
        </View>
      ) : (
        <FlatList
          data={processed}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  )
}



