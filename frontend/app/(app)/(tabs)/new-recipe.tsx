import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';  // Importando o hook de navegação

export default function NewRecipeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);  // Estado para o carregamento
  const [progress, setProgress] = useState(0);  // Progresso da barra de carregamento
  const router = useRouter();  // Hook de navegação

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    }
  };

  const analyzeRecipe = async () => {
    if (!image) return;

    setLoading(true);  // Ativa o estado de carregamento

    const formData = new FormData();
    const filename = image.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image';

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      formData.append('file', blob, filename);

      const apiResponse = await fetch('http://localhost:8000/recipes/generate', {
        method: 'POST',
        body: formData,
        headers: {
          // Não é necessário setar 'Content-Type' quando usa FormData
        },
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        console.log('Recipe Analysis:', data);
      } else {
        console.log('Falha ao analisar a receita:', apiResponse.status);
      }

      // Simulando a animação de carregamento (bar progress)
      let progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(progressInterval);
            setLoading(false);  // Desativa o estado de carregamento
            setTimeout(() => {
              router.push('/');  // Redireciona para a Home após a análise
            }, 500);  // Espera um pouco antes de redirecionar
            return 100;
          }
          return prevProgress + 5;  // Aumenta a barra de carregamento em 5% a cada intervalo
        });
      }, 300);  // A cada 300ms aumenta o progresso em 5%
    } catch (error) {
      console.log('Erro ao enviar a imagem:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Receita</Text>
      <Text style={styles.subtitle}>Tira uma foto dos ingredientes para começar</Text>

      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity style={styles.retakeButton} onPress={() => setImage(null)}>
            <Text style={styles.retakeButtonText}>Nova Foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Camera size={32} color="#fff" />
            <Text style={styles.buttonText}>Tirar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickImage}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Escolher da Galeria</Text>
          </TouchableOpacity>
        </View>
      )}

      {image && !loading && (
        <TouchableOpacity style={styles.analyzeButton} onPress={analyzeRecipe}>
          <Text style={styles.analyzeButtonText}>Analisar Receita</Text>
        </TouchableOpacity>
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
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  secondaryButtonText: {
    color: '#FF6B6B',
  },
  imageContainer: {
    flex: 1,
    marginTop: 32,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  retakeButton: {
    marginTop: 16,
  },
  retakeButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  analyzeButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontFamily: 'Inter_600SemiBold',
  },
  loadingBarContainer: {
    width: '80%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 20,
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 5,
  },
});
