import WebSocket from 'ws';
import { Message } from "../common/message";
import { BaseMessage } from '../common/messages/base';
import ErrorMessage from '../common/messages/error';

export interface ConnectionInterface {
    sendIfExpectedAt: (time: number) => void;
    isAvailable: () => boolean;
};

/**
 * Cover class for WebSocket
 */
export class Connection implements ConnectionInterface{
    webSocket: WebSocket;
    private message?: BaseMessage;
    private expectedSendTime: number = 0;

    constructor(webSocket: WebSocket) {
        this.webSocket = webSocket;
        webSocket.on('message', (data: Buffer) => this.messageHandler(data));
    }

    /**
     * Send scheduled message or HeartBeat message if no one available
     *
     * @param time 
     */
    sendIfExpectedAt(time: number): void {
        if (this.webSocket.readyState !== WebSocket.OPEN) {
            return;
        }

        let message: BaseMessage = Message.getHeartBeat();
        if (this.message && time >= this.expectedSendTime) {
            this.expectedSendTime = 0;
            message = this.message;
            this.message = null;
        }

        this.webSocket.send(message.getResponse());

        if (message instanceof ErrorMessage) {
            this.webSocket.close();
        }
    }

    /**
     * Check if it is not in closed/closing state
     * 
     * @returns 
     */
    isAvailable(): boolean {
        switch(this.webSocket.readyState) {
            case WebSocket.OPEN:
            case WebSocket.CONNECTING:
                return true;
        }
        return false;
    }

    private messageHandler(data: Buffer) {
        const type = Message.getTypeFromData(data.toString());
        this.message = Message.getSubscriptionRelateFromType(type);
        this.expectedSendTime = Date.now() + this.message.getDelay();
    }
}