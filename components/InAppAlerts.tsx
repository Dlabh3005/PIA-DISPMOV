import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  SlideInUp,
  SlideOutUp,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../src/config/firebase";
import { AlertsService, AppAlert } from "../src/services/AlertsService";

const { width } = Dimensions.get("window");

export const InAppAlerts = () => {
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<AppAlert | null>(null);
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  // Suscribirse a Firebase
  useEffect(() => {
    if (!user) return;

    const unsubscribe = AlertsService.subscribeToUnreadAlerts(user.uid, (newAlerts) => {
      setAlerts(newAlerts);
    });

    return () => unsubscribe();
  }, [user]);

  // Manejar la cola de alertas
  useEffect(() => {
    if (!currentAlert && alerts.length > 0) {
      // Mostrar la primera alerta de la cola
      setCurrentAlert(alerts[0]);
    }
  }, [alerts, currentAlert]);

  // Auto-descarte después de 4 segundos
  useEffect(() => {
    if (currentAlert) {
      const timer = setTimeout(() => {
        handleDismiss(currentAlert.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentAlert]);

  const handleDismiss = async (alertId: string) => {
    // 1. Ocultar la alerta actual de la UI inmediatamente
    setCurrentAlert(null);
    // 2. Marcar como leída en Firestore para que no vuelva a aparecer
    await AlertsService.markAsRead(alertId);
  };

  if (!currentAlert) return null;

  // Definir estilos según el tipo
  let bgColor = "bg-blue-600";
  let iconName: keyof typeof Ionicons.glyphMap = "information-circle";

  if (currentAlert.type === "success") {
    bgColor = "bg-green-600";
    iconName = "checkmark-circle";
  } else if (currentAlert.type === "error") {
    bgColor = "bg-red-600";
    iconName = "close-circle";
  }

  return (
    <Animated.View
      entering={SlideInUp.duration(400)}
      exiting={SlideOutUp.duration(300).withCallback((finished) => {
        "worklet";
        if (finished) {
          // Callback al terminar la animación si es necesario
        }
      })}
      style={{
        position: "absolute",
        top: insets.top + 10,
        left: 16,
        right: 16,
        zIndex: 9999, // Asegurar que esté por encima de todo
        elevation: 10,
        width: width - 32,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleDismiss(currentAlert.id)}
        className={`${bgColor} p-4 rounded-2xl flex-row items-center shadow-lg`}
      >
        <Ionicons name={iconName} size={28} color="white" />
        <View className="ml-3 flex-1">
          <Text className="text-white font-bold text-base mb-0.5">
            {currentAlert.title}
          </Text>
          <Text className="text-white text-sm opacity-90 leading-tight">
            {currentAlert.message}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
