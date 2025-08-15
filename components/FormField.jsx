import { Text, TextInput, View } from 'react-native';

export default function FormField({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error = null
}) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-black font-pbold text-lg mb-2">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-white/90 border rounded-lg px-4 py-3 text-black font-pbold text-lg ${
          error ? 'border-red-500' : 'border-gray-600'
        }`}
        placeholder={placeholder}
        placeholderTextColor="#666666"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error && (
        <Text className="text-red-500 font-pregular text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
} 