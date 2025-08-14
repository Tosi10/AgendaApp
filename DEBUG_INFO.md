# Informações de Debug - AgendaApp

## Problemas Identificados e Soluções

### 1. ✅ Edição de Coins não funcionava
**Problema**: `Alert.prompt` não funciona no React Native
**Solução**: Criado modal customizado para edição de coins

### 2. ✅ Apenas 2 usuários aparecendo
**Problema**: Filtro estava removendo usuários não-alunos
**Solução**: Removido filtro para mostrar todos os usuários

### 3. ✅ Botão de logout não aparecia
**Problema**: Botão estava presente mas pode ter sido removido acidentalmente
**Solução**: Verificado que botão está presente em ambas as telas

## Como Testar

### Teste 1: Edição de Coins
1. Faça login como administrador
2. Vá para a aba "Perfil"
3. Clique em "Editar Coins" em qualquer usuário
4. Digite uma nova quantidade
5. Clique em "Salvar"

### Teste 2: Visualização de Usuários
1. Como administrador, verifique se todos os usuários aparecem
2. Deve mostrar tanto alunos quanto administradores
3. Contador deve refletir o número total

### Teste 3: Logout
1. Em qualquer tela de perfil, deve haver botão "Sair da Conta"
2. Clique no botão para fazer logout
3. Deve redirecionar para tela de login

## Estrutura de Dados Esperada

### Coleção: usuarios
```json
{
  "uid": "string",
  "email": "string", 
  "apelido": "string",
  "tipoUsuario": "aluno" | "admin",
  "m2Coins": number,
  "plano": "string",
  "aprovado": boolean,
  "dataCriacao": "timestamp",
  "ultimaAtualizacao": "timestamp"
}
```

## Logs para Debug

### Console do Navegador/Expo
- Verificar se há erros de JavaScript
- Verificar se as funções estão sendo chamadas
- Verificar se os dados estão sendo carregados

### Firebase Console
- Verificar se as coleções existem
- Verificar se os documentos estão sendo criados/atualizados
- Verificar regras de segurança

## Comandos Úteis

```bash
# Limpar cache do Expo
npx expo start --clear

# Ver logs detalhados
npx expo start --dev-client

# Verificar dependências
npm list

# Reinstalar dependências
rm -rf node_modules && npm install
```

## Próximos Passos

1. Testar edição de coins
2. Verificar se todos os usuários aparecem
3. Testar logout
4. Criar contas de teste (aluno e admin)
5. Testar fluxo completo de aprovação
