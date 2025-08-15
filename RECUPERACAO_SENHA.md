# 🔐 Sistema de Recuperação de Senha - M2 Academia

## 📋 Visão Geral

Este sistema permite que usuários recuperem suas senhas através de um link enviado por email, com validade de 1 hora.

## 🚀 Funcionalidades

### ✅ **Recuperação de Senha**
- Usuário digita seu email cadastrado
- Sistema envia email com link de recuperação
- Link expira em 1 hora por segurança
- Validação completa de formulários

### ✅ **Reset de Senha**
- Link direciona para tela de nova senha
- Validação de código de recuperação
- Confirmação de nova senha
- Redirecionamento automático após sucesso

### ✅ **Segurança**
- Links com tempo limitado (1 hora)
- Validação de códigos únicos
- Proteção contra tentativas excessivas
- Mensagens de erro personalizadas

## 🛠️ Como Funciona

### 1️⃣ **Solicitação de Recuperação**
```
Usuário → Sign-in → "Esqueci minha senha" → ForgotPassword
```

### 2️⃣ **Envio de Email**
```
Firebase Auth → sendPasswordResetEmail() → Email enviado automaticamente
```

### 3️⃣ **Reset de Senha**
```
Email → Link → ResetPassword → Nova senha → Login
```

## 📱 Telas Implementadas

### **`forgot-password.jsx`**
- Formulário para digitar email
- Validação de email
- Confirmação de envio
- Opção de reenvio

### **`reset-password.jsx`**
- Validação de código de recuperação
- Formulário de nova senha
- Confirmação de senha
- Tratamento de erros

## 🔧 Configuração Firebase

### **Configuração Automática**
- O Firebase Auth já está configurado
- Emails são enviados automaticamente
- Links expiram em 1 hora por padrão
- Template padrão do Firebase

### **Personalização (Opcional)**
- Arquivo: `lib/firebase-auth-config.js`
- Mensagens de erro personalizadas
- Mensagens de sucesso personalizadas
- Logs para debugging

## 📧 Template do Email

O Firebase envia automaticamente um email com:
- **Assunto**: "Redefinir senha para [Nome do App]"
- **Conteúdo**: Link de recuperação com código único
- **Validade**: 1 hora
- **Segurança**: Código único e não reutilizável

## 🚨 Tratamento de Erros

### **Erros Comuns**
- `auth/user-not-found`: Email não cadastrado
- `auth/invalid-email`: Formato de email inválido
- `auth/too-many-requests`: Muitas tentativas
- `auth/network-request-failed`: Problema de conexão

### **Erros de Reset**
- `auth/expired-action-code`: Link expirado
- `auth/invalid-action-code`: Código inválido
- `auth/weak-password`: Senha muito fraca

## 🔄 Fluxo de Uso

```
1. Usuário esquece senha
2. Acessa "Esqueci minha senha"
3. Digita email cadastrado
4. Recebe email com link
5. Clica no link (dentro de 1 hora)
6. Define nova senha
7. Faz login com nova senha
```

## 🎯 Benefícios

- **Segurança**: Links com tempo limitado
- **Usabilidade**: Interface intuitiva
- **Confiabilidade**: Firebase Auth robusto
- **Manutenção**: Código limpo e organizado
- **UX**: Feedback claro para o usuário

## 🔍 Debug e Logs

### **Console Logs**
- Solicitação de recuperação
- Envio de email
- Validação de códigos
- Erros e sucessos

### **Firebase Console**
- Logs de autenticação
- Histórico de emails enviados
- Métricas de uso

## 📱 Teste

### **Para Testar**
1. Acesse a tela de login
2. Clique em "Esqueci minha senha"
3. Digite um email válido cadastrado
4. Verifique o email recebido
5. Clique no link de recuperação
6. Defina uma nova senha
7. Faça login com a nova senha

### **Dados de Teste**
- Use um email real cadastrado no sistema
- Verifique spam se não receber
- Teste com emails inválidos para validação

## 🚀 Próximos Passos

### **Melhorias Futuras**
- [ ] Personalização de template de email
- [ ] Notificações push para recuperação
- [ ] Histórico de recuperações
- [ ] Integração com SMS (2FA)
- [ ] Análise de segurança

---

**Desenvolvido para M2 Academia** 🏃‍♂️⚽
**Sistema robusto e seguro de recuperação de senha** 🔐✨
