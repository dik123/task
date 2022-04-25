import {BaseMessage} from "./base";

export default class UnsubscribedMessage extends BaseMessage {
    getType(): string {
        return "unsubscribed";
    }

    /**
     * This message will be delayed for 8 seconds before 
     * will be sent to client
     * 
     * @returns number
     */
    getDelay(): number {
        return 8000;
    }
}