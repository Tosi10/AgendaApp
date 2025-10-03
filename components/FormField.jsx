import { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { icons } from '../constants';

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
  const [showPassword, setShowPassword] = useState(false);
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
          secureTextEntry={secureTextEntry && !showPassword}
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
            // Centralizar texto verticalmente no iOS
            lineHeight: 20,
            paddingVertical: 0,
            height: '100%',
          }}
        />
        
        {/* Ícone de visibilidade para campos de senha */}
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            className="ml-2 p-1"
          >
            <Image
              source={showPassword ? icons.eyeHide : icons.eye}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 font-medium text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
} 