import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ProfileCard from '@/components/ProfileCard'; // adjust path as needed

export default function ProfileScreen() {
  
  // You can pull this data from backend later
  const userData = {
    name: "Kunal Kumar",
    phone: "9876543210",
    fatherName: "Rajesh Kumar",
    address: "Kanke, Ranchi",
    district: "Ranchi",
    postOffice: "Kanke Post Office"
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text style={styles.heading}>My Profile</Text>

      {/* Profile Component */}
      <ProfileCard data={userData} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    paddingBottom: 40,
  },
  heading: {
    marginTop: 40,
    fontSize: 28,
    fontWeight: '800',
    color: '#1E88E5',
  },
});
