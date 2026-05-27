import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Subtitles, X, Check } from "lucide-react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function SubtitlePicker({
  visible,
  onClose,
  subtitles,
  selectedSubtitleIdx,
  onSelectSubtitle,
  insets,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              backgroundColor: "#111",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: insets.bottom + 16,
              maxHeight: SCREEN_HEIGHT * 0.55,
            }}
          >
            {/* Handle bar */}
            <View
              style={{
                alignItems: "center",
                paddingTop: 12,
                paddingBottom: 6,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#333",
                }}
              />
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: "#1f1f1f",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Subtitles size={16} color="#E50914" />
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                >
                  Subtitles
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <X size={20} color="#6B6B6B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Off option */}
              <TouchableOpacity
                onPress={() => {
                  onSelectSubtitle(null);
                  onClose();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderColor: "#1a1a1a",
                  backgroundColor:
                    selectedSubtitleIdx === null
                      ? "rgba(229,9,20,0.08)"
                      : "transparent",
                }}
              >
                <Text
                  style={{
                    color: selectedSubtitleIdx === null ? "#E50914" : "#9ca3af",
                    fontSize: 15,
                    fontWeight: selectedSubtitleIdx === null ? "700" : "400",
                  }}
                >
                  Off
                </Text>
                {selectedSubtitleIdx === null && (
                  <Check size={16} color="#E50914" />
                )}
              </TouchableOpacity>

              {/* Subtitle tracks */}
              {subtitles.length === 0 ? (
                <View style={{ padding: 24, alignItems: "center" }}>
                  <Text style={{ color: "#4a4a4a", fontSize: 13 }}>
                    No subtitles found for this server
                  </Text>
                  <Text
                    style={{
                      color: "#333",
                      fontSize: 11,
                      marginTop: 6,
                      textAlign: "center",
                    }}
                  >
                    Try a different server — some embed subtitles in the stream
                  </Text>
                </View>
              ) : (
                subtitles.map((sub, idx) => {
                  const isActive = selectedSubtitleIdx === idx;
                  return (
                    <TouchableOpacity
                      key={sub.url}
                      onPress={() => {
                        onSelectSubtitle(idx);
                        onClose();
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderColor: "#1a1a1a",
                        backgroundColor: isActive
                          ? "rgba(229,9,20,0.08)"
                          : "transparent",
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            color: isActive ? "#E50914" : "#fff",
                            fontSize: 15,
                            fontWeight: isActive ? "700" : "400",
                          }}
                        >
                          {sub.label}
                        </Text>
                        <Text
                          style={{
                            color: "#4a4a4a",
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          {sub.language.toUpperCase()}
                        </Text>
                      </View>
                      {isActive && <Check size={16} color="#E50914" />}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
