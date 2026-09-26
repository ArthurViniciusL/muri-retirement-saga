# Funcionamento Detalhado das Fases — "A Aposentadoria de Muri"

Documento complementar ao System Design (§13, §20) e ao Guia de Estilo. Descreve o comportamento esperado de cada fase do início ao fim: como ela carrega, em que ordem os eventos acontecem, o que dispara cada sistema e quais são as condições de saída.

Tudo aqui é **data-driven**: nenhuma das regras abaixo deve ser codificada dentro da cena, e sim lida do `PhaseConfig` correspondente (`src/config/phasesConfig.ts`). A cena de fase é genérica; o que muda entre Fase 1, 2 e 3 são os dados.

---

## 0. Ciclo de vida comum a todas as fases

Toda `Phase*Scene` segue exatamente a mesma sequência. O que varia é o conteúdo do `PhaseConfig`.

### 0.1 Entrada da fase (`create()`)

1. Carrega o tilemap da fase (`tilemapKey`) e monta as camadas: parallax de fundo (3 camadas), camada de colisão (plataformas), camada de decoração.
2. Instancia Muri no ponto de spawn, estado inicial `Idle`, virado para a direita.
3. Reseta os sistemas de fase:
   - `HealthSystem` → **5 corações cheios** (a vida NÃO é carregada da fase anterior; cada fase começa com vida cheia).
   - `AmmoSystem` → munição inicial da fase (valor vindo do config).
   - `CurrencySystem` → **NÃO é resetado** — o placar de moedas é acumulativo entre as fases e persiste na sessão.
4. Instancia inimigos nos pontos de `enemySpawns`.
5. Arma os temporizadores de sorteio das ladras (§0.4).
6. Registra a zona de trigger do puzzle (`puzzleTriggerZone`) como área de overlap.
7. Monta o HUD (corações, moedas, munição) e os controles virtuais.
8. Libera o input do jogador.

### 0.2 Loop principal (`update()`)

A cada frame, na ordem:

1. Lê input dos controles virtuais → alimenta a `PlayerStateMachine`.
2. Resolve física e colisão de Muri com a camada de plataformas.
3. Atualiza movimento dos inimigos ativos (cada um conforme seu padrão: morcego voa, gato corre no chão, bola de fogo atravessa na altura média).
4. Resolve overlaps, nesta ordem de prioridade:
   - **Ataque de Muri × inimigo** → inimigo é removido (1 hit, sem vida própria).
   - **Inimigo × Muri** → dano (respeitando o cooldown de \~400ms por inimigo).
   - **Muri × ladra** → evento de roubo (§0.4).
   - **Muri × pickup** (moeda ou munição) → coleta.
   - **Muri × zona de trigger do puzzle** → abre o puzzle (§0.5).
5. Atualiza o HUD.
6. Verifica condição de morte (0 corações).

### 0.3 Dano e morte

- Contato com inimigo ambiental: −1 coração. Sem knockback, sem i-frames; apenas o cooldown técnico de \~400ms impede que o mesmo inimigo drene vários corações em sequência de frames.
- Ao chegar a 0 corações: input é bloqueado, `Phase*Scene` encerra e `GameOverScene` assume.
- Reiniciar pela `GameOverScene` recarrega a **fase atual do zero**: inimigos, moedas e munição voltam ao estado inicial, e Muri retorna ao spawn com 5 corações.
- **Ponto a validar**: se o placar acumulado de moedas também deve ser revertido ao estado do início da fase ou se permanece como estava no momento da morte. *(assunção atual: reverte ao valor que tinha ao entrar na fase, para evitar farm por morte intencional)*

### 0.4 Aparição das ladras

- Cada fase tem uma ladra designada (Fase 1 → Maryana, Fase 2 → Mayra, Fase 3 → Weruska).
- A aparição é **sorteada aleatoriamente** ao longo do percurso, respeitando o **cooldown individual de 5 minutos por personagem** — a mesma ladra não reaparece antes disso; outra ladra não é bloqueada por esse cooldown (relevante apenas se mais de uma ladra puder aparecer na mesma fase).
- Ao encostar em Muri:
  1. `CurrencySystem` desconta a porcentagem da ladra sobre o **placar de moedas comuns acumulado** (Maryana 5%, Mayra 15%, Weruska 30%).
  2. `DialogueSystem` sorteia 1 das 5 falas da personagem (sem repetir a fala imediatamente anterior) e exibe o balão por **20 segundos**, como overlay não-bloqueante — o jogo continua rodando normalmente durante a exibição.
  3. A ladra **não** causa dano à vida e **não** pode ser atacada.
- Muri pode evitar o roubo pulando ou desviando; não há como neutralizar a ladra.

### 0.5 Loop da fase e gate de moedas

Duas regras governam quando o jogador pode sair de uma fase:

**Regra do loop** — cada fase é renderizada **em loop contínuo** até que o puzzle correspondente seja concluído corretamente, dentro das regras e restrições definidas (3 pares em até 2 minutos). Ao chegar ao fim do percurso sem ter concluído o puzzle, o jogador **não avança**: a fase recomeça e ele continua jogando o mesmo nível. Não existe saída da fase por percurso — a única saída é o puzzle resolvido.

**Regra do gate de moedas** — o puzzle **só é exibido ao jogador após ele atingir o total de X moedas** definido para aquela fase (`requiredCoins` no `PhaseConfig`). Antes de atingir X, a zona de trigger do puzzle fica inativa: encostar nela não dispara nada. Ao atingir X, o trigger passa a responder.

Combinadas, as duas regras produzem o ciclo:

```
entra na fase → coleta moedas → atingiu 2.000?
   ├─ não → chega ao fim do percurso → LOOP (fase recomeça, moedas respawnam) → segue coletando
   └─ sim → trigger do puzzle ativo → puzzle
              ├─ falhou/estourou 2min → reembaralha, puzzle reinicia em loop
              └─ 3 pares → item essencial liberado → próxima fase
```

> ⚠️ **Mudança estrutural**: com o gate de moedas, as moedas comuns **deixam de ser pontuação secundária e passam a ser requisito de progressão**. Consequência direta: o roubo das ladras (5%/15%/30%) agora **afeta a progressão** — perder moedas pode empurrar o jogador abaixo de X e forçá-lo a mais uma volta no loop. Isso contradiz o que está no §4 deste documento e no §12 do System Design, que precisam ser revisados.

**Respawn de moedas** — as moedas **reaparecem a cada volta do loop** da fase. Isso garante que o jogador sempre tenha como recuperar o que foi roubado pelas ladras e nunca fique preso abaixo de X sem meios de progredir.

**Valor de X** — definido em **2.000 moedas** por fase.

> ⚠️ **Ponto a calibrar**: 2.000 é um número alto em relação à quantidade de moedas descrita no percurso de cada fase (dezenas por volta). Nos números atuais, isso significaria dezenas de voltas no loop até liberar o puzzle — o que provavelmente não é a intenção, dado que o público do evento é misto e o tempo de sessão é curto. Duas formas de resolver, a definir:
> 
> - aumentar o valor unitário de cada moeda (ex.: cada moeda vale 50 ou 100), ou
> - aumentar drasticamente a densidade de moedas por fase.
> 
> O valor de 2.000 fica registrado como meta; a calibragem de quantas moedas existem e quanto cada uma vale ainda precisa ser feita.

### 0.6 Puzzle (gate de conclusão da fase)

- Disparado por overlap com a `puzzleTriggerZone`, posicionada próximo ao fim do percurso de cada fase — **desde que o gate de moedas (§0.5) já esteja satisfeito**.
- Ao disparar: `Phase*Scene` entra em `pause()` e `PuzzleScene` é lançada com `launch()` como overlay — o estado da fase (posição de Muri, inimigos, vida, moedas) é preservado intacto.
- Regras do puzzle, idênticas nas três fases (só o tema das cartas muda):
  - Grid **5×5 = 25 cartas**, viradas para baixo.
  - Objetivo: formar **no mínimo 3 pares** de imagens iguais.
  - Limite: **2 minutos**.
  - Falha ou estouro de tempo → as cartas reembaralham e o puzzle **reinicia em loop**, quantas vezes forem necessárias. **Não há penalidade de vida**: o `HealthSystem` é totalmente independente do puzzle.
  - Não há como abandonar o puzzle e voltar a jogar a fase — ele é um gate obrigatório.
- Ao completar os 3 pares: `PuzzleScene` encerra, o item essencial da fase é liberado e a fase é dada como concluída.

### 0.7 Saída da fase

- Conclusão do puzzle → item essencial registrado no inventário da sessão → transição para a próxima fase (ou `VictoryScene`, no caso da Fase 3).
- A progressão é **estritamente linear**: não existe seleção de fase, nem possibilidade de voltar a uma fase anterior.
- Não há save entre sessões: fechar o navegador reinicia o jogo desde a Fase 1.

---

## 1. Fase 1 — Instrumentos

**Papel na progressão**: fase introdutória. É onde o jogador aprende os controles e cada mecânica, uma de cada vez. Deve ser vencível por alguém que nunca jogou um platformer — o público do evento é misto.

### Percurso, em segmentos

| Segmento | O que acontece |
| --- | --- |
| **1. Abertura** | Trecho plano, sem inimigos e sem buracos. Só andar. Serve para o jogador descobrir o D-pad e o botão de pular sem risco. |
| **2. Primeiras moedas** | Moedas dispostas no caminho principal, algumas sobre plataformas baixas — ensina a pular com propósito. |
| **3. Primeiro gato selvagem** | Inimigo terrestre, em trecho plano e bem visível. Introduz o combate corpo a corpo: é possível atacá-lo ou simplesmente pular por cima. |
| **4. Primeiro pickup de munição** | Posicionado no caminho principal, impossível de perder. |
| **5. Morcegos** | 2–3 morcegos em trecho com plataformas de altura variada. Como voam, ensinam naturalmente o uso do ataque à distância. |
| **6. Vão baixo** | Passagem que exige agachar para atravessar — única forma de seguir. Introduz o agachar como mecânica, não como enfeite. |
| **7. Encontro com Maryana** | Aparição sorteada (tipicamente neste trecho). Roubo de 5% e balão de diálogo. Impacto baixo de propósito: o jogador entende a mecânica sem se sentir punido. |
| **8. Segundo gato + últimas moedas** | Consolidação: combina o que foi ensinado. |
| **9. Trigger do puzzle** | Elemento de cenário claramente sinalizado (altar/barraca). Ao encostar, o puzzle abre. |

### Números da fase

- Inimigos: **3 morcegos + 2 gatos selvagens**. Nenhuma bola de fogo.
- Munição: **2 pickups**, ambos no caminho principal.
- Moedas: caminho principal + desvios opcionais **de baixo risco** (nunca ao lado de um inimigo).
- Ladra: **Maryana (5%)**, 1 aparição.

### Puzzle

Tema **instrumentos** — violão, guitarra, sanfona e demais itens do repertório musical/São João. 25 cartas, 3 pares, 2 minutos.

### Saída

Libera o item essencial **Instrumento** → Fase 2.

---

## 2. Fase 2 — Vídeo games / Xbox

**Papel na progressão**: dificuldade intermediária. Assume que o jogador já domina andar, pular, agachar e atacar. Introduz o terceiro tipo de inimigo e exige planejamento de recurso.

### Percurso, em segmentos

| Segmento | O que acontece |
| --- | --- |
| **1. Retomada** | Trecho curto de reintrodução, já com 1 inimigo logo de início — sinaliza que o ritmo mudou. |
| **2. Verticalidade** | Plataformas em alturas variadas, com morcegos ocupando o espaço aéreo entre elas. Pular passa a exigir mira, não só timing. |
| **3. Primeira bola de fogo** | Introduzida em trecho **plano e previsível**, para o jogador aprender o padrão (trajetória na altura média da tela) sem morrer por surpresa. Pode ser destruída com ataque ou evitada agachando/pulando. |
| **4. Primeiro pickup de munição** | Deliberadamente **fora do caminho direto** — exige um pequeno desvio. O jogador escolhe entre economizar tempo ou garantir recurso. |
| **5. Corredor com gatos** | 2 gatos em trecho mais estreito, onde pular por cima é mais difícil — favorece o combate corpo a corpo. |
| **6. Moedas de risco** | Moedas posicionadas em nichos próximos a inimigos ou exigindo pulo preciso. São opcionais: a fase é completável ignorando todas. |
| **7. Segunda bola de fogo + vão baixo** | Combinação: agachar para passar sob o vão enquanto a trajetória da bola de fogo passa por cima. Primeira exigência real de coordenar duas mecânicas. |
| **8. Encontro com Mayra** | 1–2 aparições sorteadas. Roubo de 15% — impacto sensível no placar, reforçando que evitar vale a pena. |
| **9. Segundo pickup de munição** | Última chance de recarregar antes do fim do percurso. |
| **10. Trigger do puzzle** | Mesmo padrão da Fase 1. |

### Números da fase

- Inimigos: **4 morcegos + 3 gatos selvagens + 2 bolas de fogo**.
- Munição: **2 pickups**, espaçados e fora do caminho direto.
- Moedas: mais escondidas; algumas exigem desvio com risco.
- Ladra: **Mayra (15%)**, 1–2 aparições.

### Puzzle

Tema **vídeo games / Xbox** — cartas referenciando Assassin's Creed, Mass Effect, Batman Arkham e elementos de console/jogos. 25 cartas, 3 pares, 2 minutos.

### Saída

Libera o item essencial **3 CDs de Xbox** — os três são obtidos **juntos, como um único item**, não individualmente espalhados → Fase 3.

---

## 3. Fase 3 — Moedas

**Papel na progressão**: clímax. Maior densidade de inimigos, percurso mais longo e a ladra de maior impacto. É também a fase que decide a vitória: o puzzle daqui é o que garante a aposentadoria.

### Percurso, em segmentos

| Segmento | O que acontece |
| --- | --- |
| **1. Abertura densa** | Já começa com os três tipos de inimigo presentes no primeiro trecho — sinaliza imediatamente que é a fase final. |
| **2. Sequência de plataformas** | Trecho de plataforma mais exigente (pulos encadeados), com morcegos ocupando o espaço entre elas. |
| **3. Chuva de moedas** | Trecho com alta concentração de moedas, coerente com o tema da fase — recompensa visual e de placar, mesmo sendo pontuação secundária. |
| **4. Corredor de bolas de fogo** | Múltiplas bolas de fogo em sequência, exigindo alternar entre agachar, pular e atacar. Pico de dificuldade do platforming. |
| **5. Pickups espaçados** | Munição deliberadamente escassa e distante entre si — força o jogador a escolher quais inimigos vale gastar ataque à distância e quais é melhor evitar ou enfrentar corpo a corpo. |
| **6. Encontro com Weruska** | 1–2 aparições. Roubo de 30% — o maior impacto do jogo, criando tensão real antes do desfecho. |
| **7. Reta final** | Trecho com gatos e morcegos combinados, sem munição disponível. Testa tudo que foi aprendido. |
| **8. Trigger do puzzle** | O puzzle decisivo. |

### Números da fase

- Inimigos: **\~5 morcegos + 4 gatos selvagens + 3 bolas de fogo** (maior densidade do jogo).
- Munição: pickups mais espaçados, exigindo uso estratégico.
- Moedas: mais abundantes, coerente com o tema.
- Ladra: **Weruska (30%)**, 1–2 aparições.

### Puzzle

Tema **moedas**. Funciona mecanicamente igual aos anteriores, mas é o **gate da vitória**: ao ser resolvido, **garante sozinho** o dinheiro necessário para a aposentadoria de Muri — independentemente de quantas moedas comuns o jogador acumulou ou perdeu para as ladras ao longo do jogo.

### Saída

Libera o item essencial **Dinheiro / cofre da aposentadoria** → `VictoryScene`: Muri na praia, tocando seu instrumento, com os CDs e o dinheiro conquistados.

---

## 4. Relação entre moedas e progressão (revisado)

Com o gate de moedas (§0.5), as moedas passaram a ter **dois papéis distintos**, que não devem ser confundidos:

1. **Requisito de progressão (novo)**: é preciso atingir X moedas em cada fase para que o puzzle daquela fase seja exibido. Sem X, o jogador permanece no loop da fase indefinidamente.
2. **Fonte do dinheiro da aposentadoria**: continua sendo exclusivamente o puzzle da Fase 3, que garante sozinho a quantia necessária. O total de moedas acumulado não define o valor da aposentadoria.

**Consequência**: o roubo das ladras deixou de ser apenas pressão de placar e virou **obstáculo real de progressão** — um roubo de 30% da Weruska pode jogar o jogador abaixo de X e custar mais uma volta no loop da Fase 3. Isso aumenta a dificuldade percebida e precisa ser calibrado com cuidado, dado que o público do evento é misto e não necessariamente jogador experiente.

---

## 5. Pontos em aberto / assunções deste documento

- **Valor de X (`requiredCoins`)**: definido em **2.000 moedas** por fase — mas a calibragem (quantas moedas existem por volta e quanto cada uma vale) ainda precisa ser feita para que 2.000 seja alcançável em poucas voltas (ver alerta no §0.5).
- **Respawn de moedas a cada loop**: definido — **sim**, as moedas reaparecem a cada volta.
- **Revisão do System Design (§12)**: o documento ainda descreve moedas como pontuação secundária sem efeito na progressão — precisa ser atualizado para refletir o gate.
- **Feedback visual do gate**: como o jogador é informado de quanto falta para X (contador destacado no HUD? indicação no trigger inativo?) — não definido.
- **Reset do placar de moedas ao morrer** (§0.3): assumido que reverte ao valor de entrada na fase; não confirmado. Com o gate, essa decisão ficou mais sensível — reverter pode alongar bastante o loop.
- **Vida cheia ao iniciar cada fase** (§0.1): assumido; não foi explicitamente definido se a vida é carregada entre fases.
- Quantidade exata de pickups na Fase 3 não foi fixada — apenas a diretriz "mais espaçados que nas anteriores".
- A segmentação de percurso descrita aqui é uma **proposta de estrutura**, não um level design final: comprimento exato, alturas de plataforma e posicionamento pixel-a-pixel ficam a cargo de quem produzir os tilemaps.