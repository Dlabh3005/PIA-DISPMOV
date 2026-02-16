import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React from 'react'
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native'

interface VehicleData {
  model: string
  year: string
  plate: string
  currentKm: number
}

interface UpcomingService {
  id: string
  service: string
  dueKm: number
  daysUntil: number
  priority: 'high' | 'medium' | 'low'
}

interface UserHomeScreenProps {
  vehicleData?: VehicleData
  upcomingServices?: UpcomingService[]
}

const defaultVehicleData: VehicleData = {
  model: 'Toyota Corolla',
  year: '2020',
  plate: 'ABC-1234',
  currentKm: 45000,
}

const defaultUpcomingServices: UpcomingService[] = [
  {
    id: '1',
    service: 'Cambio de aceite',
    dueKm: 50000,
    daysUntil: 30,
    priority: 'high',
  },
  {
    id: '2',
    service: 'Revisión general',
    dueKm: 60000,
    daysUntil: 60,
    priority: 'medium',
  },
  {
    id: '3',
    service: 'Cambio de frenos',
    dueKm: 70000,
    daysUntil: 90,
    priority: 'low',
  },
]

const UserHomeScreen: React.FC<UserHomeScreenProps> = ({
  vehicleData = defaultVehicleData,
  upcomingServices = defaultUpcomingServices,
}) => {
  const router = useRouter()

  const getProgressColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'Urgente'
      case 'medium':
        return 'Próximo'
      case 'low':
        return 'Planeado'
      default:
        return 'Pendiente'
    }
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100'
      case 'medium':
        return 'bg-yellow-100'
      case 'low':
        return 'bg-green-100'
      default:
        return 'bg-blue-100'
    }
  }

  const getPriorityTextColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'text-red-700'
      case 'medium':
        return 'text-yellow-700'
      case 'low':
        return 'text-green-700'
      default:
        return 'text-blue-700'
    }
  }

  const renderServiceCard = ({ item }: { item: UpcomingService }) => {
    const kmRemaining = item.dueKm - vehicleData.currentKm
    const progress = Math.max(0, Math.min(100, (vehicleData.currentKm / item.dueKm) * 100))
    const progressPercentage = Math.round(progress)

    return (
      <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800 mb-1">{item.service}</Text>
            <Text className="text-sm text-gray-500">En {kmRemaining.toLocaleString()} km</Text>
          </View>
          <View
            className={`${getPriorityColor(item.priority)} rounded-full px-3 py-1`}
          >
            <Text className={`text-xs font-semibold ${getPriorityTextColor(item.priority)}`}>
              {getPriorityLabel(item.priority)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-gray-500">Progreso</Text>
            <Text className="text-xs text-gray-500">{progressPercentage}%</Text>
          </View>
          <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className={`h-full ${getProgressColor(item.priority)}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>

        {/* Days Info */}
        {item.daysUntil > 0 && (
          <View className="flex-row items-center gap-1">
            <Text className="text-lg">📅</Text>
            <Text className="text-xs text-gray-500">Aprox. {item.daysUntil} días</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      {/* Welcome Section */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</Text>
        <Text className="text-gray-600">Usuario</Text>
      </View>

      {/* Vehicle Status Card */}
      <LinearGradient
        colors={['#2563eb', '#1e40af']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-lg p-6 mb-6"
      >
        <View className="mb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-2xl">🚗</Text>
            <Text className="text-lg font-semibold text-white">Mi Vehículo</Text>
          </View>
          <Text className="text-blue-100">
            {vehicleData.model} • {vehicleData.year}
          </Text>
        </View>

        <View className="space-y-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">⏱️</Text>
              <Text className="text-sm text-blue-100">Kilometraje Actual</Text>
            </View>
            <Text className="text-2xl font-bold text-white">{vehicleData.currentKm.toLocaleString()} km</Text>
          </View>

          <View className="bg-white/20 rounded-lg p-3">
            <Text className="text-xs text-blue-100 mb-1">Placa</Text>
            <Text className="text-lg font-semibold text-white">{vehicleData.plate}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Upcoming Services Section */}
      <View className="mb-4">
        <View className="flex-row items-center gap-2 mb-4">
          <Text className="text-lg">📅</Text>
          <Text className="text-lg font-semibold text-gray-800">Próximos Servicios</Text>
        </View>

        {upcomingServices.length === 0 ? (
          <View className="bg-white rounded-lg p-8 items-center border border-gray-200">
            <Text className="text-4xl mb-3">📌</Text>
            <Text className="text-gray-500 text-center">No hay servicios programados</Text>
          </View>
        ) : (
          <FlatList
            data={upcomingServices}
            renderItem={renderServiceCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Quick Actions */}
      <View className="mt-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Opciones rápidas</Text>
        <TouchableOpacity
          onPress={() => router.push('/(user)/appointments')}
          className="bg-gray-100 p-4 rounded-lg mb-3 flex-row items-center justify-between"
        >
          <Text className="text-gray-800 font-semibold">📅 Citas</Text>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(user)/services')}
          className="bg-gray-100 p-4 rounded-lg mb-3 flex-row items-center justify-between"
        >
          <Text className="text-gray-800 font-semibold">🔧 Servicios</Text>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(user)/expenses')}
          className="bg-gray-100 p-4 rounded-lg flex-row items-center justify-between"
        >
          <Text className="text-gray-800 font-semibold">💰 Gastos</Text>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default UserHomeScreen
export { UserHomeScreen }

