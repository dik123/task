export const MESAGE_KEY_TYPE = "type";

export type ResponseData = {
    [MESAGE_KEY_TYPE]: string;
}

/**
 * Represents one of possible reply message
 */
export abstract class BaseMessage {
    protected responseData: ResponseData;
    protected responseCache: string;

    constructor() {
        this.responseData = {
            [MESAGE_KEY_TYPE]: this.getType()
        }
        this.responseCache = JSON.stringify(this.responseData);
    }

    /**
     * Message will be replied after given delay
     * 
     * @returns number 
     */
    getDelay(): number {
        return 0;
    }

    /**
     * This will be send to client
     * @returns string
     */
    getResponse(): string {
        return this.responseCache;
    }

    /**
     * Message identifier
     * We are using this field to get correct reply message and to fill response
     */
    abstract getType(): string;
}