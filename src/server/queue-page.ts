import { Connection } from "./connection";

// Supposed to be in configuration
// And probably could be dynamic and changing on some heuristic
const PAGE_SIZE = 100;

/**
 * Stores chunk on active connections
 */
export default class QueuePage {
    private connections: Array<Connection>;
    private lastAvailableIndex: number = 0; 

    constructor() {
        this.connections = new Array(PAGE_SIZE);
    }

    push(connection: Connection) {
        this.connections[this.lastAvailableIndex] = connection;
        this.lastAvailableIndex++;
    }

    isFull() {
        return this.lastAvailableIndex >= PAGE_SIZE;
    }

    isEmpty() {
        return this.lastAvailableIndex === 0;
    }

    /**
     * Send all scheduled (for provided time) messages for connections in this page
     *
     * @param time 
     */
    sendIfExpectedAt(time: number) {
        const pageLength = this.lastAvailableIndex;
        let totalAvailable = 0;
        let nextAvailableIndex = 0;
        let connection: Connection | null;
        
        // Since this will be executed each second for all connections we will also 
        // Perform defragrantation here to not run separate loop just for this
        // Have to figure out a beter name for this function to address additional behavior
        //
        // This is a quick and dirty solution
        // Could be optimized
        for (let i = 0; i < pageLength; i++) {
            connection = this.connections[i];
            if (!this.checkAvaliabilityAndSend(time, connection)) {
                for (let j = nextAvailableIndex || (i + 1); j < pageLength; j++) {
                    connection = this.connections[j];
                    if (this.checkAvaliabilityAndSend(time, connection)) {
                        this.connections[i] = connection;
                        this.connections[j] = null;
                        nextAvailableIndex = j + 1;
                        totalAvailable++;
                        break;
                    }
                }
            } else {
                totalAvailable++;
            }
        }
        this.lastAvailableIndex = totalAvailable;
    }

    /**
     * Helper for sendIfExpectedAt method
     * 
     * @param time 
     * @param connection 
     * @returns boolean
     */
    private checkAvaliabilityAndSend(time: number, connection: Connection | null): boolean {
        if (connection && connection.isAvailable()) {
            connection.sendIfExpectedAt(time);
            return true;
        }
        return false;
    }
}