import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Component imports
import AddTaskModal from '../../components/AddTaskModal';
import TaskItem from '../../components/TaskItem';

// Configuration clients
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // 5.2 READ — Load Tasks from Cloud Database
  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error loading tasks:', error.message);
      return;
    }
    setTasks(data || []);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // 5.3 CREATE — Core Database Request Injection
  async function addTask(title: string) {
    const { error } = await supabase
      .from('tasks')
      .insert([{ title, completed: false }]);

    if (error) {
      Toast.show({ 
        type: 'error', 
        text1: 'Could not add task', 
        text2: error.message 
      });
      return;
    }

    setModalVisible(false); // Close UI entry layer
    loadTasks();            // Refresh dataset matching cloud state
    Toast.show({ 
      type: 'success', 
      text1: 'Task added successfully' 
    });
  }

  // 5.4 UPDATE — Toggle Completion Status
  async function toggleTask(item: any) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !item.completed })
      .eq('id', item.id);

    if (error) {
      Toast.show({ type: 'error', text1: 'Could not update status' });
      return;
    }
    loadTasks();
  }

  // 5.5 DELETE — Purge Row from Database
  async function deleteTask(id: any) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      Toast.show({ type: 'error', text1: 'Could not delete task' });
      return;
    }
    loadTasks();
    Toast.show({ 
      type: 'success', 
      text1: 'Task deleted' 
    });
  }

  return (
    <View style={styles.container}>
      {/* Header Visual Region with Add Button */}
      <View style={headerStyles.header}>
        <Text style={headerStyles.title}>TaskFlow</Text>
        <TouchableOpacity 
          style={headerStyles.iconButton} 
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add-circle" size={32} color="#2E5BBA" />
        </TouchableOpacity>
      </View>

      {/* 5.6 Native Recycler FlatList */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TaskItem 
            item={item} 
            onToggle={toggleTask} 
            onDelete={deleteTask} 
          />
        )}
      />

      {/* 7.4 Overlay Input Modal Sheet */}
      <AddTaskModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={addTask}
      />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2A44',
  },
  iconButton: {
    padding: 4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
});