import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';  // Hook de navegação do Expo Router
import { PlusCircle } from 'lucide-react-native';

// Definindo a interface para a Receita
interface Recipe {
  title: string;
  ingredients: string[];
  images: string[];
  steps: string[];
  url: string;
}

export default function HomeScreen() {
  const router = useRouter();

  const [recipes, setRecipes] = useState<Recipe[]>([]);  // Estado para armazenar as receitas
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);  // Estado para armazenar a receita selecionada
  const [modalVisible, setModalVisible] = useState(false);  // Estado para controlar a visibilidade do modal

  const fetchRecipes = async () => {
    try {
      const response = await fetch('http://localhost:8000/recipes/all');
      const data = await response.json();
      console.log('Receitas recebidas:', data);  // Verifique se os dados estão corretos
      setRecipes(data);  // Exibe todas as receitas
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    }
  };

  // UseEffect para buscar receitas quando a tela for carregada
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Função que abre o modal e define a receita selecionada
  const handleRecipePress = (recipe: Recipe) => {
    setSelectedRecipe(recipe);  // Define a receita clicada
    setModalVisible(true);  // Abre o modal
  };

  // Função para fechar o modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedRecipe(null);  // Limpa a receita selecionada
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Bem-vindo de volta!</Text>
        <TouchableOpacity onPress={() => router.push('/new-recipe')}>
          <PlusCircle size={28} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>O que você gostaria de cozinhar hoje?</Text>

      {/* Seção de Receitas Recentes (Carrossel) */}
      <View style={styles.featuredContainer}>
        <Text style={styles.sectionTitle}>Receitas recentes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {recipes.length > 0 ? (
            recipes.slice(0, 3).map((recipe, index) => (  // Exibe as 3 primeiras receitas
              <TouchableOpacity key={index} onPress={() => handleRecipePress(recipe)}>
                <View style={styles.featuredCard}>
                  <Image
                    source={{ uri: recipe.images[0] }}  // Usando a primeira imagem da receita
                    style={styles.featuredImage}
                  />
                  <Text style={styles.featuredTitle}>{recipe.title}</Text>
                  <Text style={styles.featuredDescription}>
                    {recipe.ingredients.join(', ').slice(0, 100)}...
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>Carregando receitas...</Text>  // Exibe mensagem enquanto não há receitas
          )}
        </ScrollView>
      </View>

      {/* Seção de Receitas Populares da Semana (Todas as Receitas) */}
      <View style={styles.popularContainer}>
        <Text style={styles.sectionTitle}>Todas as Receitas</Text>
        {recipes.length > 0 ? (
          recipes.slice(3).map((recipe, index) => (  // Exibe as receitas restantes
            <TouchableOpacity key={index} onPress={() => handleRecipePress(recipe)}>
              <View style={styles.popularCard}>
                <Image
                  source={{ uri: recipe.images[0] }}
                  style={styles.popularImage}
                />
                <View style={styles.popularContent}>
                  <Text style={styles.popularTitle}>{recipe.title}</Text>
                  <Text style={styles.popularDescription}>{recipe.ingredients.join(', ').slice(0, 100)}...</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text>Carregando...</Text>  // Exibe mensagem enquanto não há receitas
        )}
      </View>

      {/* Modal para exibir a receita completa */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}  // Fecha o modal ao pressionar o botão de voltar
      >
        <View style={styles.modalContainer}>
          {selectedRecipe && (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
              <Image
                source={{ uri: selectedRecipe.images[0] }}
                style={styles.modalImage}
              />
              <Text style={styles.modalSubtitle}>Ingredientes:</Text>
              <Text style={styles.modalText}>{selectedRecipe.ingredients.join(', ')}</Text>

              <Text style={styles.modalSubtitle}>Passos:</Text>
              <Text style={styles.modalText}>{selectedRecipe.steps.join('\n')}</Text>

              <Text style={styles.modalSubtitle}>Receita Completa:</Text>
              <Text style={styles.modalLink} onPress={() => {}}>
                {selectedRecipe.url}
              </Text>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#333',
    marginTop: 0,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  featuredContainer: {
    marginTop: 32,
  },
  featuredScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    margin: 16,
  },
  featuredDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  popularContainer: {
    marginTop: 32,
  },
  popularCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  popularImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  popularContent: {
    flex: 1,
    padding: 16,
  },
  popularTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
  },
  popularDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Fundo semitransparente
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
    overflowY: 'scroll',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#333',
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    marginTop: 10,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  modalLink: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FF6B6B',
  },
  closeButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 120,
  },
});
