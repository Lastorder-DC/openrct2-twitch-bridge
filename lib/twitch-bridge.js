var MINRATING = 400;
var NEWLINE = new RegExp('\n', 'g');
var PREFIX = new RegExp('^(!|/)');
function main() {
    var onlineOnly = context.sharedStorage.get('twitch-bridge.onlineonly', true);
    if (!onlineOnly) {
        var socket_1 = network.createSocket();
        var name_1 = context.sharedStorage.get('twitch-bridge.name', null);
        var port_1 = context.sharedStorage.get('twitch-bridge.port', 35711);
        var host_1 = context.sharedStorage.get('twitch-bridge.host', '127.0.0.1');
        var botname = context.sharedStorage.get('twitch-bridge.botname', null);
        var status_1 = {
            parkRating: false
        };
        var reconnect_1 = false;
        var self_1 = false;
        var connect_1 = function () {
            console.log("Attempting to connect to " + host_1 + ":" + port_1);
            socket_1.connect(port_1, host_1, doNothing);
        };
        socket_1.on('close', function (hadError) { return reconnect_1 = true; });
        socket_1.on('error', function (hadError) { return reconnect_1 = true; });
        socket_1.on('data', function (data) {
            var msg = JSON.parse(data);
            if (msg.type === 'handshake') {
                reconnect_1 = false;
                if (name_1) {
                    socket_1.write(JSON.stringify({
                        type: 'id',
                        body: name_1
                    }));
                }
            }
            else if (msg.type === 'chat') {
                self_1 = true;
                network.sendMessage("{PALELAVENDER}" + (('origin' in msg.body) ? "(" + msg.body.origin + ") " : '') + msg.body.author + ": {WHITE}" + msg.body.content.replace(NEWLINE, '{NEWLINE}'));
            }
        });
        context.subscribe('interval.day', function () {
            if (reconnect_1) {
                connect_1();
            }
            var ratingCheck = park.rating > MINRATING;
            if (status_1.parkRating && !ratingCheck) {
                socket_1.write(JSON.stringify({
                    type: 'message',
                    body: "\uACF5\uC6D0 \uB4F1\uAE09\uC774 " + MINRATING + " \uBBF8\uB9CC\uC73C\uB85C \uB5A8\uC5B4\uC84C\uC2B5\uB2C8\uB2E4!"
                }));
            }
            status_1.parkRating = ratingCheck;
        });
        context.subscribe('network.chat', function (e) {
            if (!e.message.match(PREFIX) && e.player !== 0 && !self_1) {
                socket_1.write(JSON.stringify({
                    type: 'chat',
                    body: {
                        author: getPlayer(e.player).name,
                        content: e.message
                    }
                }));
            }
            self_1 = false;
        });
        connect_1();
    }
}
function getPlayer(playerID) {
    if (playerID === -1) {
        return null;
    }
    var player = null;
    var players = network.players;
    for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
        var p = players_1[_i];
        if (p.id === playerID) {
            player = p;
        }
    }
    return player;
}
function doNothing() {
}
registerPlugin({
    name: 'twitch-bridge',
    version: '1.0.0',
    authors: ['Cory Sanin', 'Lastorder-DC'],
    type: 'remote',
    licence: 'MIT',
    main: main
});
\
