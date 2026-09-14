/**
 * Utilitaires pour la génération des sparklines (mini-graphiques).
 * Centralise la logique dupliquée entre AdminDashboard et DashboardStatsCards.
 */

/**
 * Génère une courbe strictement croissante de `points` valeurs se terminant à `baseValue`.
 * Utilise un générateur pseudo-aléatoire déterministe (seed = baseValue) pour garder
 * la même courbe à chaque rendu tout en garantissant la monotonie.
 * Le jitter est borné à 8% du step pour ne pas casser la croissance.
 */
export function generateIncreasingSparkline(baseValue: number, points: number = 7): number[] {
    const target = Math.max(0, baseValue ?? 0);
    if (target === 0) return Array(points).fill(0);
    const start = Math.max(1, Math.floor(target * 0.45));
    const step = (target - start) / (points - 1);
    const res: number[] = [];
    let seed = Math.abs(target) * 1664525 + 1013904223;
    const rand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0x100000000;
    };
    for (let i = 0; i < points; i++) {
        const ideal = Math.round(start + step * i);
        const jitter = Math.round((rand() - 0.5) * step * 0.16);
        let v = ideal + jitter;
        if (i > 0) v = Math.max(v, res[i - 1] + 1);
        v = Math.min(v, target);
        if (i === points - 1) v = target;
        res.push(Math.max(0, v));
    }
    return res;
}

/**
 * Extrait une sparkline à partir de l'évolution réelle du dashboard.
 * Pour "tasks" et "completed", cumule les points sur les 7 derniers jours/mois
 * afin d'obtenir une courbe monotone cohérente avec la valeur totale.
 * Fallback vers generateIncreasingSparkline si pas assez de points.
 */
export function getSparklineFromEvolution(
    evolution: { points: { created: number; completed: number }[] } | null,
    metric: "tasks" | "completed",
    fallbackValue: number
): number[] {
    if (!evolution || !evolution.points || evolution.points.length === 0) {
        return generateIncreasingSparkline(fallbackValue, 7);
    }
    const pts = evolution.points.slice(-7);
    if (metric === "tasks") {
        let cum = 0;
        const cumVals = pts.map(p => (cum += p.created));
        const maxCum = cumVals[cumVals.length - 1] || 1;
        if (fallbackValue > maxCum && maxCum > 0) {
            const ratio = fallbackValue / maxCum;
            return cumVals.map(v => Math.round(v * ratio));
        }
        return cumVals.length === 7 ? cumVals : generateIncreasingSparkline(fallbackValue, 7);
    }
    if (metric === "completed") {
        let cum = 0;
        const cumVals = pts.map(p => (cum += p.completed));
        const maxCum = cumVals[cumVals.length - 1] || 1;
        if (fallbackValue > maxCum && maxCum > 0) {
            const ratio = fallbackValue / maxCum;
            return cumVals.map(v => Math.round(v * ratio));
        }
        return cumVals.length === 7 ? cumVals : generateIncreasingSparkline(fallbackValue, 7);
    }
    return generateIncreasingSparkline(fallbackValue, 7);
}

/**
 * Variante pour l'admin (EvolutionPointResDto a même forme mais type différent).
 */
export function getAdminSparkline(
    evolution: { label: string; created: number; completed: number }[] | null | undefined,
    metric: "created" | "completed",
    fallback: number
): number[] {
    if (!evolution || evolution.length === 0) return generateIncreasingSparkline(fallback, 7);
    const pts = evolution.slice(-7);
    let cum = 0;
    const vals = pts.map(p => (cum += metric === "created" ? p.created : p.completed));
    if (vals.length !== 7) return generateIncreasingSparkline(fallback, 7);
    const maxCum = vals[vals.length - 1] || 1;
    if (fallback > maxCum && maxCum > 0) {
        const ratio = fallback / maxCum;
        return vals.map(v => Math.round(v * ratio));
    }
    return vals;
}
