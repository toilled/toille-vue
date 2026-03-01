// A global map is used since this is a simple Cloudflare Pages demo without access to Durable Object paid features or setup.
const connections = new Map<WebSocket, string>();

export const onRequestGet = async (context: any) => {
    const upgradeHeader = context.request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    server.accept();

    // Assign a random ID to this connection
    const id = Math.random().toString(36).substring(2, 10);
    connections.set(server, id);

    // Send the ID back to the client
    server.send(JSON.stringify({ type: 'init', id }));

    server.addEventListener('message', event => {
        // Broadcast the message to all other connections
        for (const [conn, connId] of connections.entries()) {
            if (conn !== server) {
                try {
                    conn.send(event.data);
                } catch (e) {
                    // Ignore closed connections
                }
            }
        }
    });

    server.addEventListener('close', () => {
        connections.delete(server);
        // Notify others that this player disconnected
        for (const [conn, connId] of connections.entries()) {
            try {
                conn.send(JSON.stringify({ type: 'disconnect', id }));
            } catch (e) {
                // Ignore
            }
        }
    });

    return new Response(null, {
        status: 101,
        webSocket: client,
    });
};
