---
name: level-config-validator
description: Valida um arquivo de configuração de fase (src/config/phasesConfig.ts) contra a interface PhaseConfig do System Design — campos obrigatórios, tema de puzzle permitido, zona de trigger e coerência dos spawns de inimigos e ladras com a proposta de level design. Use ao criar ou alterar a configuração de qualquer fase.
---

# level-config-validator

> ⚠️ Stub. As instruções completas da skill serão escritas em etapa posterior.

Verifica se cada objeto de fase satisfaz a interface `PhaseConfig` (id, tilemapKey,
enemySpawns, thiefEncounters, puzzleThemeKey, puzzleTriggerZone, essentialItem) e se
o conteúdo declarado é coerente com a progressão proposta para as três fases.

**Documentos de referência:** `.agents/docs/system-design.md` (§13, §8, §9, §11, §20).
