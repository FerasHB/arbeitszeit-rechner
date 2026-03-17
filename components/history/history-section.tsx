import React from "react";
import { Text, View } from "react-native";
import { WorkEntry } from "../../storage/workEntries";
import HistoryCard from "./history-card";

type Props = {
  title: string;
  items: WorkEntry[];
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

export default function HistorySection({
  title,
  items,
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
  if (items.length === 0) return null;

  return (
    <View style={{ marginTop: 18 }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "900",
          marginBottom: 10,
        }}
      >
        {title}
      </Text>

      {items.map((item) => (
        <HistoryCard
          key={item.id}
          item={item}
          editingId={editingId}
          editStartTime={editStartTime}
          editPause={editPause}
          editActualEnd={editActualEnd}
          setEditStartTime={setEditStartTime}
          setEditPause={setEditPause}
          setEditActualEnd={setEditActualEnd}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onCancelEdit={onCancelEdit}
          formatDate={formatDate}
          calculateWorkedHours={calculateWorkedHours}
        />
      ))}
    </View>
  );
}
