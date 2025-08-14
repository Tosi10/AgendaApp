# AgendaApp - Sistema de Agendamento com Controle de Usuários

## Descrição

AgendaApp é um aplicativo React Native para agendamento de aulas com sistema de controle de usuários diferenciado. O sistema suporta dois tipos de usuários:

- **Alunos**: Usuários que podem agendar aulas e gerenciar seu perfil
- **Administradores/Professores**: Usuários com controle total sobre alunos, aprovação de contas e gerenciamento de M2 Coins

## Funcionalidades

### Para Alunos
- Cadastro e login com aprovação pendente
- Visualização de perfil e M2 Coins
- Histórico de aulas agendadas e realizadas
- Edição de apelido
- Aguardo de aprovação de administrador

### Para Administradores/Professores
- Controle total sobre usuários
- Aprovação/rejeição de contas de alunos
- Edição de M2 Coins dos alunos
- Visualização de todos os usuários cadastrados
- Acesso ilimitado ao sistema

## Estrutura do Projeto

```
AgendaApp/
├── app/
│   ├── (auth)/
│   │   ├── sign-in.jsx          # Tela de login
│   │   ├── sign-up.jsx          # Tela de cadastro com seleção de tipo
│   │   └── waiting-approval.jsx # Tela de aguardo de aprovação
│   ├── (tabs)/
│   │   ├── perfil.jsx           # Perfil do usuário (diferente para admin/aluno)
│   │   └── ...                  # Outras abas
│   └── _layout.jsx              # Layout raiz com carregamento de fontes
├── components/
│   ├── M2Coin.jsx               # Componente para exibir M2 Coins
│   ├── BackgroundLogo.jsx       # Componente de fundo
│   ├── FormField.jsx            # Campo de formulário
│   └── CustomButton.jsx         # Botão personalizado
├── context/
│   └── GlobalProvider.jsx       # Contexto global com gerenciamento de usuários
├── lib/
│   ├── firebase.js              # Configuração do Firebase
│   └── fonts.js                 # Carregamento de fontes personalizadas
└── constants/
    └── Colors.ts                # Paleta de cores
```

## Tecnologias Utilizadas

- **React Native** com Expo
- **Firebase** (Auth + Firestore)
- **NativeWind** (Tailwind CSS para React Native)
- **Expo Router** para navegação
- **Expo Linear Gradient** para gradientes

## Configuração do Firebase

O projeto está configurado para usar o Firebase. Certifique-se de que as seguintes coleções existem no Firestore:

### Coleção: `usuarios`
Estrutura de cada documento:
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

### Coleção: `agendamentos`
Estrutura para histórico de aulas dos alunos.

## Instalação e Configuração

### 1. Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Conta Firebase configurada

### 2. Instalação das Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configuração do Firebase
1. Crie um projeto no Firebase Console
2. Ative Authentication e Firestore
3. Atualize as configurações em `lib/firebase.js`

### 4. Executar o Projeto
```bash
npm start
# ou
yarn start
```

## Fontes Personalizadas

O projeto usa a família de fontes Poppins. As fontes devem estar disponíveis em `assets/fonts/`:

- Poppins-Thin.ttf
- Poppins-ExtraLight.ttf
- Poppins-Light.ttf
- Poppins-Regular.ttf
- Poppins-Medium.ttf
- Poppins-SemiBold.ttf
- Poppins-Bold.ttf
- Poppins-ExtraBold.ttf
- Poppins-Black.ttf

## Fluxo de Usuário

### Cadastro de Aluno
1. Usuário se cadastra como "Aluno"
2. Conta é criada com status "Pendente"
3. Usuário é redirecionado para tela de aguardo
4. Administrador aprova/rejeita a conta
5. Após aprovação, usuário acessa o sistema

### Cadastro de Administrador
1. Usuário se cadastra como "Professor"
2. Conta é criada com status "Aprovado" automaticamente
3. Usuário acessa o sistema imediatamente
4. Acesso total a funcionalidades administrativas

## Funcionalidades Administrativas

### Painel de Controle
- Visualização de todos os usuários cadastrados
- Aprovação/rejeição de contas pendentes
- Edição de M2 Coins dos alunos
- Estatísticas de usuários

### Gerenciamento de M2 Coins
- Visualização do saldo atual de cada aluno
- Edição direta do saldo
- Histórico de alterações

## Personalização

### Cores
As cores podem ser personalizadas em `constants/Colors.ts` e `tailwind.config.js`.

### Estilos
O projeto usa NativeWind (Tailwind CSS) para estilização. Os estilos podem ser modificados usando classes Tailwind.

## Troubleshooting

### Problemas Comuns

1. **Fontes não carregam**: Verifique se os arquivos de fonte estão em `assets/fonts/`
2. **Erro de Firebase**: Verifique as configurações em `lib/firebase.js`
3. **Erro de navegação**: Verifique se todas as rotas estão definidas nos layouts

### Logs
O projeto inclui logs detalhados para debugging. Verifique o console para mensagens de erro.

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Suporte

Para suporte, entre em contato através de:
- Issues do GitHub
- Email: [seu-email@exemplo.com]

---

**Desenvolvido com ❤️ usando React Native e Firebase**
