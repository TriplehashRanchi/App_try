import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';

export default function SettingsCard() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#1E88E5');

  const colorOptions = ['#1E88E5', '#ff3b30', '#34c759', '#ff9500'];

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Settings</Text>

      {/* Dark Mode Toggle */}
      <View style={styles.row}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={(v) => setDarkMode(v)}
        />
      </View>

      {/* Notifications */}
      <View style={styles.row}>
        <Text style={styles.label}>Notifications</Text>
        <Switch
          value={notifications}
          onValueChange={(v) => setNotifications(v)}
        />
      </View>

      {/* Color Theme Selection */}
      <Text style={[styles.label, { marginTop: 12 }]}>Primary Color</Text>
      <View style={styles.colorRow}>
        {colorOptions.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorDot,
              { backgroundColor: c, borderWidth: primaryColor === c ? 3 : 1 }
            ]}
            onPress={() => setPrimaryColor(c)}
          />
        ))}
      </View>

      {/* App Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>App Version: 1.0.0</Text>
        <Text style={styles.infoText}>RM Club © 2025</Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 14,
    marginTop: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 }
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E88E5',
    marginBottom: 15
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444'
  },

  colorRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'flex-start'
  },

  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    borderColor: '#ccc'
  },

  infoBox: {
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee'
  },

  infoText: {
    fontSize: 14,
    color: '#777',
    marginVertical: 2
  },

  logoutBtn: {
    marginTop: 20,
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },

  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});
