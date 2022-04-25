import ExtendedPromise from "./extended-promise";
import { Message } from "../common/message";
import { BaseMessage } from "../common/messages/base";
import ErrorMessage from "../common/messages/error";
import SubscribedMessage from "../common/messages/subscribed";
import UnsubscribedMessage from "../common/messages/unsubscribed";

export default class CustomWebSocketClient  {
    private socket: WebSocket;
    private promises: Map<string, ExtendedPromise>;
    private connectionAvailabilityPromise: Promise<WebSocket> | null;

    constructor() {
        // For each type of request we will provide exectly one promise
        this.promises = new Map<string, ExtendedPromise>();
        this.prepareConnection();
    }

    // Return a promise that resolves when a `subscribed` message is received and rejects if an error message is received
    subscribe(): Promise<void> {
        return this.sendMessage(new SubscribedMessage());
    }

    // Return a promise that resolves when an `unsubscribed` message is received and rejects if an error message is received
    unsubscribe() {
        return this.sendMessage(new UnsubscribedMessage());
    }

    // For testing purpose
    async error() {
        (await this.prepareConnection()).send('{"type":"some"}');
    }

    /**
     * General purpose message sender
     * Will return promise wich will resolved once 
     * incoming message with the same type arived
     *
     * @param message 
     * @returns Promise<void>
     */
    private async sendMessage(message: BaseMessage): Promise<void> {
        const socket = await this.prepareConnection();
        socket.send(message.getResponse());
        return this.getPromiseForMessageType(message.getType()).promise;
    }

    /**
     * Return existing socket (via Promise) or create a new one if no is available
     * or old socket was closed
     * 
     * @returns Promise<WebSocket> 
     */
    private prepareConnection(): Promise<WebSocket> {
        if (this.connectionAvailabilityPromise) {
            return this.connectionAvailabilityPromise;
        }

        let socket = new WebSocket('ws://localhost:8080');

        // This is an awful solution and it must be a simple constat
        const errorMessageType = new ErrorMessage().getType();
        socket.addEventListener('message', (event: MessageEvent) => {
            const type = Message.getTypeFromData(event.data);

            switch (type) {
                case errorMessageType:
                    this.handleError()
                    break;
                
                default:
                    this.handleTypedMessage(type);
            }
        });

        this.connectionAvailabilityPromise = new Promise((resolve, reject) => {
            for (const eventName of ['close', 'error']) {
                socket.addEventListener(eventName, () => {
                    this.connectionAvailabilityPromise = null;
                    reject();
                });
            }
            socket.addEventListener('open', () => resolve(socket));
        });

        return this.connectionAvailabilityPromise;
    }

    /**
     * If we received message with  error type then reject all 
     * ongoing requests/promises (aka subscribe, unsubscribe)
     */
    private handleError() {
        for (const [_, promise] of this.promises) {
            promise.reject();
        }
        this.promises.clear()
    }

    /**
     * Resolve ongoing requst/promises according to type of 
     * incoming message
     * 
     * @param type 
     */
    private handleTypedMessage(type: string) {
        const promise = this.promises.get(type);
        if (promise) {
            promise.resolve();
            this.promises.delete(type);
        }
    }

    /**
     * Find existing promise for message type or create a new one if nothing was found
     * 
     * @param type 
     * @returns ExtendedPromise
     */
    private getPromiseForMessageType(type: string): ExtendedPromise {
        let promise = this.promises.get(type);
        if (promise) {
            return promise;
        }

        promise = new ExtendedPromise();
        this.promises.set(type, promise);
        return promise;
    }
}