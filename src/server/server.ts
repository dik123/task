import WebSocket, { WebSocketServer } from 'ws';
import { Message } from "../common/message";
import { Connection } from "./connection";
import Queue from './queue';
import QueuePage from './queue-page';

const ONE_SECOND = 1000;
const RESOURCES_TIME_LIMIT = 300;

/**
 * Main server class
 */
export default class Server {
    server: WebSocketServer;
    connnections: Queue;

    constructor() {
        this.connnections = new Queue();
        this.server = new WebSocketServer({ port: 8080, clientTracking: false });
        this.server.on('connection', (webSocket: WebSocket)  => {
          this.connnections.push(new Connection(webSocket));
        });

        this.sendMessageLopp();
    }

    /**
     * Scheduled messages will be send in this loop
     * 
     * @param deltaTime 
     */
    private sendMessageLopp(deltaTime: number = ONE_SECOND) {
      if (deltaTime < RESOURCES_TIME_LIMIT) {
        console.warn("Resourse limit exceeded");
      }

      setTimeout(async () => {
        const startTime = Date.now();
        await this.sendSheduledMessages(startTime);

       // Reschedule messaging loop after one second
       // We will adjust wait time to one second minus time spend on queue processing
       // to make events more in sync with time
       // Also such approach allows us to not fire a numerous amount of timers
       this.sendMessageLopp(ONE_SECOND - Date.now() + startTime);
      }, Math.max(deltaTime, 0));
    }

    /**
     * Send scheduled messages to all active connections in queue
     * 
     * @param startTime 
     * @returns Promise
     */
    private sendSheduledMessages(startTime: number): Promise<void> {
      // Set current time in reply for HeartBeat message globally
      Message.getHeartBeat().refreshDate();

      // Queue is organized in pages, each page contains several active connections
      const pagesIterator = this.connnections.pagesIterator();
      return new Promise(resolve => {
        this.iterateConnections(startTime, pagesIterator, resolve);
      });
    }

    /**
     * Send scheduled messages to all active connections in queue recursively per queue page
     * 
     * @param startTime 
     * @param pagesIterator 
     * @param resolve 
     */
    private iterateConnections(startTime: number, pagesIterator: Generator<QueuePage>, resolve: Function) {
      setImmediate(() => {
        const result = pagesIterator.next();
        if (result.value) {
          // Send all sheduled messages for all active connections on current queue page
          result.value.sendIfExpectedAt(startTime);
        }

        if (result.done) {
          resolve()
        } else {
          // Move to next queue page. We will process it on next "tick" to prevent I/O bloking
          this.iterateConnections(startTime, pagesIterator, resolve);
        }
      });
    }
}
