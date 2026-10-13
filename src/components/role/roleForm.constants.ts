/**
 * Libellés des colonnes du tableau des rôles.
 *
 * Partagés entre la page de liste (en-têtes) et le formulaire (champs), pour
 * garantir qu'un même concept porte toujours le même libellé.
 */
export const ROLE_FORM_LABELS = {
    name: "Nom",
    codeRole: "Code rôle",
    permissions: "Permissions",
} as const;

/**
 * Messages d'erreur du champ « code du rôle ».
 *
 * Regroupés ici pour rester alignés avec les règles de validation de
 * `@/utils/roleCode` (format, réservation système, unicité).
 */
export const ROLE_CODE_MESSAGES = {
    required: "Le code du rôle est requis",
    format: "Le code ne peut contenir que des lettres, des chiffres et des tirets bas",
    reserved: "Ce code est réservé aux rôles système",
    duplicate: "Ce code de rôle existe déjà",
} as const;
