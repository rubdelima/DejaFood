import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Clock, Users } from 'lucide-react-native';

export default function RecipesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Recipes</Text>

      {[1, 2, 3].map((item) => (
        <TouchableOpacity key={item} style={styles.recipeCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe' }}
            style={styles.recipeImage}
          />
          <View style={styles.recipeContent}>
            <Text style={styles.recipeTitle}>Grilled Chicken Salad</Text>
            <Text style={styles.recipeDescription}>
              A healthy and delicious salad with grilled chicken breast, mixed greens, and homemade dressing.
            </Text>
            <View style={styles.recipeMetadata}>
              <View style={styles.metadataItem}>
                <Clock size={16} color="#666" />
                <Text style={styles.metadataText}>30 mins</Text>
              </View>
              <View style={styles.metadataItem}>
                <Users size={16} color="#666" />
                <Text style={styles.metadataText}>4 servings</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.videoSection}>
        <Text style={styles.sectionTitle}>Related Videos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoScroll}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.videoCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543' }}
                style={styles.videoThumbnail}
              />
              <Text style={styles.videoTitle}>Perfect Grilled Chicken</Text>
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