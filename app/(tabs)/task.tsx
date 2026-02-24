import { useAppColors, useThemeColors } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Task {
  id: string;
  title: string;
  date?: Date;
  completed: boolean;
  createdAt: Date;
}

export default function TaskScreen() {
  const colors = useAppColors();
  const themeColors = useThemeColors();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskTitle('');
    setSelectedDate(new Date());
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setSelectedDate(task.date || new Date());
    setShowModal(true);
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (editingTask) {
      // Update existing task
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === editingTask.id
            ? { ...task, title: taskTitle.trim(), date: selectedDate }
            : task
        )
      );
    } else {
      // Add new task
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskTitle.trim(),
        date: selectedDate,
        completed: false,
        createdAt: new Date(),
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
    }

    setShowModal(false);
    setTaskTitle('');
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId)),
        },
      ]
    );
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isTaskOverdue = (task: Task) => {
    if (!task.date || task.completed) return false;
    return task.date < new Date();
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={[
      styles.taskItem,
      { 
        backgroundColor: colors.background,
        borderColor: item.completed ? colors.icon + '30' : 
                  isTaskOverdue(item) ? '#E74C3C' : colors.icon + '40'
      }
    ]}>
      <TouchableOpacity
        style={styles.taskCheckbox}
        onPress={() => handleToggleComplete(item.id)}
      >
        <Ionicons
          name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.completed ? themeColors.primary : colors.icon}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => handleEditTask(item)}
      >
        <Text style={[
          styles.taskTitle,
          { 
            color: item.completed ? colors.icon : colors.text,
            textDecorationLine: item.completed ? 'line-through' : 'none'
          }
        ]}>
          {item.title}
        </Text>
        {item.date && (
          <Text style={[
            styles.taskDate,
            { 
              color: isTaskOverdue(item) ? '#E74C3C' : colors.icon,
              fontWeight: isTaskOverdue(item) ? '600' : 'normal'
            }
          ]}>
            {isTaskOverdue(item) ? 'Overdue: ' : ''}{formatDate(item.date)}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTask(item.id)}
      >
        <Ionicons name="trash" size={20} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: themeColors.primary }]}
          onPress={handleAddTask}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No tasks yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Tap the + button to add your first task
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add/Edit Task Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </Text>

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
              placeholder="Task title"
              placeholderTextColor={colors.icon}
              value={taskTitle}
              onChangeText={setTaskTitle}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.dateButton, { borderColor: colors.icon }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.icon} />
              <Text style={[styles.dateButtonText, { color: colors.text }]}>
                Due Date: {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event: any, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setSelectedDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
                style={styles.dateTimePicker}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setTaskTitle('');
                  setEditingTask(null);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: themeColors.primary }]}
                onPress={handleSaveTask}
              >
                <Text style={styles.buttonText}>
                  {editingTask ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskCheckbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  dateTimePicker: {
    marginTop: 8,
  },
  datePickerButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  datePickerText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    // backgroundColor will be set dynamically
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
