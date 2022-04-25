import {BaseMessage} from "./base";

export default class ErrorMessage extends BaseMessage {
    getType(): string {
        return "error";
    }
}