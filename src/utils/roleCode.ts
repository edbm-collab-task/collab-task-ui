/**
 * Génération et validation du `codeRole` (code court d'un rôle : "CDP", "MNG"...).
 *
 * Règle retenue : le code est la transcription phonétique du nom, consonnes
 * uniquement. Un nom déjà court (<= 4 lettres) est conservé tel quel.
 */

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);

const MIN_LENGTH = 3;
const MAX_LENGTH = 4;

export const ROLE_CODE_PATTERN = /^[A-Z0-9_]+$/;

export const normalizeRoleCode = (code: string): string => code.trim().toUpperCase();

/** Découpe un nom de rôle en mots normalisés : "Chef de projet" -> ["CHEF", "DE", "PROJET"]. */
const toWords = (name: string): string[] =>
    name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .split(/[^A-Z0-9]+/)
        .filter(Boolean);

/** Consonnantes de tous les mots concaténées : "Manager" -> "MNGR". */
const toSkeleton = (words: string[]): string =>
    words
        .flatMap(word => word.split(""))
        .filter(char => !VOWELS.has(char))
        .join("");

/** Première consonne d'un mot, première lettre en dernier recours : "de" -> "D", "EAU" -> "E". */
const leadingLetter = (word: string): string =>
    word.split("").find(char => !VOWELS.has(char)) ?? word[0] ?? "";

/** Initiales puis lettres de complétion : ["CHEF","DE","PROJET"] -> "CDPFRJT". */
const buildInitials = (words: string[]): string => {
    const initials = words.map(leadingLetter).join("");
    const extras = words.map(word => toSkeleton([word]).slice(1)).join("");

    return initials + extras;
};

/**
 * Candidats par ordre de préférence pour un nom donné. Le premier libre gagne,
 * les suivants absorbant les collisions les plus probables.
 */
export const buildRoleCodeVariants = (name: string): string[] => {
    const words = toWords(name);
    if (words.length === 0) return [];

    const slug = words.join("");
    if (slug.length <= MAX_LENGTH) return [slug];

    const full = words.length > 1 ? buildInitials(words) : toSkeleton(words) || slug;
    const variants = [full.slice(0, MIN_LENGTH), full.slice(0, MAX_LENGTH)];

    return [...new Set(variants.filter(Boolean))];
};

/** Premier candidat libre, ou nom + suffixe numérique si tous sont occupés. */
export const generateRoleCode = (name: string, taken: Iterable<string> = []): string => {
    const variants = buildRoleCodeVariants(name);
    const base = variants[0] ?? "";
    if (!base) return "";

    const used = new Set([...taken].map(normalizeRoleCode).filter(Boolean));
    const free = variants.find(variant => !used.has(variant));
    if (free) return free;

    let suffix = 2;
    while (used.has(`${base}_${suffix}`)) suffix += 1;

    return `${base}_${suffix}`;
};

/** Unicité case-insensitive sur la liste des codes déjà attribués. */
export const isRoleCodeTaken = (code: string, taken: Iterable<string>): boolean => {
    const normalized = normalizeRoleCode(code);
    if (!normalized) return false;

    return [...taken].some(existing => normalizeRoleCode(existing) === normalized);
};