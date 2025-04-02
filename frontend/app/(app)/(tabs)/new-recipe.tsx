import React, { useState } from 'react';
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
import { apiUrl } from '@/app/utils/env';

export default function NewRecipeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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

  const analyzeRecipe = async () => {
    if (!image) {
      Alert.alert(
        'Nenhuma Imagem',
        'Por favor, tire uma foto ou escolha uma imagem da galeria.'
      );
      return;
    }
    setLoading(true);

    const filename = image.split('/').pop() || 'photo.jpg';
    const extensionMatch = filename.match(/\.([^.]+)$/);
    const fileExtension = extensionMatch
      ? extensionMatch[1].toLowerCase()
      : 'jpg';
    let mimeType = 'image/jpeg';
    if (fileExtension === 'png') mimeType = 'image/png';
    else if (fileExtension === 'webp') mimeType = 'image/webp';

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image,
        name: filename,
        type: mimeType,
      } as any);

      console.log('Enviando imagem para API /recipes/simulate...');

      const apiResponse = await fetch(`${apiUrl}/recipes/simulate`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        console.log('Resposta da API (/simulate) recebida:', data);

        let detectedIngredients = data?.ingredients;
        let validIngredientsFound = Array.isArray(detectedIngredients);

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
          validIngredientsFound = true;
        }

        if (validIngredientsFound) {
          console.log(
            'Ingredientes extraídos para seleção:',
            detectedIngredients
          );
          setLoading(false);

          router.push({
            pathname: '/ingredient-selection',
            params: {
              initialIngredientsStringfied: JSON.stringify(detectedIngredients),
            },
          });
        } else {
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
        const errorBody = await apiResponse.text();
        console.error('Falha na API /simulate:', apiResponse.status, errorBody);
        Alert.alert(
          'Erro na Extração',
          `O servidor retornou um erro ao extrair ingredientes (/simulate): ${apiResponse.status}.`
        );
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao chamar /simulate:', error);
      Alert.alert(
        'Erro de Rede',
        'Não foi possível conectar ao servidor para extrair ingredientes.'
      );
      setLoading(false);
    }
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
              <>
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
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => setImage(null)}
                  disabled={loading}
                >
                  <Text style={styles.retakeButtonText}>
                    Escolher Outra Foto
                  </Text>
                </TouchableOpacity>
              </>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: 'Inter_700Bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
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
    fontFamily: 'Inter_600SemiBold',
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
    fontFamily: 'Inter_600SemiBold',
    fontWeight: 'bold',
  },
  retakeButton: {
    padding: 10,
    marginBottom: 10,
  },
  retakeButtonText: {
    color: '#555',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
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
    fontFamily: 'Inter_600SemiBold',
  },
});
