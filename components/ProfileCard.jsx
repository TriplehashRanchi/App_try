import { View, Text, StyleSheet } from 'react-native';

export default function ProfileCard({ data }) {
  return (
    <View style={styles.card}>
      
      <Text style={styles.title}>Personal Details</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{data.name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{data.phone}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Father Name:</Text>
        <Text style={styles.value}>{data.fatherName}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{data.address}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>District:</Text>
        <Text style={styles.value}>{data.district}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Post Office:</Text>
        <Text style={styles.value}>{data.postOffice}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    color: '#1E88E5'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    width: 120,
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  }
});
