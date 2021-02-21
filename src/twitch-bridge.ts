/// <reference path="../types/openrct2.d.ts" />

function startsWith(target, search) {
    return target.substring(0, search.length) === search;
}

const MINRATING = 400;
const NEWLINE = new RegExp('\n', 'g');
const PREFIX = new RegExp('^(!|/)');
const KEYLIST = {};

function main() {
    var version = context.sharedStorage.get('twitch-bridge.version', "0");
	if (version == "0") {
        context.sharedStorage.set('twitch-bridge.version', "1.0.2")
		context.sharedStorage.set('twitch-bridge.onlineonly', true);
		context.sharedStorage.set('twitch-bridge.name', null);
		context.sharedStorage.set('twitch-bridge.port', 35711);
		context.sharedStorage.set('twitch-bridge.host', '127.0.0.1');
		context.sharedStorage.set('twitch-bridge.authed_group', null);
	}
    
    let onlineOnly = context.sharedStorage.get('twitch-bridge.onlineonly', true);
    if (!onlineOnly || network.mode === 'server') {
        let socket = network.createSocket();
        let name = context.sharedStorage.get('twitch-bridge.name', null);
        let port = context.sharedStorage.get('twitch-bridge.port', 35711);
        let host = context.sharedStorage.get('twitch-bridge.host', '127.0.0.1');
        let authed_group = context.sharedStorage.get('twitch-bridge.authed_group', null);
        let status = {
            parkRating: false
        }
        let reconnect = false;
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
                network.sendMessage(`{PALELAVENDER}${('origin' in msg.body)? `(${msg.body.origin}) ` : ''}${msg.body.author}: {WHITE}${msg.body.content.replace(NEWLINE, '{NEWLINE}')}`);
            }
            else if (msg.type === 'auth') {
                if (typeof KEYLIST[msg.body.target] !== 'undefined' && KEYLIST[msg.body.target] == msg.body.content) {
                    network.sendMessage(msg.body.author + " 계정으로 인증되었습니다.", [msg.body.target]);
                    KEYLIST[msg.body.target] = null;
                }

                if (authed_group != null) {
                    let player = getPlayer(msg.body.target);
                    player.group = authed_group;
                }
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

        if (network.mode === 'server') {
            context.subscribe('network.chat', (e) => {
                if (!e.message.match(PREFIX) && e.player !== 0) {
                    socket.write(JSON.stringify({
                        type: 'chat',
                        body: {
                            author: getPlayer(e.player).name,
                            content: e.message
                        }
                    }));
                }
                
                if (startsWith(e.message, "!권한신청")) {
                    KEYLIST[e.player] = parseInt("" + Math.random() * (9999 - 1000) + 1000);
                    network.sendMessage("권한을 신청하시려면 \"!인증 " + e.player + "-" + KEYLIST[e.player] + "\"라고 보내주세요.", [e.player]);
                }
            });
        }

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
    version: '1.0.2',
    authors: ['Cory Sanin','Lastorder-DC'],
    type: 'remote',
    licence: 'MIT',
    main
});
