# 🔍 Guia: Verificar por que a versão nova não está no celular

## Problema
Você fez upload da versão 1.0.4 mas o celular ainda mostra a versão antiga (1.0.2).

## ✅ Checklist de Verificação

### 1️⃣ Verificar Status no Google Play Console

1. Acesse: https://play.google.com/console
2. Vá em: **"Testes fechados - Alpha"** → **"Lançamentos"**
3. Verifique:
   - ✅ Qual versão está marcada como **"Ativo"** ou **"Publicado"**?
   - ⚠️ Se a 1.0.4 está como **"Rascunho"**, precisa ativar primeiro
   - ⚠️ Se está **"Em revisão"**, precisa aguardar aprovação do Google

### 2️⃣ Verificar Versão Instalada no Celular

**Método 1: Play Store**
1. Abra Google Play Store
2. Toque no menu (3 linhas) → **"Meus apps e jogos"**
3. Procure "M2 Academia"
4. Veja a versão mostrada lá

**Método 2: Configurações do Android**
1. Configurações → Apps → "M2 Academia"
2. Role até o final
3. Veja "Versão do app"

**Método 3: Dentro do App**
- Alguns apps mostram versão no menu "Sobre" ou "Ajuda"

### 3️⃣ Forçar Atualização no Play Store

1. **Limpar cache do Play Store:**
   - Configurações → Apps → Google Play Store
   - Armazenamento → **"Limpar cache"**
   - Não limpe dados (senão precisa logar de novo)

2. **Forçar atualização:**
   - Abra Play Store
   - Menu → "Meus apps e jogos"
   - Puxar para baixo (refresh)
   - Verificar se aparece "Atualizar" no M2 Academia

3. **Aguardar propagação:**
   - Após ativar no Console, pode levar 1-2 horas
   - Google Play precisa propagar para todos os servidores

### 4️⃣ Se Nada Funcionar: Reinstalar

1. Desinstalar o app completamente
2. Ir no link de teste de novo
3. Instalar do zero (vem a versão mais nova)

---

## 🎯 Causas Mais Comuns

### ❌ Lançamento ainda em "Rascunho"
**Sintoma:** Versão 1.0.4 criada mas não ativada
**Solução:** Ativar o lançamento no Console

### ❌ Em revisão pelo Google
**Sintoma:** Status mostra "Em revisão"
**Solução:** Aguardar aprovação (1-3 dias normalmente)

### ❌ Cache do Play Store desatualizado
**Sintoma:** Play Store não mostra atualização
**Solução:** Limpar cache e forçar atualização

### ❌ Propagação ainda não completou
**Sintoma:** Ativou há pouco tempo
**Solução:** Aguardar 1-2 horas

---

## 🚀 Solução Rápida (Teste Imediato)

Para testar AGORA sem esperar o Google Play:

### Opção 1: Internal App Sharing (Recomendado)
1. Google Play Console → "Partilha interna de apps"
2. Upload do AAB
3. Pegar o link curto
4. Abrir no celular e instalar diretamente

### Opção 2: Instalar APK diretamente (Desenvolvimento)
```bash
# Baixar o AAB do build
eas build:download --platform android --latest

# Converter para APK (se necessário)
# ou instalar via adb install
```

---

## ⏱️ Tempo Esperado

- **Ativação instantânea:** 0 minutos (mas pode levar 1-2h para propagar)
- **Revisão do Google:** 1-3 dias úteis
- **Propagação global:** 2-24 horas

---

## ✅ Status Esperado (Quando Estiver Pronto)

- ✅ Versão 1.0.4 marcada como **"Ativo"** no Console
- ✅ Status mostra **"Publicado"** ou **"Disponível para testadores"**
- ✅ Play Store mostra **"Atualizar"** disponível
- ✅ App funciona com agendamento em grupo (6 alunos Personal)

---

**Última atualização:** Versão 1.0.4
