import "jasmine";
import QueuePage from "../../src/server/queue-page";
import { ConnectionInterface } from "../../src/server/connection";

class TestConnection implements ConnectionInterface {
    sentCount: number = 0;
    id: number;
    available: boolean;

    constructor(id: number, available: boolean) {
        this.id = id;
        this.available = available;
    }
    sendIfExpectedAt(time: number) {
        this.sentCount++;
    };

    isAvailable(): boolean {
        return this.available;
    };
}

describe("queue page", () => {
    it("should be defragmented correctly", () => {
        [
            [],
            [1],
            [0],
            [0, 1],
            [1, 0],
            [1, 0, 0, 2, 3],
            [1, 2, 3],
            [0, 0, 0]
        ].forEach(data => {
            const queuePage = new QueuePage();
            data.forEach((index) => {
                queuePage.push(new TestConnection(index, !!index));
            });

            queuePage.sendIfExpectedAt(0);

            // Was sent only to available and exactly once
            queuePage.getConnections().forEach(connection => {
                expect((connection as TestConnection).sentCount).toEqual(connection.isAvailable() ? 1 : 0);    
            });

            // Length of resulted defragmatated array is correct
            const onlyAlailableIds = data.filter(i => !!i);
            expect(queuePage.getActiveLength()).toBe(onlyAlailableIds.length);
            
            // Order of connections is as expected
            const connectionsIds = queuePage.getConnections().map(c => c ? (c as TestConnection).id : 0);
            connectionsIds.length = onlyAlailableIds.length;
            expect(connectionsIds).toEqual(onlyAlailableIds);
        });
    });
});
