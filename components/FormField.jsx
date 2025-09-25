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
      <View className="bg-white rounded-xl px-4 h-14 flex-row items-center w-72 border-2" style={{ borderColor: error ? '#EF4444' : '#4B5563' }}>
        <TextInput
          className="flex-1 text-gray-800 font-medium text-base"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={false}
          numberOfLines={1}
          textAlignVertical="center"
          style={{
            // Garantir que não haja mudança de cor quando focado
            outlineStyle: 'none',
            // Remover qualquer estilo de foco padrão
            backgroundColor: 'transparent',
          }}
        />
      </View>
      {error && (
        <Text className="text-red-500 font-medium text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
} 