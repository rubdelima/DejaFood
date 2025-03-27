import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome back!</Text>
      <Text style={styles.subtitle}>What would you like to cook today?</Text>

      <View style={styles.featuredContainer}>
        <Text style={styles.sectionTitle}>Featured Recipes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.featuredCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' }}
                style={styles.featuredImage}
              />
              <Text style={styles.featuredTitle}>Healthy Salad Bowl</Text>
              <Text style={styles.featuredDescription}>A delicious and nutritious meal</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.popularContainer}>
        <Text style={styles.sectionTitle}>Popular This Week</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.popularCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' }}
              style={styles.popularImage}
            />
            <View style={styles.popularContent}>
              <Text style={styles.popularTitle}>Classic Margherita Pizza</Text>
              <Text style={styles.popularDescription}>Italian cuisine at its finest</Text>
            </View>
          </View>
        ))}
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
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  featuredContainer: {
    marginTop: 32,
  },
  featuredScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    margin: 16,
  },
  featuredDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  popularContainer: {
    marginTop: 32,
  },
  popularCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  popularImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  popularContent: {
    flex: 1,
    padding: 16,
  },
  popularTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
  },
  popularDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginTop: 4,
  },
});