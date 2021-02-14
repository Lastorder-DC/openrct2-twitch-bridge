/// <reference path="../types/openrct2.d.ts" />

const MINRATING = 400;
const NEWLINE = new RegExp('\n', 'g');
const PREFIX = new RegExp('^(!|/)');

function main() {
    let onlineOnly = context.sharedStorage.get('twitch-bridge.onlineonly', true);
    if (!onlineOnly) {
        let socket = network.createSocket();
        let name = context.sharedStorage.get('twitch-bridge.name', null);
        let port = context.sharedStorage.get('twitch-bridge.port', 35711);
        let host = context.sharedStorage.get('twitch-bridge.host', '127.0.0.1');
        let botname = context.sharedStorage.get('twitch-bridge.botname', null);
        let status = {
            parkRating: false
        }
        let reconnect = false;
        let self = false;
        let connect = () => {
            console.log(`Attempting to connect to ${host}:${port}`);
            socket.connect(port, host, doNothing);
        };
        socket.on('close', (hadError) => reconnect = true);
        socket.on('error', (hadError) => reconnect = true);
        socket.on('data', (data) => {
            let msg = JSON.parse(data);
            if (msg.type === 'handshake') {
                reconnect = false;
                if (name) {
                    socket.write(JSON.stringify({
                        type: 'id',
                        body: name
                    }));
                }
            }
            else if (msg.type === 'chat') {
                self = true;
                network.sendMessage(`{PALELAVENDER}${('origin' in msg.body)? `(${msg.body.origin}) ` : ''}${msg.body.author}: {WHITE}${msg.body.content.replace(NEWLINE, '{NEWLINE}')}`);
            }
        });

        context.subscribe('interval.day', () => {
            if (reconnect) {
                connect();
            }

            let ratingCheck = park.rating > MINRATING;
            if (status.parkRating && !ratingCheck) {
                socket.write(JSON.stringify({
                    type: 'message',
                    body: `공원 등급이 ${MINRATING} 미만으로 떨어졌습니다!`
                }));
            }
            status.parkRating = ratingCheck;
        })

        context.subscribe('network.chat', (e) => {
            if (!e.message.match(PREFIX) && e.player !== 0 && !self) {
                socket.write(JSON.stringify({
                    type: 'chat',
                    body: {
                        author: getPlayer(e.player).name,
                        content: e.message
                    }
                }));
            }
            self = false;
        });

        connect();
    }
}

function getPlayer(playerID: number): Player {
    if (playerID === -1) {
        return null;
    }
    var player: Player = null;
    var players = network.players;
    for (const p of players) {
        if (p.id === playerID) {
            player = p;
        }
    }
    return player;
}

function doNothing() {
    //Done!
}

registerPlugin({
    name: 'twitch-bridge',
    version: '1.0.0',
    authors: ['Cory Sanin','Lastorder-DC'],
    type: 'remote',
    licence: 'MIT',
    main
});
