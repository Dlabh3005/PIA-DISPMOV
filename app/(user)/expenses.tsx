import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../src/config/firebase";
import {
  Appointment,
  AppointmentsService,
} from "../../src/services/AppointmentsService";
import { PRICE_MAP, SERVICE_CATALOG } from "../../src/constants/serviceCatalog";

// ─── Constantes ────────────────────────────────────────────────────────────────

const AVAILABLE_SERVICES = [
  "Todos",
  ...SERVICE_CATALOG.map((s) => s.name),
];

const STATUS_LABELS: Record<string, string> = {
  confirmed: "✅ Confirmada",
  pending: "⏳ Pendiente",
  rejected: "❌ Rechazada",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#22C55E",
  pending: "#F59E0B",
  rejected: "#EF4444",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────


/** Convierte "YYYY-MM-DD" → "Mes YYYY" en español */
const isoToMonthLabel = (isoDate: string): string => {
  const [year, month] = isoDate.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Agrupa un array de citas por mes ("Mes YYYY"), ordenado más reciente primero */
const groupByMonth = (
  appointments: Appointment[]
): { title: string; data: Appointment[] }[] => {
  const map = new Map<string, Appointment[]>();

  // Guard: algunas citas antiguas pueden no tener dateISO definido
  const sorted = [...appointments].sort((a, b) =>
    (b.dateISO ?? "").localeCompare(a.dateISO ?? "")
  );

  for (const appt of sorted) {
    // Si no tiene dateISO, se agrupa en "Sin fecha"
    const key = appt.dateISO ? isoToMonthLabel(appt.dateISO) : "Sin fecha";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(appt);
  }

  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
};

// ─── Pantalla principal ─────────────────────────────────────────────────────────

const ExpensesScreen = () => {
  const user = auth.currentUser;

  // ── Estado ──
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedService, setSelectedService] = useState("Todos");
  const [dateFrom, setDateFrom] = useState("");   // "YYYY-MM-DD"
  const [dateTo, setDateTo] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  // inputs temporales dentro del modal
  const [tempFrom, setTempFrom] = useState("");
  const [tempTo, setTempTo] = useState("");

  // ── Suscripción Firebase — Citas ──
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = AppointmentsService.subscribeUserAppointments(
      user.uid,
      (items) => {
        setAllAppointments(items);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);


  // ── Filtrado en frontend ──
  const filtered = useMemo(() => {
    return allAppointments.filter((appt) => {
      // Filtro por tipo de servicio
      if (selectedService !== "Todos" && appt.serviceName !== selectedService)
        return false;
      // Filtro por rango de fechas — guard si dateISO es undefined
      const iso = appt.dateISO ?? "";
      if (dateFrom && iso < dateFrom) return false;
      if (dateTo && iso > dateTo) return false;
      return true;
    });
  }, [allAppointments, selectedService, dateFrom, dateTo]);

  // ── Total (precio del catálogo estático) ──
  const totalCost = useMemo(
    () => filtered.reduce((sum, a) => sum + (PRICE_MAP[a.serviceName] ?? a.cost ?? 0), 0),
    [filtered]
  );

  // ── Datos agrupados por mes para SectionList ──
  const sections = useMemo(() => groupByMonth(filtered), [filtered]);

  // ── Limpiar filtros ──
  const clearFilters = useCallback(() => {
    setSelectedService("Todos");
    setDateFrom("");
    setDateTo("");
    setTempFrom("");
    setTempTo("");
  }, []);

  const applyDateFilter = useCallback(() => {
    setDateFrom(tempFrom.trim());
    setDateTo(tempTo.trim());
    setFilterModalVisible(false);
  }, [tempFrom, tempTo]);

  const hasActiveFilters =
    selectedService !== "Todos" || dateFrom !== "" || dateTo !== "";

  // ── Render de cada cita ──
  const renderItem = ({ item }: { item: Appointment }) => {
    const statusColor = STATUS_COLORS[item.status] ?? "#6B7280";

    return (
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
          borderLeftWidth: 4,
          borderLeftColor: statusColor,
        }}
      >
        {/* Fila superior: nombre + badge de estado */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: "#1F2937", flex: 1, marginRight: 8 }}>
            {item.serviceName}
          </Text>
          <View style={{ backgroundColor: statusColor + "22", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
            <Text style={{ color: statusColor, fontSize: 11, fontWeight: "700" }}>
              {STATUS_LABELS[item.status] ?? item.status}
            </Text>
          </View>
        </View>

        {/* Fecha y hora */}
        <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 2 }}>
          📅 {item.date}  ·  🕐 {item.time}
        </Text>

        {/* Kilometraje al servicio */}
        {item.mileageAtService !== undefined && (
          <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 2 }}>
            🛣️ {item.mileageAtService.toLocaleString()} km al servicio
          </Text>
        )}

        {/* Costo del catálogo estático */}
        {(() => {
          const displayCost = PRICE_MAP[item.serviceName] ?? item.cost;
          return displayCost !== undefined && displayCost > 0 ? (
            <Text style={{ color: "#2563EB", fontSize: 16, fontWeight: "800", marginTop: 6 }}>
              ${displayCost.toLocaleString("es-MX")} MXN
            </Text>
          ) : (
            <Text style={{ color: "#9CA3AF", fontSize: 13, fontStyle: "italic", marginTop: 6 }}>
              Sin precio registrado
            </Text>
          );
        })()}
      </View>
    );
  };

  // ── Encabezado de sección (mes) ──
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: 18,
        marginBottom: 10,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
      <View
        style={{
          backgroundColor: "#EFF6FF",
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 99,
          marginHorizontal: 10,
        }}
      >
        <Text style={{ color: "#2563EB", fontWeight: "700", fontSize: 13 }}>
          {section.title}
        </Text>
      </View>
      <View style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
    </View>
  );

  // ── Pantalla de carga ──
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, color: "#6B7280" }}>Cargando bitácora…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>

      {/* ── Header con totales y filtros ── */}
      <View
        style={{
          backgroundColor: "#2563EB",
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 28,
        }}
      >
        <Text style={{ color: "#BFDBFE", fontSize: 13, marginBottom: 4 }}>Total gastado</Text>
        <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800" }}>
          ${totalCost.toLocaleString("es-MX")} MXN
        </Text>
        <Text style={{ color: "#93C5FD", fontSize: 13, marginTop: 4 }}>
          {filtered.length} servicio{filtered.length !== 1 ? "s" : ""} · {sections.length} mes{sections.length !== 1 ? "es" : ""}
        </Text>

        {/* Botón de filtros */}
        <View style={{ flexDirection: "row", marginTop: 16, gap: 10 }}>
          <TouchableOpacity
            onPress={() => {
              setTempFrom(dateFrom);
              setTempTo(dateTo);
              setFilterModalVisible(true);
            }}
            style={{
              backgroundColor: hasActiveFilters ? "#FEF3C7" : "rgba(255,255,255,0.2)",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 99,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text style={{ color: hasActiveFilters ? "#92400E" : "#fff", fontWeight: "700", fontSize: 13 }}>
              🔎 {hasActiveFilters ? "Filtros activos" : "Filtrar"}
            </Text>
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity
              onPress={clearFilters}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 99,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>✕ Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Chips de tipo de servicio ── */}
      <View style={{ backgroundColor: "#fff", paddingVertical: 10, paddingLeft: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={AVAILABLE_SERVICES}
          keyExtractor={(s) => s}
          renderItem={({ item: s }) => (
            <TouchableOpacity
              onPress={() => setSelectedService(s)}
              style={{
                marginRight: 8,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 99,
                backgroundColor: selectedService === s ? "#2563EB" : "#F3F4F6",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: selectedService === s ? "#fff" : "#374151",
                }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Lista agrupada por mes ── */}
      {sections.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
          <Text style={{ color: "#374151", fontWeight: "700", fontSize: 16 }}>Sin resultados</Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14, marginTop: 4 }}>
            Prueba con otro filtro o rango de fechas
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id!}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 }}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* ── Modal de filtro por rango de fechas ── */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#1F2937" }}>Filtrar por fecha</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={{ color: "#2563EB", fontWeight: "700" }}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: "#6B7280", fontWeight: "600", marginBottom: 6 }}>Desde (YYYY-MM-DD)</Text>
            <TextInput
              value={tempFrom}
              onChangeText={setTempFrom}
              placeholder="Ej: 2026-01-01"
              placeholderTextColor="#9CA3AF"
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                color: "#111827",
                fontSize: 15,
              }}
            />

            <Text style={{ color: "#6B7280", fontWeight: "600", marginBottom: 6 }}>Hasta (YYYY-MM-DD)</Text>
            <TextInput
              value={tempTo}
              onChangeText={setTempTo}
              placeholder="Ej: 2026-12-31"
              placeholderTextColor="#9CA3AF"
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                padding: 14,
                marginBottom: 24,
                color: "#111827",
                fontSize: 15,
              }}
            />

            <TouchableOpacity
              onPress={applyDateFilter}
              style={{ backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 16 }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "800", fontSize: 16 }}>
                Aplicar filtro
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExpensesScreen;
