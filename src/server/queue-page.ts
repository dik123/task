import {ConnectionInterface } from "./connection";

// Supposed to be in configuration
// And probably could be dynamic and changing on some heuristic
const PAGE_SIZE = 100;

/**
 * Stores chunk on active connections
 */
export default class QueuePage {
    private connections: Array<ConnectionInterface>;
    private lastAvailableIndex: number = 0; 

    constructor() {
        this.connections = new Array(PAGE_SIZE);
    }

    push(connection: ConnectionInterface) {
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
        let dstIndex = 0;
        let currIndex = 0;
        let newLength = 0;

        do {
            // Find first available connection
            for (; currIndex < this.lastAvailableIndex; currIndex++) {
                if (this.connections[currIndex].isAvailable()) {
                    break;
                }
            }

            // We will copy staring from position of first active connection
            // back to starting position of first closed connection
            let srcIndex = currIndex;
            
            // Count of active connections to copy
            let srcCount = 0;

            // Find how many active connections are availbale in a row
            for (; currIndex < this.lastAvailableIndex; currIndex++) {
                const connection = this.connections[currIndex];
                if (!connection.isAvailable()) {
                    break;
                }
                // Send messages to acive connection
                connection.sendIfExpectedAt(time);
                srcCount++;
            }

            // Copy batch of available conection in place of closed connection
            if (dstIndex !== srcIndex && srcCount !== 0) {
                this.connections.copyWithin(dstIndex, srcIndex, srcIndex + srcCount);
            }
            newLength += srcCount;
            dstIndex = currIndex

        // This check here is to not maintain state (checking active or inactive)
        // and check it on each iteration
        } while (currIndex < this.lastAvailableIndex);
        this.lastAvailableIndex  = newLength;
    }

    getConnections(): Array<ConnectionInterface> {
        return this.connections;
    }

    getActiveLength() {
        return this.lastAvailableIndex;
    }
}
