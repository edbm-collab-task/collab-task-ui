import { Client } from "@stomp/stompjs";
import type { Message } from "@/types/message";
import { API_CONFIG } from "@/api/constants";

class MessageSocketService {
    private client: Client | null = null;

    connect(conversationId: number, onMessage: (message: Message) => void) {
        if (this.client) this.disconnect();

        const wsUrl = API_CONFIG.BASE_URL.replace(/^http:/, "ws:").replace(/^https:/, "wss:") + "/ws";

        this.client = new Client({
            brokerURL: wsUrl,
            reconnectDelay: 5000,
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            },
            onConnect: () => {
                console.log("WebSocket connecté pour la conversation :", conversationId);

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