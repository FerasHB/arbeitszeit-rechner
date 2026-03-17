import React from "react";
import { Pressable, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { WorkEntry } from "../../storage/workEntries";
import LabeledInput from "../LabeledInput";

type Props = {
  item: WorkEntry;
  editingId: string | null;
  editStartTime: string;
  editPause: string;
  editActualEnd: string;
  setEditStartTime: (value: string) => void;
  setEditPause: (value: string) => void;
  setEditActualEnd: (value: string) => void;
  onEdit: (item: WorkEntry) => void;
  onDelete: (id: string) => void;
  onUpdate: (item: WorkEntry) => void;
  onCancelEdit: () => void;
  formatDate: (dateString: string) => string;
  calculateWorkedHours: (
    startTime: string,
    actualEnd?: string,
    pause?: string,
  ) => string;
};

export default function HistoryCard({
  item,
  editingId,
  editStartTime,
  editPause,
  editActualEnd,
  setEditStartTime,
  setEditPause,
  setEditActualEnd,
  onEdit,
  onDelete,
  onUpdate,
  onCancelEdit,
  formatDate,
  calculateWorkedHours,
}: Props) {
  const isEditing = editingId === item.id;
  const renderRightActions = () => {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Pressable
          onPress={() => onDelete(item.id)}
          style={({ pressed }) => ({
            width: 92,
            height: "100%",
            minHeight: 120,
            backgroundColor: "#dc2626",
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>
            Löschen
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={30}
    >
      <View
        style={{
          backgroundColor: "#1a1a1a",
          padding: 14,
          borderRadius: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#2a2a2a",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "900",
              fontSize: 16,
            }}
          >
            {formatDate(item.date)}
          </Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => onEdit(item)}
              style={({ pressed }) => ({
                backgroundColor: "#1d4ed8",
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 10,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
                Bearbeiten
              </Text>
            </Pressable>
          </View>
        </View>

        {isEditing ? (
          <View style={{ marginTop: 10, gap: 10 }}>
            <LabeledInput
              label="Startzeit"
              value={editStartTime}
              onChangeText={setEditStartTime}
              placeholder="08:30"
              keyboardType="numbers-and-punctuation"
            />

            <LabeledInput
              label="Pause"
              value={editPause}
              onChangeText={setEditPause}
              placeholder="30"
              keyboardType="number-pad"
            />

            <LabeledInput
              label="Tatsächliche Endzeit"
              value={editActualEnd}
              onChangeText={setEditActualEnd}
              placeholder="17:10"
              keyboardType="numbers-and-punctuation"
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
              <Pressable
                onPress={() => onUpdate(item)}
                style={{
                  flex: 1,
                  backgroundColor: "#166534",
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  Speichern
                </Text>
              </Pressable>

              <Pressable
                onPress={onCancelEdit}
                style={{
                  flex: 1,
                  backgroundColor: "#444",
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  Abbrechen
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "800",
                }}
              >
                {item.startTime}
              </Text>

              <Text
                style={{
                  color: "#9aa0a6",
                  marginHorizontal: 6,
                  fontSize: 16,
                }}
              >
                →
              </Text>

              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "800",
                }}
              >
                {item.actualEnd || item.plannedEnd}
              </Text>
            </View>

            <Text
              style={{
                color: "#9aa0a6",
                fontSize: 14,
                marginTop: 6,
              }}
            >
              Pause: {item.pause} min
            </Text>

            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "900",
                marginTop: 8,
              }}
            >
              Gearbeitet:{" "}
              {calculateWorkedHours(item.startTime, item.actualEnd, item.pause)}
            </Text>

            {!!item.diff && (
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 16,
                  fontWeight: "900",
                  color: item.diff.startsWith("+")
                    ? "#16a34a"
                    : item.diff.startsWith("-")
                      ? "#dc2626"
                      : "#9aa0a6",
                }}
              >
                {item.diff}
              </Text>
            )}
          </>
        )}
      </View>
    </Swipeable>
  );
}
