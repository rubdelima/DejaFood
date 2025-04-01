import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { Camera, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function NewRecipeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Needed", "Please allow access to the gallery.");
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

  // Function to take a photo with the camera
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Needed", "Please allow access to the camera.");
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

  // Function to send the image for ingredient extraction
  const analyzeRecipe = async () => {
    if (!image) {
      Alert.alert("No Image", "Please take or choose an image.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    const filename = image.split('/').pop() || 'photo.jpg';
    const extensionMatch = filename.match(/\.([^.]+)$/);
    const fileExtension = extensionMatch ? extensionMatch[1].toLowerCase() : 'jpg';
    let mimeType = 'image/jpeg';
    if (fileExtension === 'png') mimeType = 'image/png';
    else if (fileExtension === 'webp') mimeType = 'image/webp';

    try {
      const response = await fetch(image);
      const blob = await response.blob();
      // @ts-ignore
      formData.append('file', blob, filename);

      console.log("Sending image to /recipes/simulate API...");
      const apiResponse = await fetch('http://localhost:8000/recipes/simulate', {
        method: 'POST',
        body: formData,
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        let detectedIngredients = data?.ingredients;
        let validIngredientsFound = Array.isArray(detectedIngredients);

        if (!validIngredientsFound && Array.isArray(data) && data.length > 0 && Array.isArray(data[0]?.ingredients)) {
          console.warn("Received array, using ingredients from the first item.");
          detectedIngredients = data[0].ingredients;
          validIngredientsFound = true;
        }

        if (validIngredientsFound) {
          console.log("Extracted ingredients:", detectedIngredients);
          setLoading(false);
          router.push({
            pathname: '/ingredient-selection',
            params: {
              initialIngredientsStringfied: JSON.stringify(detectedIngredients)
            }
          });
        } else {
          console.error("Unexpected API response:", data);
          Alert.alert('Response Error', 'Invalid ingredients format received.');
          setLoading(false);
        }
      } else {
        const errorBody = await apiResponse.text();
        console.error('API Error:', apiResponse.status, errorBody);
        Alert.alert('Extraction Error', `Server error: ${apiResponse.status}.`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Network Error:', error);
      Alert.alert('Network Error', 'Could not connect to the server.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={28} color="#FF6B6B" />
          </TouchableOpacity>
          <Text style={styles.title}>Nova Receita</Text>
        </View>
        <Text style={styles.subtitle}>Tire ou escolha uma foto dos ingredientes</Text>

        <View style={styles.mainContent}>
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
              {!loading && (
                <TouchableOpacity style={styles.analyzeButton} onPress={analyzeRecipe} activeOpacity={0.8}>
                  <Text style={styles.analyzeButtonText}>Analisar Ingredientes</Text>
                </TouchableOpacity>
              )}
              {!loading && (
                <TouchableOpacity style={styles.retakeButton} onPress={() => setImage(null)}>
                  <Text style={styles.retakeButtonText}>Escolher Outra Foto</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={takePhoto} activeOpacity={0.8}>
                <Camera size={28} color="#fff" />
                <Text style={styles.buttonText}>Tirar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickImage} activeOpacity={0.8}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Escolher da Galeria</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container centers content and adds responsive padding
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
  },
  // innerContainer constrains width on larger screens (desktop/web)
  innerContainer: {
    width: '100%',
    maxWidth: 800,
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
    shadowColor: "#FF6B6B",
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
    shadowColor: "#ccc",
    elevation: 4,
  },
  secondaryButtonText: {
    color: '#FF6B6B',
  },
  imagePreviewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    marginBottom: 25,
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
    shadowColor: "#000",
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
