/**
 * Thief — classe base das ladras.
 *
 * Responsabilidade: comportamento comum de contato das três ladras — ao colidir com
 * Muri, descontar a porcentagem configurada das moedas comuns coletadas e disparar
 * o balão de diálogo. Nunca são combatidas, apenas evitadas; cada ladra respeita um
 * cooldown individual de 5 minutos entre aparições.
 *
 * Referência: System Design §9 (As ladras), §10 (Sistema de diálogo).
 */
