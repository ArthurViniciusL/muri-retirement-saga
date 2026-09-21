# Guia de Estilo Visual — Jogo "A Aposentadoria de Muri"

## 1. Escopo deste documento

Este guia cobre **exclusivamente os elementos visuais do jogo** (personagens, cenário, UI, puzzle). Ele diverge deliberadamente da paleta tricolor do design system compartilhado "Cordel Arcade" (Preto Entalhe + Branco Osso + Marrom Sertão), que segue valendo para o convite. O jogo passa a usar uma **paleta estritamente monocromática**, baseada na escala `zinc` do shadcn/Tailwind — sem o marrom complementar. Essa restrição, na prática, aproxima o jogo ainda mais da referência de xilogravura tradicional, que historicamente é impressa em alto contraste preto sobre claro.

> ⚠️ Ponto a registrar: como isso muda a paleta combinada nos dois documentos anteriores do projeto, vale alinhar com o design system compartilhado se essa divergência é só para o jogo (como especificado aqui) ou se deve refletir de volta no documento de design system geral.

## 2. Paleta de cores — escala `zinc`

| Tom | Hex | Uso recomendado |
| --- | --- | --- |
| zinc-50 | `#FAFAFA` | Fundo mais claro / "papel" |
| zinc-100 | `#F4F4F5` | Fundo secundário, áreas de respiro |
| zinc-200 | `#E4E4E7` | Camadas de fundo distante (parallax) |
| zinc-300 | `#D4D4D8` | Camadas de fundo intermediário |
| zinc-400 | `#A1A1AA` | Elementos de cenário em segundo plano |
| zinc-500 | `#71717A` | Tom médio — sombreamento intermediário via hachura |
| zinc-600 | `#52525B` | Contornos suaves, detalhes internos de sprite |
| zinc-700 | `#3F3F46` | Silhuetas de elementos de primeiro plano |
| zinc-800 | `#27272A` | Contornos principais de personagens/inimigos |
| zinc-900 | `#18181B` | Traço/contorno de destaque, texto sobre fundo claro |
| zinc-950 | `#09090B` | Preto de maior contraste — usar com moderação, só onde o traço xilogravura pede o "entalhe" mais profundo |

**Regra geral**: cada sprite (personagem, inimigo, elemento de cenário) deve se apoiar em no máximo 3–4 tons da escala por vez (ex.: `zinc-950` para contorno, `zinc-700` para sombra, `zinc-100` para luz, `zinc-50` para fundo do próprio sprite) — usar a escala inteira de uma vez em um único elemento quebra a leitura "entalhada" e aproxima de um efeito de gradiente suave, que é proibido (ver §3).

## 3. Princípios de traço e textura

Herdados do design system compartilhado, mas ainda mais centrais agora que não há cor para carregar a informação visual:

- **Linhas grossas e levemente irregulares** — nunca vetores perfeitamente lisos, mesmo em baixa resolução.
- **Sombra sempre por hachura** (linhas paralelas/cruzadas ou dithering pixel a pixel) — nunca gradiente suave ou drop shadow. Em pixel art, isso se traduz em usar *dithering* (alternância de pixels entre dois tons de zinc) para simular meio-tom, no lugar de qualquer interpolação de cor.
- **Sem glow, brilho ou transparência** — qualquer destaque visual (ex.: item coletável piscando) deve ser feito por variação de tom (zinc claro vs. escuro), nunca por opacidade ou efeito de luz.
- **Contorno é obrigatório em todo sprite jogável** — um contorno de 1px em `zinc-950` (ou o tom mais escuro disponível no sprite) em volta de personagens, inimigos e itens, garantindo leitura contra qualquer fundo.
- **Silhueta em primeiro lugar**: como não há cor para diferenciar Muri de um morcego ou de uma ladra à distância, cada entidade precisa ser reconhecível só pela silhueta, antes de qualquer detalhe interno.

## 4. Grid e escala dos sprites

- Base definida: **pixel art em baixa resolução clássica**, na faixa de **32×32 a 64×64 px** por sprite de personagem/inimigo.
- **Antes de iniciar a produção de assets, é preciso travar um valor único** (32×32 *ou* 64×64) para todos os sprites de entidade — misturar as duas escalas no mesmo jogo quebra a proporção entre Muri, inimigos e cenário.
- Tiles de cenário devem seguir o mesmo grid escolhido para o personagem, para que o tilemap se encaixe sem reamostragem.
- Elementos de UI (corações, ícones de item, cartas do puzzle) podem ter escala própria, mas sempre múltipla do grid base (ex.: se o grid é 32px, ícones de UI em 16px ou 32px — nunca em valores quebrados como 20px ou 48px).

## 5. Personagens — diretrizes e variações necessárias

### Muri (jogável)
| Ação | Frames sugeridos | Observação |
| --- | --- | --- |
| Idle | 2–4 | Respiração/balanço sutil |
| Andar | 4–6 | Ciclo de caminhada |
| Pular | 3 | Subida / ápice / descida |
| Agachar | 1–2 | Pose estática + transição |
| Ataque corpo a corpo | 2–3 | Preparação + golpe |
| Ataque à distância | 2–3 | Preparação + arremesso (projétil é sprite separado) |
| Defender | 1–2 | Pose de guarda (sustentável enquanto o botão é segurado) |
| Dano (Hurt) | 1 | Frame de reação rápida — sem knockback, então é só feedback visual |

Direção: produzir **virado para a direita** e espelhar via código para a esquerda (convenção padrão, evita duplicar arte).

### Inimigos (morcego, gato selvagem, bola de fogo)
| Ação | Frames sugeridos | Observação |
| --- | --- | --- |
| Movimento (voo/corrida/trajetória) | 2–4 | Loop contínuo |
| Derrota (1 hit) | 2–3 | Sprite de "quebra"/desaparecimento — reforça o traço xilogravura estourando em fragmentos, por exemplo |

Cada inimigo precisa de silhueta clara e distinta dos outros dois, já que todos causam o mesmo tipo de dano (1 coração) — a diferenciação visual ajuda o jogador a antecipar o padrão de movimento (voa / corre no chão / passa pelo meio).

### As ladras (Maryana, Mayra, Weruska)
- Sprite parado + 1 pose de "abordagem" (momento do roubo).
- Silhuetas distintas entre as três, para o jogador reconhecer de longe qual delas está se aproximando (e decidir se desvia).
- Não precisam de ciclo de andar complexo — são eventos de contato, não perseguem o jogador ativamente (a menos que a IA definida em produção diga o contrário).
- Cada uma acompanha uma **moldura de balão de diálogo** reutilizável (mesma moldura para as três, só o texto muda).

## 6. Cenário / tilemap

- Tileset modular por fase, seguindo o tema de cada uma (instrumentos / vídeo games / moedas), mas sempre dentro da paleta zinc.
- Variações mínimas por tile de plataforma: **tile de topo, tile de repetição (meio), tile de canto esquerdo, tile de canto direito** — permite montar plataformas de qualquer comprimento sem esticar a arte.
- **Parallax em pelo menos 3 camadas de profundidade**, usando tom como recurso de profundidade (já que não há cor):
  - Fundo distante: tons claros (`zinc-100`–`zinc-300`), baixo contraste, silhuetas simples (ex.: sol estilizado, montanhas).
  - Camada intermediária: tons médios (`zinc-400`–`zinc-600`).
  - Primeiro plano/plataformas jogáveis: tons escuros e alto contraste (`zinc-700`–`zinc-950`), para garantir que o que é "chão" nunca seja confundido com decoração de fundo.
- Repertório iconográfico do design system compartilhado (mandacaru, cactos, sol estilizado, terra rachada, flora estilizada, instrumentos musicais) continua válido como elementos de cenário — adaptado ao traço monocromático.
- Pontos de trigger (altar/barraca do puzzle, pickups de munição, moedas) precisam de leitura clara mesmo em tons de cinza — usar contorno + tom de maior contraste, nunca depender de cor para indicar "isso é interativo".

## 7. UI / HUD

| Elemento | Variações necessárias |
| --- | --- |
| Corações (vida) | Cheio / vazio (mínimo 2 estados); opcional: 1 frame de "quebra" na transição |
| Moedas comuns (contador) | Ícone único, sem variação de estado |
| Munição (ataque à distância) | Ícone cheio / vazio, repetido conforme munição atual |
| Itens essenciais (instrumento, CDs, cofre) | Versão silhueta (não coletado) / versão preenchida (coletado) |
| Botões de controle virtual (D-pad, pular, atacar, atacar à distância, defender) | Estado normal / estado pressionado (2 estados cada) |
| Balão de diálogo das ladras | Moldura única reutilizável + área de texto |

Todo elemento de HUD deve ter contorno próprio e não pode depender de sobreposição de opacidade para se destacar do cenário atrás dele — HUD sempre em camada separada, renderizada por cima da cena de jogo.

## 8. Puzzle — cartas do jogo da memória

- Grid de 25 cartas (5×5), cada carta com:
  - **Verso** (fechado): padrão único, igual para todas as cartas da fase.
  - **Frente** (revelado): ilustração temática (instrumentos / games / moedas conforme a fase).
- Ilustrações das cartas seguem a mesma paleta zinc e princípios de traço do restante do jogo (hachura, contorno, sem gradiente) — mesmo sendo um elemento de UI, deve parecer parte do mesmo mundo visual, não um estilo à parte.
- Tamanho de carta: múltiplo do grid base (§4), grande o suficiente para leitura em tela de celular (sugestão mínima: 48×48px de área útil por carta, ajustável conforme teste de usabilidade).

## 9. Contraste e legibilidade (regra crítica em paleta monocromática)

Sem cor para diferenciar categorias de elementos (jogável vs. decorativo, ameaça vs. seguro), o contraste de tom é a **única ferramenta de comunicação visual** disponível. Regras obrigatórias:

1. Elementos com os quais o jogador colide (plataformas, inimigos, ladras, hazards) sempre nos tons mais escuros e de maior contraste da paleta (`zinc-700` a `zinc-950`).
2. Elementos puramente decorativos (fundo, parallax) sempre em tons médios a claros (`zinc-50` a `zinc-500`), nunca competindo em contraste com o que é jogável.
3. Nunca posicionar dois elementos de tons adjacentes (ex.: `zinc-800` sobre `zinc-900`) sem um contorno separando — o efeito de "esconder" contra o fundo pode ser intencional para elementos decorativos, mas nunca para nada com o qual o jogador precise interagir ou desviar.

## 10. Convenção de nomenclatura de arquivos (sugestão)

```
<entidade>_<ação>_<frame>.png
muri_idle_01.png
muri_walk_03.png
bat_fly_02.png
maryana_idle.png
puzzle_card_instrumento_violao.png
ui_heart_full.png
ui_heart_empty.png
```

Facilita a integração no Phaser (sprite atlas) e a organização em `src/assets/sprites/` conforme a estrutura de pastas do System Design.

## 11. Checklist resumido — variações mínimas por tipo de sprite

| Tipo de sprite | Variações mínimas |
| --- | --- |
| Muri (jogável) | 9 conjuntos de animação (idle, andar, pular, agachar, ataque corpo a corpo, ataque à distância, defender, dano) × 1–6 frames cada, direção única (espelhada por código) |
| Inimigo (cada tipo) | 1 animação de movimento (loop) + 1 animação de derrota |
| Ladra (cada uma) | 1 pose parada + 1 pose de abordagem + moldura de diálogo compartilhada |
| Tile de plataforma (por tema de fase) | Topo, meio, canto esquerdo, canto direito |
| Camada de parallax | Mínimo 3 camadas por fase (fundo distante, meio, primeiro plano) |
| Carta de puzzle (por tema de fase) | Verso único + 1 frente por imagem temática (mínimo o suficiente para preencher 25 cartas = ao menos 12–13 imagens únicas em pares) |
| Ícone de HUD (coração, munição) | Estado cheio + estado vazio |
| Ícone de item essencial | Silhueta (não coletado) + preenchido (coletado) |
| Botão de controle virtual | Normal + pressionado |
