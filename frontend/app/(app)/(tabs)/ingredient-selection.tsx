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

  // Load initial ingredients from params
  useEffect(() => {
    const initialIngredientsParam = params.initialIngredientsStringfied;
    let initialList: string[] = [];
    if (initialIngredientsParam && typeof initialIngredientsParam === 'string') {
      try {
        initialList = JSON.parse(initialIngredientsParam);
        if (!Array.isArray(initialList)) { initialList = []; }
        initialList = initialList.filter(item => typeof item === 'string');
      } catch (e) {
        console.error("Erro no parse:", e);
        initialList = [];
      }
    }
    setAllIngredients(initialList);
  }, [params.initialIngredientsStringfied]);

  // When swiping right, accept the ingredient
  const onSwipedRight = (cardIndex: number) => {
    setAcceptedIngredients(prev => [...prev, allIngredients[cardIndex]]);
  };

  // When all cards are swiped, prompt the user to add custom ingredients
  const onSwipedAll = () => {
    if (acceptedIngredients.length === 0) {
      Alert.alert("Nenhum Ingrediente", "Você não selecionou nenhum ingrediente.");
      return;
    }
    setShowAddIngredientModal(true);
  };

  // Handle adding a custom ingredient into the list
  const handleAddCustomIngredient = () => {
    const trimmedText = customIngredientText.trim();
    if (trimmedText === '') {
      Alert.alert("Campo Vazio", "Digite um ingrediente para adicionar.");
      return;
    }
    setCustomIngredients(prev => [...prev, trimmedText]);
    setCustomIngredientText('');
  };

  // Remove an ingredient from the custom ingredients list
  const handleRemoveCustomIngredient = (index: number) => {
    setCustomIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // Submit all ingredients to the API
  const submitIngredients = async () => {
    const finalIngredients = [...acceptedIngredients, ...customIngredients];
    setShowAddIngredientModal(false);
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/recipes/generate-from-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ingredients: finalIngredients })
      });
      if (response.ok) {
        const recipesData: Recipe[] = await response.json();
        if (recipesData && recipesData.length > 0) {
          router.push({
            pathname: '/recipe-list',
            params: { recipesListStringfied: JSON.stringify(recipesData) }
          });
        } else {
          Alert.alert("Nenhuma Receita", "Não encontramos receitas com os ingredientes selecionados.");
          setIsSubmitting(false);
        }
      } else {
        Alert.alert('Erro ao Buscar Receitas', `O servidor retornou um erro: ${response.status}.`);
        setIsSubmitting(false);
      }
    } catch (error) {
      Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
      setIsSubmitting(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={28} color="#FF6B6B" />
          </TouchableOpacity>
          <Text style={styles.title}>Escolha os Ingredientes</Text>
        </View>
        <Text style={styles.subtitle}>
          Deslize para a direita para confirmar, para a esquerda para descartar.
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
              cardVerticalMargin={50}
              overlayLabels={{
                left: {
                  title: 'Não',
                  style: {
                    label: {
                      backgroundColor: 'red',
                      color: 'white',
                      fontSize: 24,
                      padding: 10,
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                      marginLeft: -20,
                    },
                  },
                },
                right: {
                  title: 'Sim',
                  style: {
                    label: {
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      fontSize: 24,
                      padding: 10,
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                      marginLeft: 20,
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
            <Text style={styles.emptyText}>Nenhum ingrediente disponível.</Text>
          )}
          {isSubmitting && (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          )}
        </View>

        {/* Modal for adding custom ingredients */}
        <Modal
          visible={showAddIngredientModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddIngredientModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Adicionar Ingrediente(s) Extra</Text>
              <Text style={styles.modalSubtitle}>
                Se desejar, digite ingredientes para adicionar:
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.modalInput}
                  value={customIngredientText}
                  onChangeText={setCustomIngredientText}
                  placeholder="Digite o ingrediente..."
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddCustomIngredient}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              {customIngredients.length > 0 && (
                <View style={styles.customList}>
                  {customIngredients.map((item, index) => (
                    <View key={index} style={styles.customItem}>
                      <Text style={styles.customItemText}>{item}</Text>
                      <TouchableOpacity onPress={() => handleRemoveCustomIngredient(index)}>
                        <Text style={styles.removeText}>x</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => {
                    // Clear custom ingredients and submit current list
                    setCustomIngredientText('');
                    setCustomIngredients([]);
                    submitIngredients();
                  }}
                >
                  <Text style={styles.modalButtonSecondaryText}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginLeft: 10,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 14,
    marginTop: 4,
    paddingHorizontal: 10,
  },
  swiperContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
    overflow: 'hidden',
    width: '100%',
  },
  card: {
    width: width * 0.85,
    maxWidth: 350,
    height: height * 0.45,
    maxHeight: 400,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  customList: {
    marginBottom: 15,
  },
  customItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    marginBottom: 5,
  },
  customItemText: {
    fontSize: 16,
    color: '#333',
  },
  removeText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
  },
  modalButtonSecondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
