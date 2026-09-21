/**
 * HealthSystem — vida do jogador.
 *
 * Responsabilidade: controlar os 5 corações, aplicar a perda de 1 coração por
 * contato com inimigo ambiental (respeitando o cooldown técnico de ~400ms por
 * inimigo) e sinalizar o game over ao chegar a 0. Independente do puzzle, que não
 * tem penalidade de vida.
 *
 * Referência: System Design §7 (Sistema de vida), §5 (cooldown técnico), §11.
 */
