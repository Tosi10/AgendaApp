# 📋 Guia: Gerenciamento de Planos para Admin

## ✅ O que foi implementado

Agora o admin pode gerenciar os planos diretamente no app:
- ✅ Criar novos planos
- ✅ Editar planos existentes (nome, valores, cores, etc.)
- ✅ Deletar planos
- ✅ Marcar planos como destaque
- ✅ Definir ordem de exibição
- ✅ Adicionar múltiplos valores (Mensal, Trimestral, À vista)

---

## 🚀 Primeira Configuração

### Passo 1: Migrar Planos Existentes para Firebase

Na primeira vez, você precisa migrar os planos que estão no código para o Firebase:

**Opção A: Via Script (Recomendado)**
```bash
node scripts/migrar-planos-firebase.js
```

**Opção B: Manualmente no App**
1. Abra o app como admin
2. Vá em "Início"
3. Clique no botão de engrenagem (⚙️) ao lado de "Nossos Planos"
4. Clique em "Criar Novo Plano"
5. Preencha os dados de cada plano manualmente

---

## 📱 Como Usar

### Acessar Gerenciamento de Planos

1. Faça login como **admin**
2. Vá na aba **"Início"**
3. Na seção "Nossos Planos", você verá um botão de **engrenagem (⚙️)** no canto superior direito
4. Clique no botão para abrir a página de gerenciamento

### Criar Novo Plano

1. Clique em **"Criar Novo Plano"**
2. Preencha:
   - **Nome do Plano**: Ex: "Quem corre é a bola⚽️"
   - **Frequência**: Ex: "1x na semana"
   - **Aulas no Mês**: Ex: "4 aulas no mês"
   - **Regra de Reposição**: Ex: "❌ Sem direito a reposição"
   - **Cor do Plano**: Escolha uma das cores disponíveis
   - **Ordem de Exibição**: Número para ordenar (0 = primeiro)
   - **Plano Destaque**: Marque se quiser destacar
3. Configure os valores:
   - Marque quais valores deseja (Mensal, Trimestral, À vista)
   - Preencha o valor e forma de pagamento para cada um
4. Clique em **"Criar Plano"**

### Editar Plano Existente

1. Na lista de planos, clique em **"✏️ Editar"**
2. Modifique os campos desejados
3. Clique em **"Salvar Alterações"**

### Deletar Plano

1. Na lista de planos, clique em **"🗑️ Deletar"**
2. Confirme a exclusão

---

## 🎨 Recursos Disponíveis

### Cores Disponíveis
- Azul (#3B82F6)
- Verde (#10B981)
- Amarelo/Laranja (#F59E0B)
- Vermelho/Rosa (#EF4444)
- Roxo (#8B5CF6)
- Rosa (#EC4899)

### Valores Múltiplos
Você pode configurar:
- ✅ Valor Mensal (obrigatório pelo menos um)
- ✅ Valor Trimestral (opcional)
- ✅ Valor À Vista (opcional)

### Plano Destaque
- Marque para destacar o plano com borda amarela
- Aparece badge "⭐ PLANO DESTAQUE"

### Ordem de Exibição
- Use números para ordenar os planos
- 0 = primeiro, 1 = segundo, etc.
- Planos são exibidos em ordem crescente

---

## 📊 Estrutura no Firebase

Os planos são armazenados na coleção `planos` com a seguinte estrutura:

```json
{
  "nome": "Quem corre é a bola⚽️",
  "frequencia": "1x na semana",
  "aulas": "4 aulas no mês",
  "reposicao": "❌ Sem direito a reposição",
  "cor": "#3B82F6",
  "corGradiente": "from-blue-500 to-blue-600",
  "destaque": false,
  "ordem": 0,
  "valores": [
    {
      "tipo": "Mensal",
      "valor": "135,90",
      "forma": "Dinheiro ou PIX"
    }
  ],
  "dataCriacao": "timestamp",
  "ultimaAtualizacao": "timestamp"
}
```

---

## ⚠️ Importante

1. **Backup**: Sempre faça backup antes de deletar planos
2. **Ordem**: A ordem dos planos afeta como aparecem no app
3. **Valores**: Pelo menos um valor deve ser preenchido
4. **Design**: O design dos cards é mantido automaticamente

---

## 🔧 Troubleshooting

### Planos não aparecem
- Verifique se a coleção `planos` existe no Firebase
- Execute o script de migração se necessário
- Verifique as regras de segurança do Firebase

### Erro ao salvar
- Verifique se todos os campos obrigatórios estão preenchidos
- Verifique conexão com Firebase
- Veja o console para erros específicos

---

## 📝 Notas

- Os planos são carregados em tempo real do Firebase
- Mudanças são refletidas imediatamente para todos os usuários
- O design dos cards é mantido automaticamente
- Admin pode criar promoções facilmente editando valores

---

**Última atualização**: Versão 1.0.4

