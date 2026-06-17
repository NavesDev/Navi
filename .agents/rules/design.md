# Regra de Padrões de Design System (Quiet Luxury)

Ao criar, estilizar ou modificar qualquer elemento de interface (web, mobile ou componentes), siga rigorosamente as especificações do Design System "Quiet Luxury".

## Paleta de Cores (Tokens)

Use exatamente os seguintes valores hexadecimais:
* **Background**: `#131313` ou `#0A0A0A` (canvas principal escuro)
* **Surface**: `#1A1A1A` ou `#131313` (containers secundários e cartões)
* **Surface Bright**: `#3a3939`
* **Primary (Champagne)**: `#f1e1d4` ou `#d4c5b9` (cor principal de destaque/ação, ouro fosco)
* **Secondary (Silver)**: `#c6c6c6` (texto secundário e ícones utilitários)
* **Borders (Hairlines)**: `#2A2A2A` (bordas finas de 1px)
* **Error**: `#ffb4ab` / `#93000a`

## Tipografia

* **Títulos (Headlines)**: Sempre utilize a fonte **Playfair Display**. Utilize letter-spacing ligeiramente menor para tamanhos grandes. Evite negrito (bold) excessivo; a própria serifa da fonte provê o peso necessário.
* **Corpo e UI (Body/Label)**: Sempre utilize a fonte **Inter**. É a fonte padrão para legibilidade de dados numéricos e texto de interface.
* **Etiquetas/Legendas (Labels)**: Textos pequenos e legendas devem usar **Inter** com peso médio (medium), espaçamento entre letras aumentado (letter-spacing) e, preferencialmente, caixa alta (uppercase).

## Elevação e Profundidade (Tonal Layering)

* **Sem sombras**: Não use sombras (`box-shadow`, `elevation`, etc.). O design é plano.
* **Camadas (Layering)**: A profundidade é alcançada pela alternância de cores:
  * Fundo principal: `#0A0A0A` ou `#131313`
  * Cards e áreas interativas: `#1A1A1A` ou `#1c1b1b`
* **Linhas de Separação (Hairlines)**: Use bordas finas de `1px solid #2A2A2A` para delimitar componentes e seções.

## Formas (Shapes)

* **Arredondamento**: Use um raio de canto universal de **4px** (`soft` / `0.25rem`) em botões, campos de entrada e cartões. Evite cantos totalmente redondos (bubbly) ou pontiagudos de 90 graus absolutos.
* **Ícones**: Use ícones lineares com traço fino (1px a 1.5px). Evite ícones preenchidos ou arredondados. A cor do ícone deve seguir a cor do texto adjacente.

## Diretrizes de Componentes

* **Botões**:
  * *Primário*: Fundo Champagne (`#D4C5B9`) com texto preto e cantos de 4px.
  * *Secundário*: Estilo contornado (ghost) com borda de 1px (`#2A2A2A`) e texto prateado (`#c6c6c6`).
* **Campos de Entrada (Inputs)**: Apenas borda inferior (bottom-border) ou contorno completo muito sutil (`#2A2A2A`). Sem preenchimento de fundo, exceto quando focado. Quando focado, a borda muda para Champagne.
* **Cartões (Cards)**: Sem sombras, borda de 1px (`#2A2A2A`) e fundo `#1A1A1A`.
* **Tabelas e Listas**: Linhas separadas por hairlines (`#2A2A2A`) e espaçamento vertical generoso (padding de 16px a 24px).
* **Gráficos**: Linhas finas de 1pt. Use Champagne como a cor principal das linhas e preenchimento muito sutil abaixo da linha se necessário. Sem linhas de grade (ou grade muito tênue em `#1A1A1A`).
