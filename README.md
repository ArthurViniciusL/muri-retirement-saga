# muri-game — A Aposentadoria de Muri

Jogo de plataforma 2D side-scrolling para os 50 anos de Muricarliton. Roda 100% no
navegador (alvo: Chrome mobile, **orientação landscape**), como build estático — sem
backend, sem autenticação e sem persistência entre sessões.

## Documentos de referência (fonte de verdade)

Qualquer decisão de mecânica, arquitetura, nomenclatura ou estilo visual sai destes dois
documentos. Nada deve ser inventado fora deles — o que não estiver coberto vira uma
pergunta, não uma suposição.

- [System Design](.agents/docs/system-design.md) — arquitetura técnica, máquina
  de estados do personagem, estrutura de fases, sistemas de jogo.
- [Guia de Estilo](.agents/docs/guidelines.md) — paleta Cordel Arcade, grid de
  sprites, variações de asset necessárias.

## Stack

| Camada | Escolha |
| --- | --- |
| Package manager | Yarn |
| Build tool | Vite |
| Linguagem | TypeScript 6.x (`strict: true`) |
| Engine | Phaser 3.90.0 |
| Física | Phaser Arcade Physics |
| Tilemaps | Tiled (JSON) |
| Deploy | Vercel (estático) |
| Backend | Nenhum |

> TypeScript está fixado na linha **6.x** de propósito: o `typescript-eslint` 8.x ainda
> não suporta a API do TypeScript 7, e com TS 7 instalado o `yarn lint` quebra na
> inicialização do parser. Revisar quando o `typescript-eslint` anunciar suporte.

## Como rodar

```bash
yarn install
```

```bash
yarn dev
```

| Script | O que faz |
| --- | --- |
| `yarn dev` | Sobe o servidor de desenvolvimento do Vite |
| `yarn build` | Type-check (`tsc --noEmit`) + build de produção em `dist/` |
| `yarn preview` | Serve localmente o build de produção |
| `yarn lint` | Roda o ESLint em todo o projeto |

## Estado atual

Somente **setup inicial**: a estrutura de pastas está criada e todos os arquivos `.ts`
são stubs contendo apenas um comentário de cabeçalho com a responsabilidade do arquivo e
a seção correspondente do System Design. **Ainda não há lógica de jogo implementada** —
`yarn dev` sobe o servidor e carrega a página, mas a tela fica vazia (o `index.html` já
traz o aviso de orientação portrait). Nenhum asset de arte foi produzido.

## Estrutura

```
src/
  scenes/      Boot, Preload, Menu, PhaseSelect, Phase1–3, Puzzle, GameOver, Victory
  entities/    Player + enemies/ (Bat, WildCat, Fireball) + thieves/ (Thief, Maryana, Mayra, Weruska)
  systems/     PlayerStateMachine, HealthSystem, CurrencySystem, AmmoSystem,
               InputController, DialogueSystem, MemoryPuzzleEngine
  ui/          VirtualControls, HeartsHUD, CoinsHUD, AmmoHUD, DialogueBubble
  config/      gameConfig, phasesConfig
  data/        puzzleThemes/ (instrumentos, xbox, moedas) + dialogueLines/ (maryana, mayra, weruska)
  assets/      sprites/, tilemaps/, audio/
  main.ts
AGENTS.md       Base comum de todos os agentes (CLAUDE.md apenas a importa)
.agents/agents/ Os cinco agentes: game-designer, level-designer, game-artist,
                ui-ux-designer, dev
.agents/rules/  Regras normativas do projeto (em inglês), derivadas dos dois documentos
.agents/docs/   System Design + Guia de Estilo
.agents/skills/ Skills do projeto
.claude/        Symlinks para .agents/agents e .agents/skills, e comandos do OpenSpec
```

## TODOs abertos

- [ ] **Travar o grid de pixel art (32x32 **ou** 64x64 px)** antes de qualquer produção
      de asset. O Guia de Estilo (§4) deixa a faixa em aberto e alerta que misturar as
      duas escalas quebra a proporção entre Muri, inimigos e cenário. Tiles de cenário
      precisam seguir o mesmo grid, e ícones de UI devem ser múltiplos dele.
- [ ] Revalidar com a designer os HEX da paleta Cordel Arcade e os tons derivados
      (`art-palette-cordel.md`, `content-open-decisions.md` §1).
- [ ] Definir velocidade, alcance de detecção e rotas de cada inimigo ambiental
      (System Design §18).
- [ ] Definir quantidade e posicionamento exatos dos pickups de munição por fase
      (System Design §18).
- [ ] Ajustar dificuldade (densidade de inimigos, timing dos puzzles) após os primeiros
      playtests (System Design §18).
