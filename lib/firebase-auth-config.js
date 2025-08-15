import { auth } from './firebase';

// Configuração para emails de recuperação de senha
export const configurePasswordResetEmail = () => {
  // O Firebase Auth já envia emails de recuperação por padrão
  // Mas podemos personalizar o comportamento se necessário
  
  // Configurações padrão do Firebase:
  // - Link expira em 1 hora
  // - Email é enviado automaticamente
  // - Usa o template padrão do Firebase
  
  console.log('🔧 Firebase Auth configurado para recuperação de senha');
  console.log('📧 Emails de recuperação serão enviados automaticamente');
  console.log('⏰ Links expiram em 1 hora');
};

// Função para verificar se o email de recuperação foi enviado
export const checkPasswordResetEmailSent = async (email) => {
  try {
    // O Firebase não fornece uma API para verificar se o email foi enviado
    // Mas podemos implementar um log local se necessário
    console.log(`📧 Email de recuperação solicitado para: ${email}`);
    return true;
  } catch (error) {
    console.error('Erro ao verificar envio de email:', error);
    return false;
  }
};

// Função para personalizar mensagens de erro
export const getPasswordResetErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'E-mail não encontrado em nossa base de dados',
    'auth/invalid-email': 'E-mail inválido',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente em alguns minutos',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
    'default': 'Erro ao enviar email de recuperação'
  };
  
  return errorMessages[errorCode] || errorMessages.default;
};

// Função para personalizar mensagens de sucesso
export const getPasswordResetSuccessMessage = (email) => {
  return {
    title: 'Email Enviado!',
    message: `Enviamos um link de recuperação para: ${email}\n\nVerifique sua caixa de entrada e siga as instruções para redefinir sua senha.`,
    instructions: [
      '• Verifique sua caixa de entrada',
      '• O link expira em 1 hora',
      '• Verifique também a pasta de spam',
      '• Clique no link para redefinir sua senha'
    ]
  };
};
