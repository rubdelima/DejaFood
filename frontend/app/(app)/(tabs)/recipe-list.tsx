import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList, // Pode usar FlatList ou .map se forem sempre poucos itens
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView, // Adicionado para caso o conteúdo exceda a tela
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native'; // Para o botão voltar
import { Recipe } from '.'; // Importe sua interface Recipe (ajuste o caminho se necessário)

export default function RecipeListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Efeito para carregar e parsear as receitas recebidas via parâmetro
  useEffect(() => {
    const recipesParam = params.recipesListStringfied;
    console.log("RecipeListScreen: Recebido param 'recipesListStringfied':", recipesParam);

    if (recipesParam && typeof recipesParam === 'string') {
      try {
        const parsedRecipes = JSON.parse(recipesParam);
        if (Array.isArray(parsedRecipes)) {
          setRecipes(parsedRecipes);
        } else {
          console.error("RecipeListScreen: Parâmetro não é um array JSON válido.");
          setRecipes([]);
        }
      } catch (e) {
        console.error("RecipeListScreen: Erro ao parsear receitas:", e);
        setRecipes([]);
      }
    } else {
       console.warn("RecipeListScreen: Lista de receitas não fornecida ou inválida.");
       setRecipes([]); // Define como vazio se não receber parâmetro
    }
  }, [params.recipesListStringfied]);

  // Função chamada ao selecionar uma receita da lista
  const handleRecipeSelect = (selectedRecipe: Recipe) => {
    console.log("Receita selecionada:", selectedRecipe.title);
    // Navega para a tela de detalhes, passando a receita selecionada
    router.push({
      pathname: '/recipe-details', // Rota para a tela de detalhes
      params: {
        recipeStringfied: JSON.stringify(selectedRecipe) // Passa a receita clicada
      }
    });
  };

  // Função para renderizar cada item da lista de receitas (usando .map abaixo)
  const renderRecipeOption = (recipe: Recipe, index: number) => {
     // Pega a primeira imagem ou um placeholder
     const imageUrl = recipe.images?.[0];

     return (
        <TouchableOpacity
            key={recipe.url || recipe.title || index} // Usa URL, título ou índice como chave
            style={styles.recipeItem}
            onPress={() => handleRecipeSelect(recipe)}
            activeOpacity={0.7}
        >
            {imageUrl && (
                <Image source={{ uri: imageUrl }} style={styles.recipeImage} resizeMode="cover" />
            )}
            {/* View para o título caso a imagem falhe ou como overlay */}
            <View style={styles.titleContainer}>
               <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title || "Receita Sem Título"}</Text>
            </View>
        </TouchableOpacity>
     );
  };


  return (
    <ScrollView style={styles.container}>
      {/* Header com botão voltar */}
      <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={28} color="#FF6B6B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receitas Encontradas</Text>
      </View>

      {/* Título Principal */}
      <Text style={styles.mainTitle}>Escolha uma opção:</Text>

      {/* Lista de Opções de Receita */}
      {recipes.length > 0 ? (
        // Mapeia as 3 primeiras receitas (ou menos, se houver menos)
        <View style={styles.listContainer}>
            {recipes.slice(0, 3).map(renderRecipeOption)}
        </View>
      ) : (
        // Mensagem se nenhuma receita foi recebida/parseada
        <Text style={styles.emptyText}>Nenhuma receita encontrada para exibir.</Text>
      )}
    </ScrollView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7', // Fundo similar ao anterior
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // Espaço seguro
    paddingHorizontal: 15, // Padding horizontal do header
    marginBottom: 10,
  },
  backButton: {
     padding: 8,
     marginRight: 10,
  },
  headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      fontFamily: 'Inter_600SemiBold', // Exemplo
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
    paddingHorizontal: 20,
    fontFamily: 'Inter_700Bold', // Exemplo
  },
  listContainer: {
     paddingHorizontal: 20, // Padding para os itens da lista
  },
  recipeItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20, // Espaço entre os itens
    overflow: 'hidden', // Garante que a imagem não vaze das bordas
    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recipeImage: {
    width: '100%',
    height: 150, // Altura da imagem da receita na lista
    backgroundColor: '#e0e0e0', // Fundo enquanto carrega
  },
  titleContainer: {
      padding: 15, // Espaçamento interno para o título
      // Pode ser um overlay sobre a imagem com position: 'absolute' se preferir
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600', // Semi-bold
    color: '#333',
    fontFamily: 'Inter_600SemiBold', // Exemplo
  },
  emptyText: {
      fontSize: 16,
      color: '#888',
      textAlign: 'center',
      marginTop: 50,
  }
});