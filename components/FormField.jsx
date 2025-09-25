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
    <View className="mb-2">
      {label && (
        <Text className="text-gray-900 font-bold text-lg mb-1 text-left">
          {label}
        </Text>
      )}
      <TextInput
        className="bg-white rounded-xl px-4 py-3 text-gray-800 font-medium text-base w-72"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={false}
        numberOfLines={1}
        style={{
          // Garantir que não haja mudança de cor quando focado
          outlineStyle: 'none',
          // Remover qualquer estilo de foco padrão
          borderWidth: 3,
          borderColor: error ? '#EF4444' : '#4B5563', // red-500 ou gray-600
        }}
      />
      {error && (
        <Text className="text-red-500 font-medium text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
} 