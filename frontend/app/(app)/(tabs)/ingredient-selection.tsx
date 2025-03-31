// Arquivo: app/ingredient-selection.tsx
// Atualizado em 31 de Março de 2025, 17:54 Brasil

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator // Para loading do botão confirmar
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Plus, ArrowLeft } from 'lucide-react-native'; // Inclui ArrowLeft

// Importe sua interface Recipe se definida em um local compartilhado
// import { Recipe } from '../models/recipe'; // Exemplo de caminho

// Assume que a interface Recipe existe com pelo menos 'title' e 'images' (para a próxima tela)
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

  // --- Estados ---
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [newIngredientText, setNewIngredientText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading para chamada API final

  // --- Efeito para Inicializar ---
  useEffect(() => {
    const initialIngredientsParam = params.initialIngredientsStringfied;
    console.log("IngredientSelectionScreen: Recebido param 'initialIngredientsStringfied':", initialIngredientsParam);

    let initialList: string[] = [];
    if (initialIngredientsParam && typeof initialIngredientsParam === 'string') {
      try {
        initialList = JSON.parse(initialIngredientsParam);
        if (!Array.isArray(initialList)) { initialList = []; }
        initialList = initialList.filter(item => typeof item === 'string');
      } catch (e) { console.error("Erro parse:", e); initialList = []; }
    } else { initialList = []; }

    setAllIngredients(initialList);
    setSelectedIngredients(new Set(initialList)); // Começa com todos selecionados

  }, [params.initialIngredientsStringfied]);

  // --- Handlers ---
  const handleSelectionChange = (ingredientName: string) => {
    setSelectedIngredients(prevSelected => {
      const nextSelected = new Set(prevSelected);
      if (nextSelected.has(ingredientName)) { nextSelected.delete(ingredientName); }
      else { nextSelected.add(ingredientName); }
      return nextSelected;
    });
  };

  const handleAddNewIngredient = () => {
    const trimmedIngredient = newIngredientText.trim();
    if (!trimmedIngredient) return;
    const exists = allIngredients.some(ing => ing.toLowerCase() === trimmedIngredient.toLowerCase());
    if (exists) {
      Alert.alert("Ingrediente Repetido", `"${trimmedIngredient}" já está na lista.`);
    } else {
      setAllIngredients(prev => [...prev, trimmedIngredient]);
      setSelectedIngredients(prevSelected => {
           const nextSelected = new Set(prevSelected);
           nextSelected.add(trimmedIngredient);
           return nextSelected;
       });
      setNewIngredientText('');
    }
  };

  // Confirma a seleção, ENVIA para o backend e NAVEGA PARA A LISTA DE RECEITAS
  const handleConfirmSelection = async () => {
    const finalIngredients = Array.from(selectedIngredients);
    console.log('Ingredientes Selecionados Finais para Envio:', finalIngredients);

    if (finalIngredients.length === 0) {
        Alert.alert("Nenhum Ingrediente", "Selecione ao menos um ingrediente.");
        return;
    }

    setIsSubmitting(true); // Ativa o loading

    try {
      console.log("Enviando ingredientes para API /recipes/generate-from-ingredients...");
      // !!! CONFIRA A URL BASE (localhost ou IP) !!!
      const response = await fetch('http://localhost:8000/recipes/generate-from-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ingredients: finalIngredients })
      });

      if (response.ok) {
        const recipesData: Recipe[] = await response.json(); // Espera um array de Receitas
        console.log("Receitas recebidas do backend:", recipesData);

        if (Array.isArray(recipesData) && recipesData.length > 0) {
          // <<< NAVEGA PARA A TELA DE LISTA >>>
          console.log("Navegando para a tela de lista de receitas...");
          router.push({
            pathname: '/recipe-list', // Rota para a tela de lista
            params: {
              // Passa o array COMPLETO de receitas recebido
              recipesListStringfied: JSON.stringify(recipesData)
            }
          });
          // Não desativa loading aqui, pois navegou

        } else {
           console.warn("Nenhuma receita encontrada para os ingredientes selecionados:", recipesData);
           Alert.alert("Nenhuma Receita", "Não encontramos receitas com os ingredientes selecionados.");
           setIsSubmitting(false); // Desativa loading aqui
        }

      } else {
        // Tratamento de erro da API
        const errorBody = await response.text();
        console.error('Falha na API /generate-from-ingredients:', response.status, errorBody);
        Alert.alert('Erro ao Buscar Receitas', `O servidor retornou um erro: ${response.status}.`);
        setIsSubmitting(false);
      }

    } catch (error) {
      // Tratamento de erro de rede
      console.error('Erro ao chamar /generate-from-ingredients:', error);
      Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor para buscar receitas.');
      setIsSubmitting(false);
    }
    // Não desativa loading aqui se navegou com sucesso, a tela será desmontada.
    // Mas se a navegação falhar por algum motivo, pode ser bom ter um setIsSubmitting(false) no final do try.
  };


  // --- Render Item ---
  const renderIngredientItem = ({ item }: { item: string }) => {
    const isSelected = selectedIngredients.has(item);
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleSelectionChange(item)}
        activeOpacity={0.7}
      >
        <Checkbox
          style={styles.checkbox}
          value={isSelected}
          onValueChange={() => handleSelectionChange(item)}
          color={isSelected ? '#FF6B6B' : '#888'}
        />
        <Text style={styles.itemText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  // --- JSX ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.content}>

        {/* Header com Botão Voltar */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={28} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Selecione os Ingredientes</Text>
        <Text style={styles.subtitle}>Marque os que deseja usar e adicione outros.</Text>

        <FlatList
          data={allIngredients}
          renderItem={renderIngredientItem}
          keyExtractor={(item, index) => `${item}-${index}`}
          style={styles.list}
          ListEmptyComponent={<Text style={styles.emptyListText}>Nenhum ingrediente detectado.</Text>}
          extraData={selectedIngredients}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.addIngredientContainer}>
          <TextInput
            style={styles.input}
            placeholder="Adicionar novo ingrediente..."
            value={newIngredientText}
            onChangeText={setNewIngredientText}
            onSubmitEditing={handleAddNewIngredient}
            returnKeyType="done"
            blurOnSubmit={false}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddNewIngredient} activeOpacity={0.8}>
            <Plus size={18} color="#fff" strokeWidth={3}/>
          </TouchableOpacity>
        </View>

        {/* Botão Confirmar com estado de Loading */}
        <TouchableOpacity
            style={[styles.confirmButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleConfirmSelection}
            disabled={isSubmitting} // Desabilita durante o envio
            activeOpacity={0.8}>
           {isSubmitting ? (
               // Mostra spinner durante o loading
               <ActivityIndicator size="small" color="#fff" />
           ) : (
               // Mostra ícone e texto normalmente
               <>
                   <Check size={20} color="#fff" style={styles.confirmButtonIcon}/>
                   {/* Texto do botão ajustado para indicar o próximo passo */}
                   <Text style={styles.confirmButtonText}>Encontrar Receitas</Text>
               </>
           )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// --- Estilos --- (Mantidos da versão anterior, incluindo headerRow e backButton)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 15,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 25, // Ajustado para menos padding no content
    marginBottom: 15,
  },
  backButton: {
     padding: 8,
     marginLeft: -8, // Alinha à esquerda
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'Inter_700Bold', // Garanta fonte carregada
  },
   subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    fontFamily: 'Inter_400Regular', // Garanta fonte carregada
   },
  list: {
    flex: 1,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    marginRight: 15,
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontFamily: 'Inter_400Regular', // Garanta fonte carregada
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
    color: '#999',
  },
  addIngredientContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    marginTop: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: '#fff',
    fontFamily: 'Inter_400Regular', // Garanta fonte carregada
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
     minWidth: 46,
     minHeight: 46,
     elevation: 1,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.1,
     shadowRadius: 1,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    minHeight: 50, // Altura mínima
  },
   confirmButtonIcon: {
     marginRight: 10,
   },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold', // Garanta fonte carregada
  },
  buttonDisabled: {
      backgroundColor: '#a5d6a7', // Cor mais clara quando desabilitado/loading
      elevation: 0,
      shadowOpacity: 0,
  },
});