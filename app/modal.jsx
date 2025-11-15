import { View, Text, StyleSheet } from 'react-native';

export default function ModalPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal Page</Text>
      <Text>This is a pop-up style screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
});
