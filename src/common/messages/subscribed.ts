import {BaseMessage} from "./base";

export default class SubscribedMessage extends BaseMessage {
    getType(): string {
        return "subscribed";
    }

    /**
     * This message will be delayed for 4 seconds before 
     * will be sent to client
     * 
     * @returns number
     */
    getDelay(): number {
        return 4000;
    }
}