import { View, Text, ScrollView, StyleSheet } from 'react-native';
import SettingsCard from '../../components/SettingsCard';

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      {/* Settings Component */}
      <SettingsCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    paddingBottom: 40
  },
  heading: {
    marginTop: 40,
    fontSize: 28,
    fontWeight: '800',
    color: '#1E88E5'
  }
});
