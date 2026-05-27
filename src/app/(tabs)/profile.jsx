import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Shield, Tv, Zap, CheckCircle } from "lucide-react-native";

const SERVERS = ["VidLink", "VidFast", "VidNest", "Videasy", "VidZee"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const Card = ({ children, style }) => (
    <View
      style={[
        {
          backgroundColor: "#0f0f0f",
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "#1f1f1f",
          marginBottom: 14,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {/* Brand header */}
        <View style={{ alignItems: "center", paddingVertical: 28 }}>
          <Text
            style={{
              color: "#E50914",
              fontSize: 36,
              fontWeight: "900",
              letterSpacing: -1,
            }}
          >
            FlixCat
          </Text>
          <Text style={{ color: "#6B6B6B", fontSize: 14, marginTop: 4 }}>
            Your purr-fect streaming destination
          </Text>
        </View>

        {/* Ad blocking badge */}
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={18} color="#22c55e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                Ad Blocker Active
              </Text>
              <Text style={{ color: "#6B6B6B", fontSize: 12, marginTop: 2 }}>
                Popup and redirect ads are blocked
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: "rgba(34, 197, 94, 0.3)",
              }}
            >
              <Text
                style={{ color: "#22c55e", fontSize: 11, fontWeight: "700" }}
              >
                ON
              </Text>
            </View>
          </View>
        </Card>

        {/* Streaming servers */}
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Tv size={16} color="#E50914" />
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              Streaming Servers
            </Text>
          </View>
          {SERVERS.map((server, i) => (
            <View
              key={server}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
                borderTopWidth: i === 0 ? 0 : 1,
                borderColor: "#1f1f1f",
              }}
            >
              <Text style={{ color: "#d1d5db", fontSize: 14 }}>{server}</Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#22c55e",
                  }}
                />
                <Text
                  style={{ color: "#22c55e", fontSize: 12, fontWeight: "600" }}
                >
                  Online
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Tips */}
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Zap size={16} color="#f59e0b" />
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              Tips
            </Text>
          </View>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ color: "#6B6B6B", marginTop: 1 }}>-</Text>
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 13,
                  lineHeight: 20,
                  flex: 1,
                }}
              >
                If a video doesn't load, switch to a different server using the
                "Change Server" button on the player.
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ color: "#6B6B6B", marginTop: 1 }}>-</Text>
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 13,
                  lineHeight: 20,
                  flex: 1,
                }}
              >
                Popup ads are automatically blocked. If you see any overlays
                inside the player, they are part of the video player's own UI.
              </Text>
            </View>
          </View>
        </Card>

        {/* Footer */}
        <Text
          style={{
            color: "#2a2a2a",
            fontSize: 12,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Powered by TMDB · v1.0
        </Text>
      </ScrollView>
    </View>
  );
}
