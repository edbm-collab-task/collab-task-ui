import { Client } from "@stomp/stompjs";
import type { Message } from "@/types/message";
import { API_CONFIG } from "@/api/constants";

/**
 * Service singleton gérant la connexion WebSocket STOMP pour la messagerie temps réel.
 * 
 * Architecture :
 * - Une seule instance (messageSocket) partagée dans toute l'app.
 * - Une seule conversation abonnée à la fois (connect déconnecte l'existant avant de reconnecter).
 * - Reconnexion automatique via reconnectDelay: 5000 (côté STOMP).
 * - Authentification via header Authorization (Bearer token du localStorage).
 * 
 * IMPORTANT : Le WebSocket ne met à jour QUE les messages de la conversation courante
 * (via useMessages). La liste des conversations (unreadCount, lastMessage) dans la sidebar
 * n'est PAS synchronisée en temps réel — elle nécessite un rechargement manuel via
 * useConversations.loadConversations() ou synchronizeConversation (non utilisé).
 */
class MessageSocketService {
    private client: Client | null = null;

    connect(conversationId: number, onMessage: (message: Message) => void) {
        // Déconnexion propre si une connexion existe déjà (changement de conversation)
        if (this.client) this.disconnect();

        // Conversion HTTP(S) -> WS(S) : http:// -> ws://, https:// -> wss://
        const wsUrl = API_CONFIG.BASE_URL.replace(/^http:/, "ws:").replace(/^https:/, "wss:") + "/ws";

        this.client = new Client({
            brokerURL: wsUrl,
            reconnectDelay: 5000,
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            },
            onConnect: () => {
                console.log("WebSocket connecté pour la conversation :", conversationId);

                // Abonnement au topic de la conversation courante
                this.client?.subscribe(`/topic/conversations/${conversationId}`, (frame) => {
                    try {
                        const message = JSON.parse(frame.body) as Message;
                        onMessage(message);
                    } catch (error) {
                        console.error("Erreur lors de la réception du message WebSocket :", error);
                    }
                });
            },
            onStompError: (frame) => {
                console.error("Erreur STOMP :", frame.headers["message"], frame.body);
            },
            onWebSocketError: (error) => {
                console.error("Erreur WebSocket :", error);
            },
            onDisconnect: () => {
                console.log("WebSocket déconnecté");
            },
        });

        this.client.activate();
    }

    disconnect() {
        if (!this.client) return;
        this.client.deactivate();
        this.client = null;
    }
}

export const messageSocket = new MessageSocketService();