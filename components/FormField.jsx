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
        <Text className="text-black font-pextrabold text-xl mb-2">
          {label}
        </Text>
      )}
      <TextInput
        className="bg-white/90 border-4 border-blue-800 rounded-3xl px-6 py-3 text-black font-pbold text-lg"
        placeholder={placeholder}
        placeholderTextColor="#666666"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={{
          // Garantir que não haja mudança de cor quando focado
          outlineStyle: 'none',
          // Remover qualquer estilo de foco padrão
          borderColor: '#1e40af', // blue-800
        }}
      />
      {error && (
        <Text className="text-red-500 font-pregular text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
} 