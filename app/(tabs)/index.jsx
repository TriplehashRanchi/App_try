import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>RM Club</Text>
      <Text style={styles.sub}>Choose an option to continue</Text>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/settings')}
      >
        <Text style={styles.buttonText}>Go to Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/profile')}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/explore')}
      >
        <Text style={styles.buttonText}>Go to Explore</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FF',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    color: '#1E88E5',
  },
  sub: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  button: {
    width: '80%',
    backgroundColor: '#1E88E5',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
