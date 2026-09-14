/**
 * Signale que le backend statistique n'est pas encore implémenté.
 * Ce n'est pas une erreur utilisateur : le Dashboard affiche un état vide neutre.
 */
export class StatsNotAvailableError extends Error {
    constructor() {
        super("Le module de statistiques n'est pas encore disponible.");
        this.name = "StatsNotAvailableError";
    }
}
