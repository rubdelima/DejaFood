import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Home } from 'lucide-react-native';
import { Recipe } from '.';

export default function RecipeListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const recipesParam = params.recipesListStringfied;
    console.log(
      "RecipeListScreen: Recebido param 'recipesListStringfied':",
      recipesParam
    );

    if (recipesParam && typeof recipesParam === 'string') {
      try {
        const parsedRecipes = JSON.parse(recipesParam);
        setRecipes(Array.isArray(parsedRecipes) ? parsedRecipes : []);
      } catch (e) {
        console.error('RecipeListScreen: Erro ao parsear receitas:', e);
        setRecipes([]);
      }
    } else {
      console.warn(
        'RecipeListScreen: Lista de receitas não fornecida ou inválida.'
      );
      setRecipes([]);
    }
  }, [params.recipesListStringfied]);

  const handleRecipeSelect = (selectedRecipe: Recipe) => {
    console.log('Receita selecionada:', selectedRecipe.title);
    router.push({
      pathname: '/recipe-details',
      params: {
        recipeStringfied: JSON.stringify(selectedRecipe),
      },
    });
  };

  const renderRecipeOption = (recipe: Recipe, index: number) => {
    const imageUrl = recipe.images?.[0];

    return (
      <TouchableOpacity
        key={recipe.url || recipe.title || index}
        style={styles.recipeItem}
        onPress={() => handleRecipeSelect(recipe)}
        activeOpacity={0.7}
      >
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {recipe.title || 'Receita Sem Título'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={28} color="#FF6B6B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Receitas Encontradas</Text>

        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={styles.homeButton}
        >
          <Home size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.mainTitle}>Escolha uma opção:</Text>

        {recipes.length > 0 ? (
          <View style={styles.listContainer}>
            {recipes.slice(0, 3).map(renderRecipeOption)}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            Nenhuma receita encontrada para exibir.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  homeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
    paddingHorizontal: 20,
    fontFamily: 'Inter_700Bold',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  recipeItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recipeImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#e0e0e0',
  },
  titleContainer: {
    padding: 15,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter_600SemiBold',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});
