/**
 * Спрощений компонент вкладки нотаток
 * 
 * Цей компонент не використовує withObservables, а працює з базою даних напряму
 * Переписаний як класовий компонент для сумісності з Bridgeless режимом
 */

import React from 'react';
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Button } from '../../components/ui';
import Text from '../../components/Text';
import { Edit, Trash2 } from 'lucide-react-native';
import { database, notesCollection } from '../../database';
import { Q } from '@nozbe/watermelondb';

interface SimpleProjectNotesTabProps {
  projectId: string;
  onRefresh?: () => void;
}

interface SimpleProjectNotesTabState {
  loading: boolean;
  notesLoading: boolean;
  notes: any[];
  noteContent: string;
  noteTitle: string;
  editingNote: string | null;
}

// Використовуємо класовий компонент замість функціонального для уникнення проблем з displayName
class SimpleProjectNotesTab extends React.Component<SimpleProjectNotesTabProps, SimpleProjectNotesTabState> {
  // Явно встановлюємо displayName
  static displayName = 'SimpleProjectNotesTab';
  
  constructor(props: SimpleProjectNotesTabProps) {
    super(props);
    this.state = {
      loading: false,
      notesLoading: true,
      notes: [],
      noteContent: '',
      noteTitle: '',
      editingNote: null
    };
  }
  
  // Завантаження нотаток при завантаженні компонента
  componentDidMount() {
    this.fetchNotes();
  }
  
  componentDidUpdate(prevProps: SimpleProjectNotesTabProps) {
    if (prevProps.projectId !== this.props.projectId) {
      this.fetchNotes();
    }
  }

  // Завантаження нотаток
  fetchNotes = async () => {
    try {
      this.setState({ notesLoading: true });
      
      // Отримуємо нотатки для проєкту напряму з бази даних
      const notesRecords = await database.collections
        .get('notes')
        .query(
          Q.where('project_id', this.props.projectId),
          Q.sortBy('updated_at', 'desc')
        )
        .fetch();
      
      // Перетворюємо записи в масив об'єктів
      const notesData = notesRecords.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }));
      
      this.setState({ notes: notesData, notesLoading: false });
    } catch (err) {
      console.error('Помилка при завантаженні нотаток:', err);
      this.setState({ notesLoading: false });
    }
  };

  // Створення нової нотатки
  createNote = async () => {
    const { noteTitle, noteContent } = this.state;
    if (!noteTitle.trim()) {
      Alert.alert('Помилка', 'Введіть назву нотатки');
      return;
    }

    try {
      this.setState({ loading: true });
      await database.action(async () => {
        await notesCollection.create(note => {
          note.title = noteTitle;
          note.content = noteContent;
          note.project.set(database.get('projects').find(this.props.projectId));
        });
      });

      // Очищення форми
      this.setState({ 
        noteTitle: '',
        noteContent: '',
        loading: false
      });
      
      // Оновлення списку нотаток
      this.fetchNotes();
      
      if (this.props.onRefresh) this.props.onRefresh();
      
      Alert.alert('Успіх', 'Нотатку створено');
    } catch (error) {
      console.error('Помилка при створенні нотатки:', error);
      this.setState({ loading: false });
      Alert.alert('Помилка', 'Не вдалося створити нотатку');
    }
  };

  // Редагування нотатки
  updateNote = async (noteId: string) => {
    const { noteTitle, noteContent } = this.state;
    if (!noteTitle.trim()) {
      Alert.alert('Помилка', 'Введіть назву нотатки');
      return;
    }

    try {
      this.setState({ loading: true });
      await database.action(async () => {
        const noteToUpdate = await notesCollection.find(noteId);
        await noteToUpdate.update(note => {
          note.title = noteTitle;
          note.content = noteContent;
        });
      });

      // Очищення режиму редагування
      this.setState({
        noteTitle: '',
        noteContent: '',
        editingNote: null,
        loading: false
      });
      
      // Оновлення списку нотаток
      this.fetchNotes();
      
      if (this.props.onRefresh) this.props.onRefresh();
      
      Alert.alert('Успіх', 'Нотатку оновлено');
    } catch (error) {
      console.error('Помилка при оновленні нотатки:', error);
      this.setState({ loading: false });
      Alert.alert('Помилка', 'Не вдалося оновити нотатку');
    }
  };

  // Видалення нотатки
  deleteNote = async (noteId: string) => {
    Alert.alert(
      'Підтвердження',
      'Ви впевнені, що хочете видалити цю нотатку?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { 
          text: 'Видалити', 
          style: 'destructive',
          onPress: async () => {
            try {
              this.setState({ loading: true });
              await database.action(async () => {
                const noteToDelete = await notesCollection.find(noteId);
                await noteToDelete.markAsDeleted();
                await noteToDelete.destroyPermanently();
              });
              
              this.setState({ loading: false });
              // Оновлення списку нотаток
              this.fetchNotes();
              
              if (this.props.onRefresh) this.props.onRefresh();
              
              Alert.alert('Успіх', 'Нотатку видалено');
            } catch (error) {
              console.error('Помилка при видаленні нотатки:', error);
              this.setState({ loading: false });
              Alert.alert('Помилка', 'Не вдалося видалити нотатку');
            }
          }
        },
      ]
    );
  };

  // Почати редагування нотатки
  startEditingNote = (note: any) => {
    this.setState({
      editingNote: note.id,
      noteTitle: note.title,
      noteContent: note.content
    });
  };

  render() {
    const { loading, notesLoading, notes, noteTitle, noteContent, editingNote } = this.state;
    
    return (
      <View style={{flex: 1}}>
        <ScrollView style={styles.container}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6B8A5E" />
          </View>
        )}
        
        {/* Назва вкладки */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Мої нотатки</Text>
          <TouchableOpacity 
            style={styles.addNoteButton}
            onPress={() => {
              this.setState({
                editingNote: null,
                noteTitle: '',
                noteContent: ''
              });
            }}
          >
            <Text style={styles.addNoteButtonText}>+ Нова нотатка</Text>
          </TouchableOpacity>
        </View>
        
        {notesLoading ? (
          <ActivityIndicator size="small" color="#6B8A5E" style={{marginVertical: 20}} />
        ) : (
          <>
            {/* Форма створення/редагування нотатки */}
            {(editingNote !== null || (noteTitle !== '' || noteContent !== '')) && (
              <View style={styles.noteForm}>
                <TextInput
                  style={styles.noteTitleInput}
                  value={noteTitle}
                  onChangeText={(text) => this.setState({ noteTitle: text })}
                  placeholder="Назва нотатки"
                />
                <TextInput
                  style={styles.noteContentInput}
                  value={noteContent}
                  onChangeText={(text) => this.setState({ noteContent: text })}
                  placeholder="Зміст нотатки..."
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.noteFormButtons}>
                  <Button 
                    title="Скасувати" 
                    onPress={() => {
                      this.setState({
                        editingNote: null,
                        noteTitle: '',
                        noteContent: ''
                      });
                    }} 
                    style={styles.cancelButton}
                  />
                  <Button 
                    title={editingNote ? "Оновити" : "Зберегти"} 
                    onPress={() => {
                      if (editingNote) {
                        this.updateNote(editingNote);
                      } else {
                        this.createNote();
                      }
                    }} 
                    style={styles.saveButton}
                  />
                </View>
              </View>
            )}

            {/* Список існуючих нотаток */}
            {notes.length === 0 ? (
              <Text style={styles.emptyText}>Немає нотаток</Text>
            ) : (
              notes.map(note => (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <View style={styles.noteActions}>
                      <TouchableOpacity 
                        style={styles.noteAction} 
                        onPress={() => this.startEditingNote(note)}
                      >
                        <Edit size={16} color="#6B8A5E" />
                        <Text style={styles.actionText}>Редагувати</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.noteAction} 
                        onPress={() => this.deleteNote(note.id)}
                      >
                        <Trash2 size={16} color="#D32F2F" />
                        <Text style={[styles.actionText, { color: '#D32F2F' }]}>Видалити</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.noteContent} numberOfLines={3}>
                    {note.content}
                  </Text>
                  {note.content.length > 150 && (
                    <TouchableOpacity 
                      style={styles.readMoreButton}
                      onPress={() => this.startEditingNote(note)}
                    >
                      <Text style={styles.readMoreText}>Читати повністю</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3E28',
  },
  addNoteButton: {
    backgroundColor: '#6B8A5E',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addNoteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noteForm: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  noteTitleInput: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#2E3E28',
    marginBottom: 8,
  },
  noteContentInput: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#2E3E28',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  noteFormButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#6B8A5E',
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
    marginTop: 40,
  },
  noteItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    elevation: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3E28',
    flex: 1,
  },
  noteActions: {
    flexDirection: 'row',
  },
  noteAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#6B8A5E',
    marginLeft: 4,
  },
  noteContent: {
    fontSize: 14,
    color: '#4A6741',
    lineHeight: 20,
  },
  readMoreButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  readMoreText: {
    fontSize: 12,
    color: '#6B8A5E',
    fontWeight: '500',
  },
});

export default SimpleProjectNotesTab;