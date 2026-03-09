import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { Tabs } from 'expo-router'
import React from 'react'

const TabsLayout = () => {
  const screenOptions: BottomTabNavigationOptions = {
    headerShown: true,
    tabBarActiveTintColor: '#3b82f6',
    tabBarInactiveTintColor: '#9ca3af',
  }

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: 'Mi Perfil',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Citas',
          headerTitle: 'Mis Citas',
          tabBarLabel: 'Citas',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Servicios',
          headerTitle: 'Servicios',
          tabBarLabel: 'Servicios',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔧</Text>,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Bitacora de Gastos',
          headerTitle: 'Bitacora',
          tabBarLabel: 'Bitacora',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💰</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tabs>
  )
}

import { Text } from 'react-native'

export default TabsLayout