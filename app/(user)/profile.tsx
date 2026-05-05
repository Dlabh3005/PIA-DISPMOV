import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useUserProfile, Vehicle } from '../../hooks/useUserProfile'
import { authService } from '../../src/services/authService'

// ─── Sub-component: Loading skeleton ─────────────────────────────────────────
const LoadingCard = () => (
  <View className="bg-gray-100 p-5 rounded-2xl mb-4 items-center justify-center" style={{ minHeight: 120 }}>
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text className="text-gray-400 mt-3 text-sm">Cargando información...</Text>
  </View>
)

// ─── Sub-component: Error card ────────────────────────────────────────────────
const ErrorCard = ({ message }: { message: string }) => (
  <View className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-4 flex-row items-start">
    <Text className="text-red-500 text-lg mr-2">⚠️</Text>
    <View className="flex-1">
      <Text className="text-red-700 font-semibold text-sm">Error al cargar datos</Text>
      <Text className="text-red-500 text-sm mt-1">{message}</Text>
    </View>
  </View>
)

// ─── Sub-component: Info row ──────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="mb-3">
    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
      {label}
    </Text>
    <Text className="text-gray-800 text-base font-medium">{value}</Text>
  </View>
)

// ─── Sub-component: Vehicle card ─────────────────────────────────────────────
const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
  <View className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-3">
    <View className="flex-row items-center mb-3">
      <Text className="text-2xl mr-2">🚗</Text>
      <Text className="text-blue-800 font-bold text-base flex-1" numberOfLines={1}>
        {vehicle.model} {vehicle.year}
      </Text>
      {vehicle.status === 'approved' && (
        <View className="bg-green-100 px-2 py-1 rounded-full">
          <Text className="text-green-700 text-xs font-semibold">Aprobado</Text>
        </View>
      )}
      {vehicle.status === 'pending' && (
        <View className="bg-yellow-100 px-2 py-1 rounded-full">
          <Text className="text-yellow-700 text-xs font-semibold">Pendiente</Text>
        </View>
      )}
    </View>
    <View className="flex-row gap-4">
      <InfoRow label="Placa" value={vehicle.plate || '—'} />
      <InfoRow label="Kilometraje" value={`${vehicle.currentKm?.toLocaleString() ?? '—'} km`} />
    </View>
  </View>
)

// ─── Sub-component: No vehicle registered ────────────────────────────────────
const NoVehicleCard = ({ onAdd }: { onAdd: () => void }) => (
  <View className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-2xl mb-4 items-center">
    <Text className="text-4xl mb-3">🚘</Text>
    <Text className="text-gray-700 font-bold text-base mb-1">Sin vehículo registrado</Text>
    <Text className="text-gray-400 text-sm text-center mb-4">
      Aún no has agregado ningún vehículo a tu perfil. ¡Añade uno para comenzar!
    </Text>
    <TouchableOpacity
      onPress={onAdd}
      className="bg-blue-500 px-6 py-3 rounded-xl flex-row items-center"
      activeOpacity={0.8}
    >
      <Text className="text-white font-bold mr-2">+</Text>
      <Text className="text-white font-bold">Agregar vehículo</Text>
    </TouchableOpacity>
  </View>
)

// ─── Main screen ──────────────────────────────────────────────────────────────
const ProfileScreen = () => {
  const router = useRouter()
  const { user, vehicles, loading, error } = useUserProfile()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true)
            try {
              await authService.logout()
              router.replace('/login')
            } catch {
              Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.')
            } finally {
              setLoggingOut(false)
            }
          },
        },
      ]
    )
  }

  const handleAddVehicle = () => {
    // Navigate to vehicle registration screen
    router.push('/(user)/index')
  }

  // Avatar initials
  const initials = user?.email ? user.email[0].toUpperCase() : '?'

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header / Avatar ───────────────────────── */}
      <View className="items-center mb-8">
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: '#3B82F6' }}
        >
          <Text className="text-white text-4xl font-bold">{initials}</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-800">Mi Perfil</Text>
        <Text className="text-gray-400 text-sm mt-1">Gestiona tu información personal</Text>
      </View>

      {/* ── Account info ─────────────────────────── */}
      <View className="mb-2">
        <Text className="text-gray-800 font-bold text-base mb-3">📧 Cuenta</Text>
        <View className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
          {loading ? (
            <LoadingCard />
          ) : error ? (
            <ErrorCard message={error} />
          ) : (
            <InfoRow
              label="Correo electrónico"
              value={user?.email ?? 'No disponible'}
            />
          )}
        </View>
      </View>

      {/* ── Divider ───────────────────────────────── */}
      <View className="h-px bg-gray-100 my-5" />

      {/* ── Vehicle info ─────────────────────────── */}
      <View className="mb-6">
        <Text className="text-gray-800 font-bold text-base mb-3">🚗 Mis vehículos</Text>

        {loading ? (
          <LoadingCard />
        ) : error ? (
          <ErrorCard message={error} />
        ) : vehicles.length === 0 ? (
          <NoVehicleCard onAdd={handleAddVehicle} />
        ) : (
          <>
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
            {/* Allow adding another vehicle */}
            <TouchableOpacity
              onPress={handleAddVehicle}
              className="border border-blue-300 py-3 rounded-2xl items-center mt-1"
              activeOpacity={0.7}
            >
              <Text className="text-blue-500 font-semibold text-sm">+ Agregar otro vehículo</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ── Logout button ─────────────────────────── */}
      <TouchableOpacity
        onPress={handleLogout}
        disabled={loggingOut}
        className="mt-2 bg-red-500 py-4 rounded-2xl shadow-sm flex-row items-center justify-center"
        activeOpacity={0.8}
      >
        {loggingOut ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text className="text-white text-center font-bold text-base">Cerrar sesión</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

export default ProfileScreen
