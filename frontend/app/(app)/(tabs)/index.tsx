import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';  // Hook de navegação do Expo Router

// Definindo a interface para a Receita
interface Recipe {
  title: string;
  ingredients: string[];
  images: string[];
  steps: string[];
  url: string;
}

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);  // Estado para armazenar as receitas
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);  // Estado para armazenar a receita selecionada
  const [modalVisible, setModalVisible] = useState(false);  // Estado para controlar a visibilidade do modal

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/recipes/all');
        const data: Recipe[] = await response.json();
        console.log('Receitas recebidas:', data);  // Verifique se os dados estão corretos
        setRecipes(data.slice(-3));  // Pegando as últimas 3 receitas
      } catch (error) {
        console.error('Erro ao buscar receitas:', error);
      }
    };

    fetchRecipes();  // Chama o fetch assim que a tela é carregada
  }, []);  // O fetch será chamado apenas quando o componente for montado

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
      <Text style={styles.title}>Bem-vindo de volta!</Text>
      <Text style={styles.subtitle}>O que você gostaria de cozinhar hoje?</Text>

      <View style={styles.featuredContainer}>
        <Text style={styles.sectionTitle}>Receitas recentes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {recipes.length > 0 ? (
            recipes.map((recipe, index) => (
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
    marginTop: 60,
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
});
