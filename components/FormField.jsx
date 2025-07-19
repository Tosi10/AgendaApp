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
        <Text className="text-gray-100 font-pmedium text-sm mb-2">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-black-100 border rounded-lg px-4 py-3 text-white font-pregular text-base ${
          error ? 'border-red-500' : 'border-gray-600'
        }`}
        placeholder={placeholder}
        placeholderTextColor="#CDCDE0"
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