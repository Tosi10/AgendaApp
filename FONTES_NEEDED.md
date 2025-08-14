# Fontes Necessárias para o AgendaApp

## Fontes Poppins

O projeto AgendaApp utiliza a família de fontes Poppins para uma tipografia moderna e legível. As seguintes fontes precisam ser baixadas e colocadas na pasta `assets/fonts/`:

### Lista de Fontes Necessárias

1. **Poppins-Thin.ttf** - Peso 100
2. **Poppins-ExtraLight.ttf** - Peso 200
3. **Poppins-Light.ttf** - Peso 300
4. **Poppins-Regular.ttf** - Peso 400
5. **Poppins-Medium.ttf** - Peso 500
6. **Poppins-SemiBold.ttf** - Peso 600
7. **Poppins-Bold.ttf** - Peso 700
8. **Poppins-ExtraBold.ttf** - Peso 800
9. **Poppins-Black.ttf** - Peso 900

## Como Baixar as Fontes

### Opção 1: Google Fonts (Recomendado)
1. Acesse [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
2. Clique em "Download family"
3. Extraia o arquivo ZIP
4. Copie os arquivos .ttf para `assets/fonts/`

### Opção 2: Fontsquirrel
1. Acesse [Fontsquirrel](https://www.fontsquirrel.com/fonts/poppins)
2. Baixe a família completa
3. Extraia e copie os arquivos .ttf

### Opção 3: CDN Direto
```bash
# Criar pasta de fontes
mkdir -p assets/fonts

# Baixar cada fonte individualmente
curl -o assets/fonts/Poppins-Thin.ttf "https://fonts.gstatic.com/s/poppins/v20/pxiGyp8kv8JHgFVrLPTucHtA.woff2"
curl -o assets/fonts/Poppins-ExtraLight.ttf "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLPGqZ1VlFw.woff2"
curl -o assets/fonts/Poppins-Light.ttf "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDz8Z1VlFw.woff2"
curl -o assets/fonts/Poppins-Regular.ttf "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2"
curl -o assets/fonts/Poppins-Medium.ttf "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLGT9Z1VlFw.woff2"
curl -o assets/fonts/Poppins-SemiBold.ttf "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6Z1VlFw.woff2"
curl -o assets/fonts/Poppins-Bold.ttf "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1VlFw.woff2"
curl -o assets/fonts/Poppins-ExtraBold.ttf "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLDD4Z1VlFw.woff2"
curl -o assets/fonts/Poppins-Black.ttf "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLPT5Z1VlFw.woff2"
```

## Estrutura de Pastas

Após baixar as fontes, sua estrutura deve ficar assim:

```
AgendaApp/
├── assets/
│   ├── fonts/
│   │   ├── Poppins-Thin.ttf
│   │   ├── Poppins-ExtraLight.ttf
│   │   ├── Poppins-Light.ttf
│   │   ├── Poppins-Regular.ttf
│   │   ├── Poppins-Medium.ttf
│   │   ├── Poppins-SemiBold.ttf
│   │   ├── Poppins-Bold.ttf
│   │   ├── Poppins-ExtraBold.ttf
│   │   └── Poppins-Black.ttf
│   └── images/
│       └── murilo.png
└── ...
```

## Verificação

Para verificar se as fontes estão funcionando:

1. Execute o projeto: `npm start`
2. Verifique se não há erros relacionados a fontes no console
3. As fontes devem ser aplicadas automaticamente usando as classes Tailwind:
   - `font-pthin` → Poppins-Thin
   - `font-pextralight` → Poppins-ExtraLight
   - `font-plight` → Poppins-Light
   - `font-pregular` → Poppins-Regular
   - `font-pmedium` → Poppins-Medium
   - `font-psemibold` → Poppins-SemiBold
   - `font-pbold` → Poppins-Bold
   - `font-pextrabold` → Poppins-ExtraBold
   - `font-pblack` → Poppins-Black

## Solução de Problemas

### Erro: "Font family not found"
- Verifique se os arquivos estão na pasta correta
- Verifique se os nomes dos arquivos estão exatos
- Reinicie o servidor de desenvolvimento

### Erro: "Cannot resolve module"
- Verifique se o caminho em `lib/fonts.js` está correto
- Verifique se não há espaços ou caracteres especiais nos nomes dos arquivos

### Fontes não carregam
- Limpe o cache: `npx expo start --clear`
- Verifique se o Metro bundler está funcionando
- Verifique se não há erros de sintaxe no arquivo `lib/fonts.js`

## Alternativa: Usar Fontes do Sistema

Se preferir não baixar as fontes Poppins, você pode modificar o arquivo `tailwind.config.js` para usar fontes do sistema:

```javascript
fontFamily: {
  pthin: ["System", "sans-serif"],
  pextralight: ["System", "sans-serif"],
  plight: ["System", "sans-serif"],
  pregular: ["System", "sans-serif"],
  pmedium: ["System", "sans-serif"],
  psemibold: ["System", "sans-serif"],
  pbold: ["System", "sans-serif"],
  pextrabold: ["System", "sans-serif"],
  pblack: ["System", "sans-serif"],
},
```

E remover o carregamento de fontes do `app/_layout.jsx`.

---

**Nota**: As fontes Poppins são gratuitas para uso comercial e pessoal, conforme licença Open Font License.
