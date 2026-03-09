import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { ServicesService } from "../../src/services/servicesService";

function ServicesScreen() {

  const [services, setServices] = useState<any[]>([]);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {

    const unsubscribe = ServicesService.subscribeServices((data: any[]) => {
      setServices(data);
    });

    return unsubscribe;

  }, []);

  const toggleService = (id: string) => {
    if (expandedService === id) {
      setExpandedService(null);
    } else {
      setExpandedService(id);
    }
  };

  const renderService = ({ item }: { item: any }) => {

    const isExpanded = expandedService === item.id;

    return (
      <TouchableOpacity
        onPress={() => toggleService(item.id)}
        className="bg-white mx-6 mb-4 p-5 rounded-2xl shadow-sm border border-gray-100"
      >

        {/* Información del servicio */}
        <View className="flex-row items-center justify-between">

          <View className="flex-1">

            <Text className="text-xl font-bold text-gray-800 mb-1">
              {item.name}
            </Text>

            <Text className="text-gray-500 text-sm">
              ⏱️ Duración: {item.duration}
            </Text>

          </View>

          <View className="bg-green-100 px-3 py-2 rounded-lg">
            <Text className="text-green-700 font-bold">
              {item.price}
            </Text>
          </View>

        </View>

        {/* Área expandida */}
        {isExpanded && (

          <View className="mt-4 border-t border-gray-200 pt-4">

            <Text className="text-gray-600 mb-3">
              Agenda este servicio para tu vehículo.
            </Text>

            <TouchableOpacity
              className="bg-blue-500 py-3 rounded-xl items-center"
              onPress={() =>
                router.push({
                  pathname: "/appointments",
                  params: { service: item.name }
                })
              }
            >

              <Text className="text-white font-bold">
                📅 Agendar cita
              </Text>

            </TouchableOpacity>

          </View>

        )}

      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">

      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-8 px-6 rounded-b-3xl">

        <Text className="text-white text-3xl font-bold mb-2">
          Servicios
        </Text>

        <Text className="text-blue-100 text-base">
          Toca un servicio para agendar una cita
        </Text>

      </View>

      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 30
        }}
      />

    </View>
  );
}

export default ServicesScreen;