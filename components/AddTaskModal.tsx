import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, Pressable, StyleSheet } from 'react-native';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export default function AddTaskModal({ visible, onClose, onSubmit }: AddTaskModalProps) {
  const [text, setText] = useState('');

  function handleSubmit() {
    if (text.trim() === '') return;
    onSubmit(text);
    setText(''); // Reset input text on successful submit
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/* Outer Pressable dismisses modal when tapping the backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Inner Pressable catches taps so card interaction doesn't close modal */}
        <Pressable style={styles.card} onPress={() => {}}>
          <TextInput
            style={styles.input}
            placeholder="Enter Task"
            placeholderTextColor="#A0AEC0"
            value={text}
            onChangeText={setText}
            autoFocus
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8,
    padding: 10, 
    marginBottom: 16,
    fontSize: 16,
    color: '#2D3748',
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    gap: 16,
    alignItems: 'center',
  },
  cancelText: { 
    color: '#5A6472', 
    fontWeight: 'bold', 
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2E5BBA', 
    borderRadius: 8,
    paddingHorizontal: 20, 
    justifyContent: 'center',
    height: 40,
  },
  addButtonText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
});