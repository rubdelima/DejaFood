import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Clock, Users } from 'lucide-react-native';

// Definindo a interface para a Receita
interface Recipe {
  title: string;
  ingredients: string[];
  images: string[];
  steps: string[];
  url: string;
}

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);  // Estado para armazenar as receitas

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://localhost:8000/recipes/all');  // Substitua pela URL correta
        const data: Recipe[] = await response.json();
        console.log('Receitas recebidas:', data);  // Verifique se os dados estão corretos
        setRecipes(data.slice(-3));  // Pegando as últimas 3 receitas
      } catch (error) {
        console.error('Erro ao buscar receitas:', error);
      }
    };

    fetchRecipes();
  }, []);  // A requisição é feita apenas uma vez quando o componente é montado

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Minhas Receitas</Text>

      {recipes.length > 0 ? (
        recipes.map((recipe, index) => (
          <TouchableOpacity key={index} style={styles.recipeCard}>
            <Image
              source={{ uri: recipe.images[0] }}  // Usando a primeira imagem da receita
              style={styles.recipeImage}
            />
            <View style={styles.recipeContent}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Text style={styles.recipeDescription}>
                {recipe.ingredients.join(', ').slice(0, 100)}...
              </Text>
              <View style={styles.recipeMetadata}>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text>Carregando receitas...</Text>  // Exibe enquanto as receitas estão sendo carregadas
      )}

      <View style={styles.videoSection}>
        <Text style={styles.sectionTitle}>Vídeos Relacionados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoScroll}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.videoCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543' }}
                style={styles.videoThumbnail}
              />
              <Text style={styles.videoTitle}>Exemplo</Text>
              <Text style={styles.videoDuration}>10:23</Text>
            </View>
          ))}
        </ScrollView>
      </View>
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
    marginBottom: 24,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 16,
  },
  recipeMetadata: {
    flexDirection: 'row',
    gap: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  videoSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  videoScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  videoCard: {
    width: 200,
    marginRight: 16,
  },
  videoThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    marginTop: 8,
  },
  videoDuration: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginTop: 4,
  },
});
