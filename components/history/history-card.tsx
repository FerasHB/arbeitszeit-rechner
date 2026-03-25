import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Colors } from "../../constants/theme";
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

  const diffColor = !item.diff
    ? Colors.textMuted
    : item.diff.startsWith("+")
      ? Colors.success
      : item.diff.startsWith("-")
        ? Colors.danger
        : Colors.textMuted;

  const workedHours = calculateWorkedHours(
    item.startTime,
    item.actualEnd,
    item.pause,
  );

  const renderRightActions = () => {
    return (
      <View style={styles.swipeWrapper}>
        <Pressable
          onPress={() => onDelete(item.id)}
          style={({ pressed }) => [
            styles.deleteSwipeButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.deleteSwipeEmoji}>🗑️</Text>
          <Text style={styles.deleteSwipeText}>Löschen</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={36}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>

          <Pressable
            onPress={() => onEdit(item)}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.editEmoji}>⚙️</Text>
          </Pressable>
        </View>

        {isEditing ? (
          <View style={styles.editBox}>
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

            <View style={styles.editButtonsRow}>
              <Pressable
                onPress={() => onUpdate(item)}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.saveButtonText}>Speichern</Text>
              </Pressable>

              <Pressable
                onPress={onCancelEdit}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.infoBox}>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{item.startTime}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.timeText}>
                {item.actualEnd || item.plannedEnd}
              </Text>
            </View>

            <Text style={styles.metaText}>
              Pause {item.pause} Min. · {workedHours} h
            </Text>

            {!!item.diff && (
              <Text style={[styles.diffText, { color: diffColor }]}>
                {item.diff}
              </Text>
            )}
          </View>
        )}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  swipeWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 8,
  },
  deleteSwipeButton: {
    width: 82,
    minHeight: 84,
    backgroundColor: "rgba(239,68,68,0.14)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.28)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  deleteSwipeEmoji: {
    fontSize: 18,
  },
  deleteSwipeText: {
    color: Colors.danger,
    fontWeight: "900",
    fontSize: 12,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  date: {
    color: Colors.text,
    fontWeight: "800",
    fontSize: 13,
  },

  editButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.card2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  editEmoji: {
    fontSize: 14,
  },

  infoBox: {
    gap: 2,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  timeText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  arrow: {
    color: Colors.textMuted,
    marginHorizontal: 6,
    fontSize: 13,
  },
  metaText: {
    color: Colors.textSoft,
    fontSize: 12,
    marginTop: 4,
  },
  diffText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "900",
  },

  editBox: {
    marginTop: 8,
    gap: 10,
  },
  editButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },

  saveButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 13,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: Colors.card2,
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: "800",
    fontSize: 13,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});
