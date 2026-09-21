/**
 * PlayerStateMachine — máquina de estados de Muri.
 *
 * Responsabilidade: governar as transições entre Idle, Walk, Jump, Crouch,
 * AttackMelee, AttackRanged, Defend, Hurt e Dead, garantindo que apenas transições
 * válidas ocorram. Defend não é bloqueante (permite movimento simultâneo) e Hurt
 * não aplica knockback nem i-frames.
 *
 * Referência: System Design §5 (Máquina de estados do personagem).
 */
