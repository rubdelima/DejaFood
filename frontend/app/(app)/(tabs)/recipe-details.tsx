import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, PlayCircle } from 'lucide-react-native';
// Certifique-se que este import está correto e que a interface Recipe existe
import { Recipe } from '.';

const { width } = Dimensions.get('window');
const MAIN_MEDIA_HEIGHT = 250; // Altura da área de mídia principal
const THUMBNAIL_HEIGHT = 70; // Altura das miniaturas no carrossel

// Interface para item de mídia combinado
interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

// Interface Recipe (conforme seu exemplo)
// export interface Recipe {
//   title: string;
//   ingredients: string[];
//   images: string[];
//   videos?: string[];
//   steps: string[];
//   url: string;
// }

interface RecipeDetailsScreenProps {
  mockRecipe?: Recipe;
}

export default function RecipeDetailsScreen({ mockRecipe }: RecipeDetailsScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isMounted = useRef(false); // Ref para checar montagem (usado no onPress original)

  // --- State Definitions ---
  // Estado para o índice selecionado no carrossel (inicia com 0, será corrigido no useEffect)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  // Estado para a URL da imagem *atualmente exibida* na área principal (inicia null)
  const [displayedImageUrl, setDisplayedImageUrl] = useState<string | null>(null);

  // --- Memoization for Derived Data ---
  // Memoiza o objeto 'recipe' para evitar recálculos e estabilizar referência
  const recipe: Recipe | null = useMemo(() => {
    // console.log("--- useMemo [recipe] --- RECALCULATING ---"); // Log para debug de memoization
    if (mockRecipe) return mockRecipe;
    if (params.recipeStringfied && typeof params.recipeStringfied === 'string') {
        try {
            return JSON.parse(params.recipeStringfied);
        } catch (e) {
            console.error("Falha ao fazer parse de recipeStringfied:", e);
            return null;
        }
    }
    return null;
  // Depende apenas das fontes de dados originais
  }, [params.recipeStringfied, mockRecipe]);

  // Memoiza o array 'mediaItems' combinado, depende do objeto 'recipe' memoizado
  const mediaItems: MediaItem[] = useMemo(() => {
    if (!recipe) return [];
    // console.log("--- useMemo [mediaItems] --- RECALCULATING ---"); // Log para debug
    const images: MediaItem[] = (recipe.images || []).map(url => ({ type: 'image', url }));
    const videos: MediaItem[] = (recipe.videos || []).map(url => ({ type: 'video', url }));
    return [...images, ...videos]; // Imagens primeiro
  }, [recipe]); // Depende apenas da referência estável de 'recipe'

  // --- Effects ---
  // Efeito para lidar com a montagem/desmontagem
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Efeito para DEFINIR/RESETAR o estado inicial QUANDO a receita REAL mudar
  useEffect(() => {
      console.log("--- EXECUTANDO useEffect [params.recipeStringfied, mockRecipe] --- Definindo/Resetando estado inicial");

      // Calcula os items de mídia baseado nos parâmetros atuais (poderia pegar do useMemo se não fosse assíncrono)
      const currentMediaItems: MediaItem[] = (() => {
           // Recalcula a lógica de 'recipe' aqui dentro ou usa o valor do 'useMemo'
           // Usar o valor do 'useMemo' é mais limpo se ele estiver atualizado
           if (!recipe) return [];
           const images: MediaItem[] = (recipe.images || []).map(url => ({ type: 'image', url }));
           const videos: MediaItem[] = (recipe.videos || []).map(url => ({ type: 'video', url }));
           return [...images, ...videos];
       })(); // Usando o 'recipe' do useMemo

      const firstImageIdx = currentMediaItems.findIndex(item => item.type === 'image');
      const initialUrl = firstImageIdx !== -1 ? currentMediaItems[firstImageIdx].url : null;
      // Define o índice inicial como o da primeira imagem, ou 0 se não houver imagens
      const initialIndex = firstImageIdx !== -1 ? firstImageIdx : 0;

      // Define o estado inicial/resetado
      setDisplayedImageUrl(initialUrl);
      setSelectedMediaIndex(initialIndex);

  // Depende APENAS das fontes de dados originais que definem a receita
  }, [params.recipeStringfied, mockRecipe, recipe]); // Inclui 'recipe' do useMemo para pegar o valor atualizado

  // Efeito para depurar a mudança de displayedImageUrl (OPCIONAL - remova se não precisar mais)
  useEffect(() => {
    // Este useEffect executa sempre que 'displayedImageUrl' mudar.
    console.log(`--- [Passo 3 - Debug] Estado displayedImageUrl FOI ATUALIZADO para: ${displayedImageUrl}`);
  }, [displayedImageUrl]);

  // --- Helper Functions ---
  // Função para abrir URL de vídeo externamente
  const openVideoUrl = async (url: string) => {
    if (!url) {
        Alert.alert('Erro', 'URL do vídeo inválida.');
        return;
    }
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error("Erro ao tentar abrir URL do vídeo:", error);
        Alert.alert('Erro', 'Não foi possível abrir o link do vídeo.');
      }
    } else {
      Alert.alert('Erro', `Não é possível abrir este tipo de link: ${url}`);
    }
  };

  // --- Render Function for Thumbnails ---
  const renderThumbnailItem = ({ item, index }: { item: MediaItem; index: number }) => {
    const isActive = index === selectedMediaIndex;

    return (
      <TouchableOpacity
        key={`${item.type}-${index}-${item.url}`} // Chave mais específica
        onPress={() => {
           // Log do Passo 1 (Debug do clique)
           console.log(`>>> Miniatura ${index} (${item.type}) CLICADA!`);

           // Atualiza o índice selecionado para destacar a borda correta
           setSelectedMediaIndex(index);

           if (item.type === 'image') {
             // Log do Passo 2 (Debug da intenção de mudar a imagem)
             console.log(`--- [Passo 2 - Debug] Tentando definir displayedImageUrl para: ${item.url}`);
             // Atualiza a imagem principal exibida
             setDisplayedImageUrl(item.url);
           } else if (item.type === 'video') {
             // Tenta abrir vídeo externamente
             openVideoUrl(item.url);
             // Opcional: Limpar a imagem principal ao abrir vídeo?
             // setDisplayedImageUrl(null);
           }
        }}
        style={[
          styles.thumbnailTouchable,
          isActive ? styles.activeThumbnailBorder : {},
        ]}
      >
        <View style={styles.thumbnailImageContainer}>
          {item.type === 'image' ? (
            <Image
              source={{ uri: item.url }}
              style={styles.carouselThumbnail}
              resizeMode="cover"
              // Log de erro mínimo para miniaturas
              onError={(e) => console.error(`ERRO Miniatura Imagem ${index} (${item.url}):`, JSON.stringify(e.nativeEvent.error))}
            />
          ) : (
            <View style={[styles.carouselThumbnail, styles.videoThumbnailPlaceholder]}>
              <PlayCircle size={24} color="#FFF" strokeWidth={1.5} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  // --- End Render Function ---

  // --- Early return if no recipe ---
  if (!recipe) {
    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={28} color="#FF6B6B" />
                </TouchableOpacity>
            </View>
            <Text style={styles.errorText}>Receita não encontrada</Text>
        </View>
    );
  }

  const hasDisplayImage = displayedImageUrl !== null;

  // --- Component Return (JSX) ---
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Título */}
      <Text style={styles.modalTitle}>{recipe.title}</Text>

      {/* --- Área de Mídia Principal (APENAS IMAGEM) --- */}
      <View style={styles.mainMediaContainer}>
        {hasDisplayImage ? (
          <Image
            key={displayedImageUrl} // Key para ajudar React a detectar mudança na source
            source={{ uri: displayedImageUrl }}
            style={styles.mainMediaStyle}
            resizeMode="contain"
            // Log de erro mínimo para imagem principal
            onError={(e) => {
                console.error(`--- ERRO Imagem Principal (${displayedImageUrl}):`, JSON.stringify(e.nativeEvent.error, null, 2));
                // Decide o que fazer em caso de erro - talvez mostrar placeholder?
                // Exemplo: setDisplayedImageUrl(null); // Isso faria mostrar o placeholder abaixo
            }}
            // Opcional: Log de sucesso no carregamento
            // onLoad={() => console.log(`--- Imagem Principal CARREGADA: ${displayedImageUrl}`)}
          />
        ) : (
          // Placeholder se não houver imagem para exibir ou se deu erro
          <View style={[styles.mainMediaStyle, styles.errorPlaceholder]}>
            <Text style={styles.errorPlaceholderText}>
                {mediaItems.length > 0 ? "Selecione uma imagem" : "Sem mídia disponível"}
            </Text>
             {/* Pode adicionar um ícone aqui */}
          </View>
        )}

        {/* REMOVIDO: Teste de Texto - Descomente se precisar depurar o estado novamente */}
        {/* <View style={[styles.mainMediaContainer, { backgroundColor: 'lightyellow', padding: 10, height: 'auto' }]}>
            <Text style={{ color: 'black', fontWeight: 'bold', marginBottom: 5 }}>Debug URL no Estado:</Text>
            <Text selectable={true} style={{ color: 'black', fontSize: 12 }}>
                {displayedImageUrl || 'Nenhuma URL definida'}
            </Text>
        </View> */}

      </View>
      {/* --- Fim Área de Mídia Principal --- */}


      {/* Carrossel de Miniaturas */}
      {mediaItems.length > 1 && (
        <View style={styles.thumbnailCarouselContainer}>
          <FlatList
            data={mediaItems}
            renderItem={renderThumbnailItem}
            keyExtractor={(item, index) => `${item.type}-${index}-${item.url}`} // Chave única
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailListContent}
            // Otimizações opcionais para listas grandes
            // initialNumToRender={5}
            // maxToRenderPerBatch={5}
            // windowSize={11}
          />
        </View>
      )}

      {/* Detalhes da Receita */}
      <View style={styles.recipeDetailsContainer}>
        {/* Ingredientes */}
        <Text style={styles.modalSubtitle}>Ingredientes:</Text>
        <Text style={styles.modalText}>{recipe.ingredients.join(', ')}</Text>

        {/* Passos */}
        <Text style={styles.modalSubtitle}>Passos:</Text>
        {recipe.steps.map((step, index) => (
          <Text key={`step-${index}`} style={styles.modalTextStep}>
            {`${index + 1}. ${step}`}
          </Text>
        ))}

        {/* Link Receita Completa */}
        {recipe.url && (
          <>
            <Text style={styles.modalSubtitle}>Receita Completa:</Text>
            <TouchableOpacity onPress={() => openVideoUrl(recipe.url) /* Reutiliza a função ou usa Linking direto */}>
              <Text style={styles.modalLink}>{recipe.url}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// --- Estilos ---
// (Mantidos os mesmos estilos da versão anterior sem expo-av)
const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
   errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold', // Garanta que a fonte está carregada
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  mainMediaContainer: {
    width: width,
    height: MAIN_MEDIA_HEIGHT,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Para garantir que a imagem não exceda os limites
  },
  mainMediaStyle: {
    width: '100%',
    height: '100%',
  },
  thumbnailCarouselContainer: {
    height: THUMBNAIL_HEIGHT + 10,
    marginBottom: 20,
    marginTop: 5,
  },
  thumbnailListContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  thumbnailTouchable: {
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: 'transparent',
    backgroundColor: '#ccc', // Fundo padrão caso a imagem falhe
    overflow: 'hidden', // Garante que a imagem/placeholder não vaze
  },
  thumbnailImageContainer: {
    width: THUMBNAIL_HEIGHT,
    height: THUMBNAIL_HEIGHT,
    borderRadius: 6, // Raio interno um pouco menor
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#f0f0f0', // Cor de fundo caso a imagem demore
  },
  carouselThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#444', // Fundo escuro para vídeo
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeThumbnailBorder: {
    borderColor: '#FF6B6B', // Cor de destaque
  },
  errorPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0', // Cor de fundo para erro/placeholder
  },
  errorPlaceholderText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    padding: 5,
  },
  // errorPlaceholderTextSmall não está sendo usado, mas pode manter se quiser
  recipeDetailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold', // Garanta que a fonte está carregada
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular', // Garanta que a fonte está carregada
    color: '#666',
    lineHeight: 21,
  },
  modalTextStep: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular', // Garanta que a fonte está carregada
    color: '#555',
    lineHeight: 21,
    marginBottom: 8,
  },
  modalLink: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular', // Garanta que a fonte está carregada
    color: '#FF6B6B',
    textDecorationLine: 'underline',
    marginTop: 5,
  },
});