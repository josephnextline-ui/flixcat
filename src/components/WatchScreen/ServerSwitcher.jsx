import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Server } from "lucide-react-native";

export function ServerSwitcher({ providers, providerIdx, onSelectProvider }) {
  const active = providers[providerIdx];
  return (
    <View
      style={{
        backgroundColor: "#050505",
        borderBottomWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        paddingVertical: 10,
      }}
    >
      {/* Label row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 14,
          marginBottom: 8,
        }}
      >
        <Server size={11} color="#4a4a4a" />
        <Text
          style={{
            color: "#4a4a4a",
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Server
        </Text>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.04)",
            marginLeft: 6,
          }}
        />
        <Text
          style={{
            color: active?.color || "#6B6B6B",
            fontSize: 10,
            fontWeight: "700",
          }}
        >
          {active?.name}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 12,
          gap: 7,
        }}
      >
        {providers.map((p, idx) => {
          const isActive = idx === providerIdx;
          return (
            <TouchableOpacity
              key={p.name}
              onPress={() => onSelectProvider(idx)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 13,
                paddingVertical: 7,
                borderRadius: 10,
                backgroundColor: isActive ? p.color : "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: isActive ? p.color : "rgba(255,255,255,0.07)",
              }}
            >
              {/* Status dot */}
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.7)"
                    : "#22c55e",
                }}
              />
              <Text
                style={{
                  color: isActive ? "#fff" : "#9ca3af",
                  fontSize: 12,
                  fontWeight: isActive ? "800" : "500",
                  letterSpacing: 0.2,
                }}
              >
                {p.name}
              </Text>
              {/* Number badge */}
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.06)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: isActive ? "#fff" : "#555",
                    fontSize: 9,
                    fontWeight: "800",
                  }}
                >
                  {idx + 1}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
