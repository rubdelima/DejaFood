// Arquivo: app/ingredient-selection.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { apiUrl } from '@/app/utils/env';

interface Recipe {
  title: string;
  ingredients: string[];
  images: string[];
  videos?: string[];
  steps: string[];
  url: string;
}

export default function IngredientSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [acceptedIngredients, setAcceptedIngredients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [customIngredientText, setCustomIngredientText] = useState('');
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const swiperRef = useRef<Swiper<string>>(null);

  useEffect(() => {
    const initialIngredientsParam = params.initialIngredientsStringfied;
    let initialList: string[] = [];
    if (
      initialIngredientsParam &&
      typeof initialIngredientsParam === 'string'
    ) {
      try {
        initialList = JSON.parse(initialIngredientsParam);
        if (!Array.isArray(initialList)) initialList = [];
        initialList = initialList.filter((item) => typeof item === 'string');
      } catch (e) {
        console.error('Erro no parse:', e);
      }
    }
    setAllIngredients(initialList);
  }, [params.initialIngredientsStringfied]);

  const onSwipedRight = (cardIndex: number) => {
    setAcceptedIngredients((prev) => [...prev, allIngredients[cardIndex]]);
  };

  const onSwipedAll = () => {
    setShowAddIngredientModal(true);
  };

  const handleAddCustomIngredient = () => {
    const trimmedText = customIngredientText.trim();
    if (!trimmedText) {
      Alert.alert('Campo Vazio', 'Digite um ingrediente para adicionar.');
      return;
    }
    setCustomIngredients((prev) => [...prev, trimmedText]);
    setCustomIngredientText('');
  };

  const handleRemoveCustomIngredient = (index: number) => {
    setCustomIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const submitIngredients = async () => {
    const finalIngredients = [...acceptedIngredients, ...customIngredients];
    if (finalIngredients.length === 0) {
      Alert.alert(
        'Atenção',
        'Adicione pelo menos um ingrediente antes de continuar.'
      );
      return;
    }

    setShowAddIngredientModal(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${apiUrl}/recipes/generate-from-ingredients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ ingredients: finalIngredients }),
        }
      );

      if (response.ok) {
        const recipesData: Recipe[] = await response.json();
        if (recipesData?.length > 0) {
          router.push({
            pathname: '/recipe-list',
            params: { recipesListStringfied: JSON.stringify(recipesData) },
          });
        } else {
          Alert.alert(
            'Nenhuma Receita',
            'Não encontramos receitas com os ingredientes selecionados.'
          );
        }
      } else {
        Alert.alert('Erro', `O servidor retornou um erro: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={router.back} style={styles.backButton}>
            <ArrowLeft size={28} color="#FF6B6B" />
          </TouchableOpacity>
          <Text style={styles.title}>Escolha os Ingredientes</Text>
        </View>

        <Text style={styles.subtitle}>
          Deslize para a direita para confirmar, para a esquerda para descartar
        </Text>

        <View style={styles.swiperContainer}>
          {allIngredients.length > 0 ? (
            <Swiper
              ref={swiperRef}
              cards={allIngredients}
              renderCard={(card) => (
                <View style={styles.card}>
                  <Text style={styles.cardText}>{card}</Text>
                </View>
              )}
              onSwipedRight={onSwipedRight}
              onSwipedAll={onSwipedAll}
              cardIndex={0}
              backgroundColor="transparent"
              stackSize={3}
              infinite={false}
              cardVerticalMargin={20}
              overlayLabels={{
                left: {
                  title: 'DESCARTAR',
                  style: {
                    label: {
                      backgroundColor: 'red',
                      borderColor: 'red',
                      color: 'white',
                      fontSize: 20,
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-start',
                      marginTop: 30,
                      marginLeft: -30,
                    },
                  },
                },
                right: {
                  title: 'ACEITAR',
                  style: {
                    label: {
                      backgroundColor: '#4CAF50',
                      borderColor: '#4CAF50',
                      color: 'white',
                      fontSize: 20,
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      marginTop: 30,
                      marginLeft: 30,
                    },
                  },
                },
              }}
              animateOverlayLabelsOpacity
              animateCardOpacity
              disableTopSwipe
              disableBottomSwipe
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum ingrediente detectado</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddIngredientModal(true)}
              >
                <Text style={styles.addButtonText}>Adicionar Manualmente</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Modal
          visible={showAddIngredientModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddIngredientModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Ingredientes</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite um ingrediente..."
                  value={customIngredientText}
                  onChangeText={setCustomIngredientText}
                  onSubmitEditing={handleAddCustomIngredient}
                />
                <TouchableOpacity
                  style={styles.addIcon}
                  onPress={handleAddCustomIngredient}
                >
                  <Text style={styles.addIconText}>+</Text>
                </TouchableOpacity>
              </View>

              {customIngredients.length > 0 && (
                <View style={styles.ingredientsList}>
                  {customIngredients.map((item, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Text style={styles.ingredientText}>{item}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveCustomIngredient(index)}
                      >
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddIngredientModal(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={submitIngredients}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Buscar Receitas</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Processando...</Text>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  swiperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 28,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#718096',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addIcon: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  ingredientsList: {
    maxHeight: height * 0.3,
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: '#2D3748',
    flex: 1,
  },
  removeText: {
    color: '#E53E3E',
    fontSize: 18,
    marginLeft: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#CBD5E0',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4CAF50',
  },
});
