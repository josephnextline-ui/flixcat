import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Clapperboard, Shield, Tv, Zap } from "lucide-react-native";

const SERVERS = ["VidLink", "VidFast", "VidNest", "Videasy", "VidZee"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const Card = ({ children, style }) => (
    <View
      style={{
        backgroundColor: "#141414",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#2a2a2a",
        padding: 16,
        marginBottom: 12,
        ...style,
      }}
    >
      {children}
    </View>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: "#0a0a0a", paddingTop: insets.top }}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {/* Brand header */}
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: "#E50914",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              shadowColor: "#E50914",
              shadowOpacity: 0.5,
              shadowRadius: 16,
            }}
          >
            <Clapperboard size={36} color="white" />
          </View>
          <Text style={{ fontSize: 32, fontWeight: "900", color: "#fff" }}>
            Flix<Text style={{ color: "#E50914" }}>Cat</Text>
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
            Your purr-fect streaming destination
          </Text>
        </View>

        {/* Ad blocking badge */}
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#14532d",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Shield color="#22c55e" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                Ad Blocker Active
              </Text>
              <Text style={{ color: "#6b7280", fontSize: 12 }}>
                Popup and redirect ads are blocked
              </Text>
            </View>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#22c55e",
              }}
            />
          </View>
        </Card>

        {/* Streaming servers */}
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Tv color="#E50914" size={20} />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Streaming Servers
            </Text>
          </View>
          {SERVERS.map((server, i) => (
            <View
              key={server}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 8,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: "#2a2a2a",
              }}
            >
              <Text style={{ color: "#d1d5db", fontSize: 14 }}>{server}</Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
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
                  style={{ color: "#22c55e", fontSize: 11, fontWeight: "600" }}
                >
                  Online
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Speed hint */}
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <Zap color="#f59e0b" size={20} />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Tips
            </Text>
          </View>
          <Text style={{ color: "#9ca3af", fontSize: 13, lineHeight: 20 }}>
            If a video doesn't load, switch to a different server using the
            "Change Server" button on the player.{"\n\n"}
            Popup ads are automatically blocked. If you see any overlays inside
            the player, they are part of the video player's own UI.
          </Text>
        </Card>

        {/* Powered by */}
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Text style={{ color: "#374151", fontSize: 12 }}>
            Powered by TMDB · v1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
