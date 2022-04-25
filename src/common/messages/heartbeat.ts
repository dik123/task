import {BaseMessage, ResponseData} from "./base";

type HeartBeatResponseData = ResponseData & {
    date: string;
};

export default class HeartBeatMessage extends BaseMessage {
    responseData: HeartBeatResponseData;

    getType(): string {
        return "heartbeat";
    }

    refreshDate() {
        this.responseData.date = new Date().toISOString();
        this.responseCache = JSON.stringify(this.responseData);
    }
}