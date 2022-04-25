import CustomWebSocketClient from "./client";

(function() {
    const client = new CustomWebSocketClient();
    
    document.getElementById('subscribe').addEventListener('click', () => {
        client.subscribe()
            .then(() => console.log('subscribed'))
            .catch(() => console.log('subscribed error'));
    });

    document.getElementById('unsubscribe').addEventListener('click', () => {
        client.unsubscribe()
            .then(() => console.log('unsubscribed'))
            .catch(() => console.log('unsubscribe error'));
    });

    document.getElementById('error').addEventListener('click', () => {
        client.error();
    });
})()