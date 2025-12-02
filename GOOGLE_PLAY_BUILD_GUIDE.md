# 📱 Guia Completo: Build AAB para Google Play Store

## 🎯 O que você precisa saber

### Diferença entre APK e AAB
- **APK** (Android Package): formato antigo, usado para instalação direta
- **AAB** (Android App Bundle): **OBRIGATÓRIO** para Google Play desde agosto de 2021
  - Menor tamanho de download
  - Otimizado pelo Google Play
  - **Você PRECISA fazer build AAB para enviar ao Google Play**

### Teste Fechado (Closed Testing)
- Mínimo de **12 testadores** são necessários para passar no processo de revisão
- Google Play exige que você tenha testadores reais antes de aprovar o app
- Você adiciona emails de testadores no Google Play Console

---

## 📋 Passo a Passo Completo

### 1️⃣ Preparar o Projeto

#### 1.1 Verificar Configurações no `app.json`
O arquivo já está configurado com:
- ✅ `version`: "1.0.4"
- ✅ `android.versionCode`: 4 (número interno do Android)
- ✅ `android.package`: "com.m2academia.agendaapp"

#### 1.2 Verificar `eas.json`
Perfis de build já configurados:
- ✅ `production-aab`: Para build AAB (Google Play)

---

### 2️⃣ Instalar EAS CLI (se não tiver)

```bash
npm install -g eas-cli
```

### 3️⃣ Fazer Login no EAS

```bash
eas login
```

Você precisará fazer login com sua conta Expo.

---

### 4️⃣ Fazer o Build AAB

#### Opção A: Build na nuvem (Recomendado)
```bash
eas build --platform android --profile production-aab
```

Este comando:
- ✅ Cria um build AAB otimizado
- ✅ Faz upload automático para Expo
- ✅ Você recebe um link para download

#### Opção B: Build local (mais rápido, mas requer mais configuração)
```bash
eas build --platform android --profile production-aab --local
```

⚠️ **Nota**: Build local requer Android SDK configurado.

---

### 5️⃣ Aguardar Build

O build levará aproximadamente 15-30 minutos. Você pode:
- Ver o progresso no terminal
- Acessar https://expo.dev/accounts/seu-usuario/projects/agendaapp/builds
- Receberá um email quando completar

---

### 6️⃣ Download do AAB

Após o build completar:
1. Acesse o link fornecido ou o dashboard do Expo
2. Baixe o arquivo `.aab`
3. **IMPORTANTE**: Guarde este arquivo! Você precisará dele.

---

## 🚀 Enviar para Google Play Console

### 7️⃣ Acessar Google Play Console

1. Acesse: https://play.google.com/console
2. Faça login com sua conta do desenvolvedor
3. Selecione seu app: **"M2 Academia"**

---

### 8️⃣ Criar Nova Versão (Release)

1. No menu lateral, clique em **"Produção"** ou **"Teste"** → **"Teste fechado"**
2. Clique em **"Criar nova versão"** ou **"Criar release"**
3. Informações necessárias:
   - **Nome da versão**: `1.0.4` (versão do app)
   - **Notas da versão**: Use o texto do `VERSION_NOTES.md` que criamos

---

### 9️⃣ Fazer Upload do AAB

1. Na seção **"Artefatos do app"**, clique em **"Upload de arquivo"**
2. Selecione o arquivo `.aab` que você baixou
3. Aguarde o upload (pode levar alguns minutos)
4. Google Play validará automaticamente o arquivo

---

### 🔟 Configurar Teste Fechado (OBRIGATÓRIO)

#### 10.1 Criar Lista de Testadores

1. No menu lateral, vá em **"Testes"** → **"Testes internos"** ou **"Testes fechados"**
2. Clique em **"Criar lista de testadores"**
3. Crie uma lista chamada: **"Testadores Beta v1.0.4"**

#### 10.2 Adicionar Mínimo 12 Testadores

⚠️ **IMPORTANTE**: Você precisa de **MÍNIMO 12 TESTADORES**!

Como adicionar:
1. Clique em **"Adicionar testadores"**
2. Você pode adicionar de duas formas:

   **Opção A: Lista de emails**
   - Adicione pelo menos 12 emails de Gmail
   - Cada email receberá um link para testar
   
   **Opção B: URL de teste**
   - Google Play cria uma URL pública
   - Compartilhe a URL com seus testadores
   - Eles precisam ter conta Google e aceitar ser testadores

**Lista de exemplo (você precisa criar):**
```
testador1@gmail.com
testador2@gmail.com
testador3@gmail.com
testador4@gmail.com
testador5@gmail.com
testador6@gmail.com
testador7@gmail.com
testador8@gmail.com
testador9@gmail.com
testador10@gmail.com
testador11@gmail.com
testador12@gmail.com
```

#### 10.3 Associar Lista ao Release

1. Após criar a lista, volte para o release
2. Selecione a lista de testadores que você criou
3. Salve as alterações

---

### 1️⃣1️⃣ Preencher Informações Obrigatórias

Antes de publicar, você precisa preencher:

#### A. Conteúdo do App
- ✅ Descrição curta (até 80 caracteres)
- ✅ Descrição completa (até 4000 caracteres)
- ✅ Imagens de captura de tela (mínimo 2)
- ✅ Ícone do app (já configurado)
- ✅ Imagem destacada (opcional)

#### B. Classificação de Conteúdo
- ✅ Responder questionário sobre conteúdo do app
- ✅ Selecionar categoria apropriada
- ✅ Indicar se tem conteúdo para menores

#### C. Privacidade e Segurança
- ✅ Política de Privacidade (URL obrigatória)
- ✅ Declaração sobre dados coletados
- ✅ Formulário de Declaração de Privacidade (se aplicável)

#### D. Preços e Distribuição
- ✅ App gratuito ou pago
- ✅ Países de distribuição
- ✅ Concordar com políticas do Google

---

### 1️⃣2️⃣ Revisar e Enviar

1. Revise todas as informações
2. Verifique se não há erros ou avisos
3. Clique em **"Revisar release"**
4. Se tudo estiver OK, clique em **"Iniciar teste fechado"**

---

### 1️⃣3️⃣ Processo de Revisão do Google

Após enviar:
- ⏱️ **Tempo médio de revisão**: 1-3 dias
- 📧 Você receberá email quando aprovar ou rejeitar
- 🔍 Google Play verifica:
  - Qualidade do código
  - Políticas de conteúdo
  - Segurança
  - **Se você tem testadores ativos**

---

## ⚠️ Dicas Importantes

### Sobre os 12 Testadores

1. **Por que 12?** 
   - Google Play quer garantir que você tem usuários reais testando
   - Evita apps fictícios ou spam

2. **Quem pode ser testador?**
   - Qualquer pessoa com conta Google
   - Você mesmo pode ser um testador
   - Amigos, familiares, colegas
   - **NÃO precisa ser desenvolvedor**

3. **Como encontrar testadores?**
   - Você mesmo (sua conta Google)
   - Parentes e amigos
   - Colegas de trabalho
   - Grupo de teste interno
   - Comunidade da academia (se for apropriado)

4. **Testadores precisam fazer alguma coisa?**
   - Sim! Eles precisam:
     - Aceitar o convite (se por email)
     - OU clicar no link de teste e aceitar
     - Baixar o app pelo link fornecido
     - Usar o app (mínimo algumas vezes)

---

## 🔧 Comandos Úteis

### Ver builds anteriores
```bash
eas build:list
```

### Ver informações de um build específico
```bash
eas build:view
```

### Fazer build com versionCode automático
```bash
eas build --platform android --profile production-aab --auto-submit
```

### Baixar build diretamente via CLI
```bash
eas build:download --platform android
```

---

## 📝 Checklist Antes de Enviar

- [ ] Build AAB criado com sucesso
- [ ] Arquivo `.aab` baixado
- [ ] Versão atualizada no `app.json` (já feito: 1.0.4)
- [ ] versionCode atualizado (já feito: 4)
- [ ] Lista de pelo menos 12 testadores criada
- [ ] Testadores adicionados à lista
- [ ] Notas da versão preparadas
- [ ] Todas as seções do Google Play Console preenchidas
- [ ] Política de Privacidade disponível (URL)
- [ ] Imagens de captura de tela prontas
- [ ] Classificação de conteúdo preenchida
- [ ] App revisado e testado localmente

---

## 🆘 Problemas Comuns e Soluções

### Erro: "versionCode já existe"
**Solução**: Aumente o `versionCode` no `app.json`
```json
"versionCode": 5
```
E atualize a versão também:
```json
"version": "1.0.5"
```

### Erro: "Package name já existe"
**Solução**: Você já tem o package correto: `com.m2academia.agendaapp`
Se der erro, verifique se não há outro app com o mesmo package.

### Erro: "Não há testadores suficientes"
**Solução**: Adicione mais emails à lista. Mínimo 12!

### Build falha
**Solução**: 
- Verifique os logs: `eas build:view [build-id]`
- Verifique se todas as dependências estão corretas
- Tente fazer build limpo: `eas build --platform android --profile production-aab --clear-cache`

### Google Play rejeita o app
**Solução**: 
- Leia os motivos da rejeição no email
- Corrija os problemas
- Envie nova versão

---

## 📚 Recursos Adicionais

- [Documentação EAS Build](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)

---

## 🎉 Próximos Passos Após Aprovação

1. **Monitorar Feedback**: Veja comentários dos testadores
2. **Corrigir Bugs**: Se encontrar problemas, corrija e faça novo build
3. **Preparar Produção**: Após teste bem-sucedido, pode enviar para produção
4. **Marketing**: Divulgue o app quando estiver em produção!

---

**Última atualização**: Versão 1.0.4
**Build Number**: 4

---

## 📞 Comandos Rápidos

```bash
# Build AAB para Google Play
eas build --platform android --profile production-aab

# Ver status do build
eas build:list

# Download do build
eas build:download --platform android --latest
```
