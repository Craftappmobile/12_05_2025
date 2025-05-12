import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Button, ShareMenu } from '../../components/ui';
import Text from '../../components/Text';
import { Camera, Calendar, Link, Plus, Trash2, Edit, Save, X, Image as ImageIcon } from 'lucide-react-native';
import { database, notesCollection, photosCollection } from '../../database';
import * as FileSystem from 'expo-file-system';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';

// Не використовуємо BridgelessSafeComponent, щоб уникнути помилок з displayName

interface ProjectNotesTabProps {
  projectId: string;
  onRefresh?: () => void;
  notes?: any[];
  photos?: any[];
}

const ProjectNotesTab: React.FC<ProjectNotesTabProps> = ({ 
  projectId, 
  onRefresh,
  notes = [],
  photos = []
}) => {
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [yarnType, setYarnType] = useState('');
  const [needleSize, setNeedleSize] = useState('');
  const [density, setDensity] = useState('');
  const [tags, setTags] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [sources, setSources] = useState<{id: string, url: string}[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [shareMenuVisible, setShareMenuVisible] = useState(false);
  
  // Отримуємо дані проєкту при завантаженні компонента
  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Завантаження деталей проєкту
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      
      // Отримання даних проєкту
      const project = await database.get('projects').find(projectId);
      
      // Встановлення даних форми
      setProjectName(project.name);
      setYarnType(project.yarnType || '');
      setNeedleSize(project.needleSize || '');
      setDensity(project.density || '');
      setTags(project.tags || '');
      setStartDate(project.startDate ? new Date(project.startDate) : null);
      setEndDate(project.endDate ? new Date(project.endDate) : null);
      
      setLoading(false);
      setNotesLoading(false);
    } catch (err) {
      console.error('Помилка при завантаженні даних проєкту:', err);
      setLoading(false);
      setNotesLoading(false);
    }
  };

  // Створення нової нотатки
  const createNote = async () => {
    if (!noteTitle.trim()) {
      Alert.alert('Помилка', 'Введіть назву нотатки');
      return;
    }

    try {
      setLoading(true);
      await database.action(async () => {
        await notesCollection.create(note => {
          note.title = noteTitle;
          note.content = noteContent;
          note.project.set(database.get('projects').find(projectId));
        });
      });

      // Очищення форми
      setNoteTitle('');
      setNoteContent('');
      setLoading(false);
      
      if (onRefresh) onRefresh();
      
      Alert.alert('Успіх', 'Нотатку створено');
    } catch (error) {
      console.error('Помилка при створенні нотатки:', error);
      setLoading(false);
      Alert.alert('Помилка', 'Не вдалося створити нотатку');
    }
  };

  // Редагування нотатки
  const updateNote = async (noteId: string) => {
    if (!noteTitle.trim()) {
      Alert.alert('Помилка', 'Введіть назву нотатки');
      return;
    }

    try {
      setLoading(true);
      await database.action(async () => {
        const noteToUpdate = await notesCollection.find(noteId);
        await noteToUpdate.update(note => {
          note.title = noteTitle;
          note.content = noteContent;
        });
      });

      // Очищення режиму редагування
      setNoteTitle('');
      setNoteContent('');
      setEditingNote(null);
      setLoading(false);
      
      if (onRefresh) onRefresh();
      
      Alert.alert('Успіх', 'Нотатку оновлено');
    } catch (error) {
      console.error('Помилка при оновленні нотатки:', error);
      setLoading(false);
      Alert.alert('Помилка', 'Не вдалося оновити нотатку');
    }
  };

  // Видалення нотатки
  const deleteNote = async (noteId: string) => {
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
              setLoading(true);
              await database.action(async () => {
                const noteToDelete = await notesCollection.find(noteId);
                await noteToDelete.markAsDeleted();
                await noteToDelete.destroyPermanently();
              });
              
              setLoading(false);
              if (onRefresh) onRefresh();
              
              Alert.alert('Успіх', 'Нотатку видалено');
            } catch (error) {
              console.error('Помилка при видаленні нотатки:', error);
              setLoading(false);
              Alert.alert('Помилка', 'Не вдалося видалити нотатку');
            }
          }
        },
      ]
    );
  };

  // Почати редагування нотатки
  const startEditingNote = (note: any) => {
    setEditingNote(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  // Зберегти проєкт
  const saveProject = async () => {
    try {
      setLoading(true);
      await database.action(async () => {
        const projectToUpdate = await database.get('projects').find(projectId);
        await projectToUpdate.update(project => {
          project.name = projectName;
          project.yarnType = yarnType;
          project.needleSize = needleSize;
          project.density = density;
          project.tags = tags;
          if (startDate) project.startDate = startDate;
          if (endDate) project.endDate = endDate;
        });
      });
      
      setLoading(false);
      if (onRefresh) onRefresh();
      
      Alert.alert('Успіх', 'Проєкт оновлено');
    } catch (error) {
      console.error('Помилка при оновленні проєкту:', error);
      setLoading(false);
      Alert.alert('Помилка', 'Не вдалося оновити проєкт');
    }
  };

  // Додати джерело (посилання)
  const addSource = () => {
    if (!sourceUrl.trim()) {
      Alert.alert('Помилка', 'Введіть URL');
      return;
    }

    // Перевірка валідності URL
    try {
      new URL(sourceUrl);
    } catch (_) {
      Alert.alert('Помилка', 'Введіть коректний URL');
      return;
    }

    // Заглушка - додавання URL в тимчасовий стан
    const newSource = { id: Date.now().toString(), url: sourceUrl };
    setSources([...sources, newSource]);
    setSourceUrl('');
    
    Alert.alert('Інформація', 'Функція "Джерела" буде доступна в наступних версіях');
  };

  // Видалити джерело
  const removeSource = (id: string) => {
    setSources(sources.filter(source => source.id !== id));
  };

  // Додати фото
  const addPhoto = () => {
    Alert.alert('Інформація', 'Функція "Додати фото" буде доступна в наступних версіях');
  };

  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6B8A5E" />
        </View>
      )}
      
      {/* Назва проєкту */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Назва проєкту</Text>
        <TextInput
          style={styles.input}
          value={projectName}
          onChangeText={setProjectName}
          placeholder="Введіть назву проєкту"
        />
      </View>

      {/* Основна інформація */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Основна інформація</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Пряжа</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.rowInput}
              value={yarnType}
              onChangeText={setYarnType}
              placeholder="Вказати тип пряжі"
            />
            <TouchableOpacity style={styles.addButton}>
              <Plus size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Спиці</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.rowInput}
              value={needleSize}
              onChangeText={setNeedleSize}
              placeholder="Вказати розмір спиць"
            />
            <TouchableOpacity style={styles.addButton}>
              <Plus size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Візерунок</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.addButton} onPress={addPhoto}>
              <Plus size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Щільність</Text>
          <View style={styles.densityContainer}>
            <TextInput
              style={styles.densityInput}
              value={density.split('x')[0] || ''}
              onChangeText={(val) => setDensity(`${val}x${density.split('x')[1] || ''}`)} 
              keyboardType="numeric"
              placeholder="__"
            />
            <Text style={styles.densitySeparator}>x</Text>
            <TextInput
              style={styles.densityInput}
              value={density.split('x')[1] || ''}
              onChangeText={(val) => setDensity(`${density.split('x')[0] || ''}x${val}`)} 
              keyboardType="numeric"
              placeholder="__"
            />
            <Text style={styles.densityUnit}>п.</Text>
          </View>
        </View>
      </View>

      {/* Теги */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Теги</Text>
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="Введіть або виберіть теги..."
        />
      </View>

      {/* Список нотаток */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Нотатки</Text>
          <TouchableOpacity 
            style={styles.addNoteButton}
            onPress={() => {
              setEditingNote(null);
              setNoteTitle('');
              setNoteContent('');
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
                  onChangeText={setNoteTitle}
                  placeholder="Назва нотатки"
                />
                <TextInput
                  style={styles.noteContentInput}
                  value={noteContent}
                  onChangeText={setNoteContent}
                  placeholder="Зміст нотатки..."
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.noteFormButtons}>
                  <Button 
                    title="Скасувати" 
                    onPress={() => {
                      setEditingNote(null);
                      setNoteTitle('');
                      setNoteContent('');
                    }} 
                    style={styles.cancelButton}
                  />
                  <Button 
                    title={editingNote ? "Оновити" : "Зберегти"} 
                    onPress={() => {
                      if (editingNote) {
                        updateNote(editingNote);
                      } else {
                        createNote();
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
                        onPress={() => startEditingNote(note)}
                      >
                        <Edit size={16} color="#6B8A5E" />
                        <Text style={styles.actionText}>Редагувати</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.noteAction} 
                        onPress={() => deleteNote(note.id)}
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
                      onPress={() => startEditingNote(note)}
                    >
                      <Text style={styles.readMoreText}>Читати повністю</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </>
        )}
      </View>

      {/* Фотографії/Референси */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Референси</Text>
        <Text style={styles.subsectionTitle}>Додані фото:</Text>
        
        {photos.length === 0 ? (
          <Text style={styles.emptyText}>Немає доданих фото</Text>
        ) : (
          <View style={styles.photosGrid}>
            {photos.map(photo => (
              <View key={photo.id} style={styles.photoItem}>
                <Image 
                  source={{ uri: photo.uri }} 
                  style={styles.photoPreview} 
                  resizeMode="cover"
                />
                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.photoAction}>
                    <Trash2 size={14} color="#D32F2F" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoAction}>
                    <Edit size={14} color="#6B8A5E" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity style={styles.addPhotoButton} onPress={addPhoto}>
          <Camera size={16} color="#fff" />
          <Text style={styles.addPhotoButtonText}>Додати фото</Text>
        </TouchableOpacity>
      </View>
      
      {/* Дати */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Дати</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Дата створення</Text>
          <View style={styles.dateContainer}>
            <TextInput
              style={styles.dateInput}
              value={startDate ? startDate.toLocaleDateString() : ''}
              editable={false}
              placeholder="Не вказано"
            />
            <TouchableOpacity style={styles.calendarButton}>
              <Calendar size={16} color="#6B8A5E" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Планована дата завершення</Text>
          <View style={styles.dateContainer}>
            <TextInput
              style={styles.dateInput}
              value={endDate ? endDate.toLocaleDateString() : ''}
              editable={false}
              placeholder="Не вказано"
            />
            <TouchableOpacity style={styles.calendarButton}>
              <Calendar size={16} color="#6B8A5E" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Джерела */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Джерела</Text>
        <Text style={styles.subsectionTitle}>Додані посилання:</Text>
        
        {sources.length === 0 ? (
          <Text style={styles.emptyText}>Немає доданих посилань</Text>
        ) : (
          <View style={styles.sourcesList}>
            {sources.map((source, index) => (
              <View key={source.id} style={styles.sourceItem}>
                <Text style={styles.sourceNumber}>{index + 1}.</Text>
                <Text style={styles.sourceUrl} numberOfLines={1}>{source.url}</Text>
                <TouchableOpacity 
                  style={styles.sourceAction} 
                  onPress={() => removeSource(source.id)}
                >
                  <Trash2 size={14} color="#D32F2F" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sourceAction}>
                  <Edit size={14} color="#6B8A5E" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.addSourceContainer}>
          <TextInput
            style={styles.sourceInput}
            value={sourceUrl}
            onChangeText={setSourceUrl}
            placeholder="Додати нове посилання..."
          />
          <TouchableOpacity style={styles.addSourceButton} onPress={addSource}>
            <Link size={16} color="#fff" />
            <Text style={styles.addSourceButtonText}>Додати</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Кнопки дій */}
      <View style={styles.actionButtons}>
        <Button 
          title="Зберегти проєкт" 
          onPress={saveProject} 
          style={styles.saveProjectButton}
        />
        <Button 
          title="Поширити" 
          onPress={() => setShareMenuVisible(true)} 
          style={styles.shareButton}
        />
        
        <ShareMenu 
          visible={shareMenuVisible}
          onClose={() => setShareMenuVisible(false)}
          onShareCommunity={() => {
            setShareMenuVisible(false);
            Alert.alert('Інформація', 'Функція "Поширити у спільноті" буде доступна в наступних версіях');
          }}
          onShareLink={() => {
            setShareMenuVisible(false);
            Alert.alert('Інформація', 'Функція "Поширити за посиланням" буде доступна в наступних версіях');
          }}
        />
      </View>
    </ScrollView>
  );
};

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
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3E28',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6741',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#2E3E28',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B8A5E',
    width: 120,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#2E3E28',
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#6B8A5E',
    borderRadius: 4,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  densityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  densityInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#2E3E28',
    width: 50,
    textAlign: 'center',
  },
  densitySeparator: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#2E3E28',
  },
  densityUnit: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2E3E28',
  },
  // Нотатки
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
    marginVertical: 12,
  },
  noteItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
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
  // Фото
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  photoItem: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 4,
  },
  photoAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  addPhotoButton: {
    backgroundColor: '#6B8A5E',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  addPhotoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Дати
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#2E3E28',
    flex: 1,
    marginRight: 8,
  },
  calendarButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
  },
  // Джерела
  sourcesList: {
    marginBottom: 16,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sourceNumber: {
    width: 20,
    fontSize: 14,
    color: '#6B8A5E',
  },
  sourceUrl: {
    flex: 1,
    fontSize: 14,
    color: '#2E3E28',
  },
  sourceAction: {
    paddingHorizontal: 8,
  },
  addSourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#2E3E28',
    flex: 1,
    marginRight: 8,
  },
  addSourceButton: {
    backgroundColor: '#6B8A5E',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSourceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Кнопки дій
  actionButtons: {
    marginTop: 8,
    marginBottom: 24,
  },
  saveProjectButton: {
    backgroundColor: '#6B8A5E',
    marginBottom: 8,
  },
  shareButton: {
    backgroundColor: '#4A6741',
  },
});

// Обгортаємо компонент у withObservables для отримання даних з WatermelonDB
const enhance = withObservables(['projectId'], ({ projectId, database }) => ({
  notes: database.get('notes')
    .query(
      Q.where('project_id', projectId),
      Q.sortBy('updated_at', 'desc')
    )
    .observe(),
  photos: database.get('photos')
    .query(
      Q.where('project_id', projectId),
      Q.sortBy('created_at', 'desc')
    )
    .observe(),
}));

// Обгортаємо компонент без використання BridgelessSafeComponent для уникнення помилок
const EnhancedNotesTab = withDatabase(enhance(ProjectNotesTab));

// Встановлюємо displayName безпосередньо
EnhancedNotesTab.displayName = 'EnhancedProjectNotesTab';

export default EnhancedNotesTab;