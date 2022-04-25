import {BaseMessage, MESAGE_KEY_TYPE} from "./messages/base";

import SubscribedMessage from "./messages/subscribed";
import UnsubscribedMessage from "./messages/unsubscribed";
import HeartBeatMessage from "./messages/heartbeat";
import ErrorMessage from "./messages/error";

/**
 * This will be converted to:
 * {"messageType1": MessageObject1, ... }
 */
const SubscriptionRelated = [
    new SubscribedMessage(),
    new UnsubscribedMessage()
].map(value => ({[value.getType()]: value}))
.reduce((prev, curr) => Object.assign(prev, curr), {});

const HeartBeat = new HeartBeatMessage();
const Error = new ErrorMessage();

export type MessageStruct = {
    [MESAGE_KEY_TYPE]: string
};

/**
 * Message managenet
 * Used both for client and server side
 */
export class Message {
    /**
     * Return "type" field from request
     * 
     * @param data 
     * @returns string
     */
    static getTypeFromData(data: string): string {
        let message: MessageStruct;
        try {
            message = JSON.parse(data);
        } catch(e) {
            console.warn(e);
        }
        return message ? message[MESAGE_KEY_TYPE] : "";
    }

    /**
     * Returns message object related to given type
     * If type is unknown Error message object will be returned
     * 
     * @param type 
     * @returns BaseMessage
     */
    static getSubscriptionRelateFromType(type: string): BaseMessage {
        const message = SubscriptionRelated[type];
        return message ?? Error;
    }

    static getError(): ErrorMessage {
        return Error;
    }

    static getHeartBeat(): HeartBeatMessage {
        return HeartBeat;
    }
}