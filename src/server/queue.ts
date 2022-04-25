import { Connection } from "./connection";
import QueuePage from "./queue-page";

const OPTIMIZE_INTERVAL = 5000;

/**
 * Queue manager
 * It is used for two purposes:
 * 1. Will provide clear separation of connection chunks for iterations (each chunk is a queue page)
 * 2. Speed up memory management since we will rarely allocate and reallocate new memory for arrays
 */
export default class Queue {
    pages: QueuePage[] = [];

    constructor() {
        setInterval(
            // We will run some possibly heavy cleaning and queue optimizations here
            () => this.optimize(),
            OPTIMIZE_INTERVAL
        );
    }

    /**
     * Add new conection to one of pages which have free space
     *
     * @param connection 
     */
    push(connection: Connection) {
        const page = this.findAvailablePage();
        page.push(connection);
    }

 
    * pagesIterator() {
        yield* this.pages;
    }

    /**
     * Will find first available page in queue with free space
     * 
     * @returns QueuePage
     */
    private findAvailablePage(): QueuePage {
        for (let i = 0, l = this.pages.length; i < l; i++) {
            const page = this.pages[i];
            if (!page.isFull()) {
                return page;
            }
        }
        return this.addNewPage();
    }
 
    /**
     * Allocate and add new page to queue
     * 
     * @returns QueuePage
     */
    private addNewPage(): QueuePage {
        const page = new QueuePage();
        this.pages.push(page);
        return page;
    }

    /**
     * Queue optimizations
     */
    private optimize() {
        // This is a quick and dirty solution.
        //
        // There is also several small page merging must be implemented 
        // and possibly replacing filter with splice is a better way to handle this
        //
        // Also some optimizations are performed by "page" itself
        this.pages = this.pages.filter(page => !page.isEmpty());
    }
}