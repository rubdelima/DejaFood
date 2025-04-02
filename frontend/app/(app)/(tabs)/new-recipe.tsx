import React, { useState } from 'react'; // Removido useEffect e useMemo não utilizados aqui
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Camera, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

// Interface Recipe (se definida em outro lugar, importe; senão, defina se necessário)
// import { Recipe } from '../path/to/interfaces';

export default function NewRecipeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Função para escolher imagem da galeria
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permissão Necessária',
        'É preciso permitir acesso à galeria para escolher uma imagem.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Função para tirar foto
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permissão Necessária',
        'É preciso permitir acesso à câmera para tirar uma foto.'
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Função para enviar a imagem para EXTRAÇÃO de ingredientes e navegar
  const analyzeRecipe = async () => {
    if (!image) {
      Alert.alert(
        'Nenhuma Imagem',
        'Por favor, tire uma foto ou escolha uma imagem da galeria.'
      );
      return;
    }
    setLoading(true);
    const formData = new FormData();
    const filename = image.split('/').pop() || 'photo.jpg';
    const extensionMatch = filename.match(/\.([^.]+)$/);
    const fileExtension = extensionMatch
      ? extensionMatch[1].toLowerCase()
      : 'jpg';
    let mimeType = 'image/jpeg';
    if (fileExtension === 'png') mimeType = 'image/png';
    else if (fileExtension === 'webp') mimeType = 'image/webp';

    try {
      const response = await fetch(image);
      const blob = await response.blob();
      // @ts-ignore - FormData RN pode precisar de 'any' para blob ou objeto {uri...}
      formData.append('file', blob, filename); // Enviando como blob

      console.log('Enviando imagem para API /recipes/simulate...');

      // --- CHAMA O ENDPOINT /simulate ---
      // !!! CONFIRA A URL BASE (localhost ou IP) !!!
      const apiResponse = await fetch(
        'http://localhost:8000/recipes/simulate',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        console.log('Resposta da API (/simulate) recebida:', data);

        // Espera prioritariamente: { ingredients: [...] }
        // !!! CONFIRA A CHAVE EXATA ('ingredients'?) NA RESPOSTA REAL DE /simulate !!!
        let detectedIngredients = data?.ingredients;
        let validIngredientsFound = Array.isArray(detectedIngredients);

        // Fallback: Se não encontrou 'ingredients', mas recebeu um array (como antes)
        // tenta pegar 'ingredients' do primeiro item, baseado na docstring de /simulate
        // sugerindo que pode retornar List[RecieveResult] mas com propósito diferente.
        if (
          !validIngredientsFound &&
          Array.isArray(data) &&
          data.length > 0 &&
          Array.isArray(data[0]?.ingredients)
        ) {
          console.warn(
            'Endpoint /simulate retornou um Array, usando ingredientes do primeiro item.'
          );
          detectedIngredients = data[0].ingredients;
          validIngredientsFound = true; // Encontrou de forma alternativa
        }

        if (validIngredientsFound) {
          console.log(
            'Ingredientes extraídos para seleção:',
            detectedIngredients
          );
          setLoading(false);

          // Navega para a seleção passando a lista extraída
          router.push({
            pathname: '/ingredient-selection', // Confirme a rota
            params: {
              initialIngredientsStringfied: JSON.stringify(detectedIngredients),
            },
          });
        } else {
          // Formato inesperado vindo de /simulate
          console.error(
            "Resposta da API /simulate OK, mas 'ingredients' não encontrado no formato esperado:",
            data
          );
          Alert.alert(
            'Erro de Resposta',
            'Formato de ingredientes inválido vindo do servidor (/simulate).'
          );
          setLoading(false);
        }
      } else {
        // Tratamento de erro da API (/simulate)
        const errorBody = await apiResponse.text();
        console.error('Falha na API /simulate:', apiResponse.status, errorBody);
        Alert.alert(
          'Erro na Extração',
          `O servidor retornou um erro ao extrair ingredientes (/simulate): ${apiResponse.status}.`
        );
        setLoading(false);
      }
    } catch (error) {
      // Tratamento de erro de rede
      console.error('Erro ao chamar /simulate:', error);
      Alert.alert(
        'Erro de Rede',
        'Não foi possível conectar ao servidor para extrair ingredientes.'
      );
      setLoading(false);
    }
  };

  // --- JSX ---
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={28} color="#FF6B6B" />
        </TouchableOpacity>
        <Text style={styles.title}>Nova Receita</Text>
      </View>
      <Text style={styles.subtitle}>
        Tire ou escolha uma foto dos ingredientes
      </Text>

      <View style={styles.mainContent}>
        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="contain"
            />
            {!loading && (
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={analyzeRecipe}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.analyzeButtonText}>
                  Analisar Ingredientes
                </Text>
              </TouchableOpacity>
            )}
            {!loading && (
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => setImage(null)}
                disabled={loading}
              >
                <Text style={styles.retakeButtonText}>Escolher Outra Foto</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={takePhoto}
              activeOpacity={0.8}
            >
              <Camera size={28} color="#fff" />
              <Text style={styles.buttonText}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Escolher da Galeria
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Analisando imagem...</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando a análise...</Text>
          <View style={styles.loadingBarContainer}>
            <View style={[styles.loadingBar, { width: `${progress}%` }]} />
          </View>
        </View>
      )}
    </View>
  );
}

// --- Estilos --- (mantidos da versão anterior)
const styles = StyleSheet.create({
  // ... (Cole os estilos completos da resposta anterior aqui) ...
  // Vou repetir os estilos relevantes para completude:
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold', // Garanta fonte carregada
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular', // Garanta fonte carregada
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    justifyContent: 'center',
    gap: 20,
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold', // Garanta fonte carregada
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
    shadowColor: '#ccc',
    elevation: 4,
  },
  secondaryButtonText: {
    color: '#FF6B6B',
  },
  imagePreviewContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    marginBottom: 25,
    backgroundColor: '#e0e0e0',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold', // Garanta fonte carregada
    fontWeight: 'bold',
  },
  retakeButton: {
    padding: 10,
    marginBottom: 10,
  },
  retakeButtonText: {
    color: '#555',
    fontSize: 15,
    fontFamily: 'Inter_500Medium', // Garanta fonte carregada
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#FF6B6B',
    fontFamily: 'Inter_600SemiBold', // Garanta fonte carregada
  },
});
