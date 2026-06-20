---
trigger: always_on
---

# Regra de Padrões de Design (DESIGN.md)

Sempre que criar ou alterar elementos visuais, estilos, componentes de UI ou telas no aplicativo mobile (React Native/Expo) ou na web, o agente **DEVE** obrigatoriamente ler o arquivo `DESIGN.md` na raiz do repositório antes de realizar qualquer modificação.

## Diretrizes obrigatórias para o Agente:

1. **Consulta obrigatória**: Antes de iniciar qualquer tarefa relacionada à interface do usuário (UI/UX) ou estilização/CSS, utilize a ferramenta `view_file` para ler o arquivo `DESIGN.md` localizado na raiz do projeto (`/DESIGN.md`).
2. **Uso de Tokens**: Siga e utilize os tokens exatos (como paleta de cores hexadecimais, escala de tipografia, arredondamento de cantos, espaçamentos) definidos na seção de Front Matter e no corpo do `DESIGN.md`.
3. **Fidelidade ao Tema**: Siga estritamente as regras de layout, arredondamento de cantos (border-radius), uso de hairlines para divisão, ausência de sombras (tonal layering) e estilos específicos de botões/cartões/gráficos descritos.
4. **Fonte Única de Verdade**: Não duplique ou tente adivinhar estilos. O arquivo `/DESIGN.md` é a única fonte de verdade para a identidade do projeto "Quiet Luxury Financial AI".
