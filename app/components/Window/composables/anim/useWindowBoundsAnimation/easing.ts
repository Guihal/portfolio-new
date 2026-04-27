/**
 * Чистая функция easing для плавного приближения текущего значения к цели.
 *
 * Коэффициент:
 * - 0.6 — при interaction (drag/resize), быстрая реакция.
 * - 0.9 — обычный режим, плавная доводка.
 *
 * Формула: factor = 1 - coeff^(deltaMs / 16). Деление на 16 нормализует под 60 FPS.
 * При deltaMs=16 и coeff=0.9: factor ≈ 0.1 (10% от дельты за кадр).
 */
export function easeTowards(
	current: number,
	target: number,
	deltaMs: number,
	interacting: boolean,
): number {
	const coeff = interacting ? 0.6 : 0.9;
	const factor = 1 - coeff ** (deltaMs / 16);
	const delta = target - current;
	return current + delta * factor;
}
