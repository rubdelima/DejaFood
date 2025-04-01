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
  const swiperRef = useRef<Swiper<string>>(null);

  // Carrega os ingredientes iniciais a partir dos parâmetros
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

  // Ao deslizar para a direita, o ingrediente é aceito
  const onSwipedRight = (cardIndex: number) => {
    setAcceptedIngredients(prev => [...prev, allIngredients[cardIndex]]);
  };

  // Quando todos os cards forem processados, chama a API para gerar as receitas
  const onSwipedAll = async () => {
    if (acceptedIngredients.length === 0) {
      Alert.alert("Nenhum Ingrediente", "Você não selecionou nenhum ingrediente.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/recipes/generate-from-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ingredients: acceptedIngredients })
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
              {/* Minimalistic Spinner */}
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          )}
        </View>
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
    // Preenche a tela, mas sem cor de fundo
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Remove o "cinza" ou "escuro" do overlay
  },
});
