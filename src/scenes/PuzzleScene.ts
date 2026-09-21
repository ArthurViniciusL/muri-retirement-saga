/**
 * PuzzleScene — minigame de jogo da memória (overlay).
 *
 * Responsabilidade: renderizar o grid de 25 cartas (5x5) do tema da fase ativa e
 * conduzir a partida (3 pares em até 2 minutos; falha/timeout reembaralha em loop,
 * sem penalidade de vida). Lançada com scene.launch sobre a Phase*Scene pausada,
 * que retoma exatamente de onde parou.
 *
 * Referência: System Design §3 (overlay/pause), §11 (Puzzle — jogo da memória).
 */
