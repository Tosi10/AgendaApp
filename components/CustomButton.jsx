import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

export default function CustomButton({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'outline'
  className = '',
  style = {}
}) {
  const getButtonStyle = () => {
    const baseStyle = 'py-3 rounded-lg items-center justify-center';
    const paddingStyle = className.includes('w-') ? '' : 'px-6';
    
    if (disabled || loading) {
      return `${baseStyle} ${paddingStyle} bg-gray-600 opacity-50 ${className}`;
    }
    
    switch (variant) {
      case 'secondary':
        return `${baseStyle} ${paddingStyle} bg-secondary border-4 border-yellow-600 ${className}`;
      case 'outline':
        return `${baseStyle} ${paddingStyle} border-4 border-yellow-600 bg-transparent ${className}`;
      default:
        return `${baseStyle} ${paddingStyle} bg-secondary border-4 border-yellow-600 ${className}`;
    }
  };

  const getTextStyle = () => {
    const baseStyle = 'font-pbold text-base';
    
    if (disabled || loading) {
      return `${baseStyle} text-gray-300`;
    }
    
    switch (variant) {
      case 'outline':
        return `${baseStyle} text-secondary`;
      default:
        return `${baseStyle} text-black`;
    }
  };

  return (
    <TouchableOpacity
      className={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#FF9C01' : '#000'} />
      ) : (
        <Text className={getTextStyle()}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
} 