import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft, Heart } from "lucide-react-native";

export function WatchHeader({
  insets,
  onBack,
  title,
  inWatchlist,
  onToggleWatchlist,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: insets.top + 6,
        paddingBottom: 10,
        paddingHorizontal: 16,
        backgroundColor: "#000",
        zIndex: 10,
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(255,255,255,0.08)",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <ArrowLeft size={18} color="#fff" />
      </TouchableOpacity>
      <Text
        style={{ color: "#fff", fontSize: 15, fontWeight: "700", flex: 1 }}
        numberOfLines={1}
      >
        {title}
      </Text>
      <TouchableOpacity
        onPress={onToggleWatchlist}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: inWatchlist
            ? "rgba(229,9,20,0.2)"
            : "rgba(255,255,255,0.08)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Heart
          size={18}
          color={inWatchlist ? "#E50914" : "#9ca3af"}
          fill={inWatchlist ? "#E50914" : "none"}
        />
      </TouchableOpacity>
    </View>
  );
}
