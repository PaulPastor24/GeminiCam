import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TaskItemProps {
  item: any;
  onToggle: (item: any) => void;
  onDelete: (id: any) => void;
}

export default function TaskItem({ item, onToggle, onDelete }: TaskItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(item)}
      onLongPress={() => onDelete(item.id)}
      delayLongPress={500}
    >
      <View style={styles.taskRow}>
        <MaterialIcons
          name={item.completed ? 'check-box' : 'check-box-outline-blank'}
          size={20}
          color={item.completed ? '#2E5BBA' : '#5A6472'}
        />
        <Text style={[
          styles.taskText,
          item.completed && styles.taskTextCompleted
        ]}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskText: {
    fontSize: 16,
    color: '#2D3748',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#A0AEC0',
  },
});