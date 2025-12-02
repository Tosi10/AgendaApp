# 🔐 Como Atualizar as Regras do Firebase

## ⚠️ Problema Resolvido

As regras do Firestore foram atualizadas para permitir que **admins** criem, editem e deletem planos.

## 📝 Passo a Passo

### 1. Acesse o Firebase Console

1. Vá para: https://console.firebase.google.com/
2. Selecione seu projeto: **agendamento-e97f7**

### 2. Navegue até Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique na aba **"Regras"** (Rules)

### 3. Atualize as Regras

**Substitua** a seção de regras para `planos` por esta:

```javascript
// REGRAS PARA PLANOS
match /planos/{planoId} {
  // Todos podem ler planos
  allow read: if true;
  
  // Apenas admins podem criar, atualizar e deletar planos
  allow create, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipoUsuario == 'admin';
}
```

### 4. Regras Completas (Referência)

Se preferir, aqui estão as regras completas atualizadas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // REGRAS PARA USUÁRIOS
    match /usuarios/{userId} {
      // Usuário pode ler/escrever apenas seu próprio perfil
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admins podem ler e MODIFICAR todos os usuários
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipoUsuario == 'admin';
      
      // TODOS os usuários autenticados podem LER apelidos de outros usuários (para exibição)
      allow read: if request.auth != null;
    }
    
    // REGRAS PARA AGENDAMENTOS
    match /agendamentos/{agendamentoId} {
      // Usuários autenticados podem ler todos os agendamentos
      allow read: if request.auth != null;
      // Usuários autenticados podem criar/atualizar/deletar agendamentos
      allow create, update, delete: if request.auth != null;
    }
    
    // REGRAS PARA CHAT
    match /chat/{mensagemId} {
      // Usuários autenticados podem ler/escrever mensagens
      allow read, write: if request.auth != null;
    }
    
    // REGRAS PARA HISTÓRICO
    match /historico/{historicoId} {
      // Usuários autenticados podem ler/escrever seu histórico
      allow read, write: if request.auth != null;
    }
    
    // REGRAS PARA PLANOS
    match /planos/{planoId} {
      // Todos podem ler planos
      allow read: if true;
      
      // Apenas admins podem criar, atualizar e deletar planos
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipoUsuario == 'admin';
    }
    
    // REGRAS PARA HORÁRIOS
    match /horarios/{horarioId} {
      // Todos podem ler horários
      allow read: if true;
    }
  }
}
```

### 5. Publique as Regras

1. Clique no botão **"Publicar"** (Publish)
2. Aguarde a confirmação de sucesso

### 6. Teste no App

1. Abra o app como **admin**
2. Vá em **"Início"** → botão **⚙️**
3. Tente criar um novo plano
4. Deve funcionar agora! ✅

---

## 🔍 Verificação

Após atualizar as regras, você deve conseguir:
- ✅ Criar novos planos
- ✅ Editar planos existentes
- ✅ Deletar planos

**Apenas usuários com `tipoUsuario == 'admin'`** terão essas permissões.

---

## ⚠️ Importante

- As regras são aplicadas **imediatamente** após publicar
- Certifique-se de que seu usuário tem `tipoUsuario: 'admin'` no Firestore
- Se ainda der erro, verifique se você está logado como admin no app

---

**Última atualização**: Versão 1.0.4

