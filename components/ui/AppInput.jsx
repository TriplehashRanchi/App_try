import { Text, TextInput, View } from "react-native";

export const AppInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secure = false, 
  keyboardType = "default",
  onBlur,
  error 
}) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 8, color: "#4b5563", textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      secureTextEntry={secure}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      onBlur={onBlur}
      style={{
        backgroundColor: "#ffffff",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1.5,
        borderColor: error ? "#ef4444" : "#e5e7eb",
        color: "#111827",
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 }
      }}
    />
    {error && <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{error}</Text>}
  </View>
);