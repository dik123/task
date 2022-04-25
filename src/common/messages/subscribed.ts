import {BaseMessage} from "./base";

export default class SubscribedMessage extends BaseMessage {
    getType(): string {
        return "subscribed";
    }

    getDelay(): number {
        return 4000;
    }
}