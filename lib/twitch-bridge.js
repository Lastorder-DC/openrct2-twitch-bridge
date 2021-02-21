function startsWith(target, search) {
    return target.substring(0, search.length) === search;
}
var MINRATING = 400;
var NEWLINE = new RegExp('\n', 'g');
var PREFIX = new RegExp('^(!|/)');
var KEYLIST = {};
function main() {
    var onlineOnly = context.sharedStorage.get('twitch-bridge.onlineonly', true);
    if (!onlineOnly || network.mode === 'server') {
        var socket_1 = network.createSocket();
        var name_1 = context.sharedStorage.get('twitch-bridge.name', null);
        var port_1 = context.sharedStorage.get('twitch-bridge.port', 35711);
        var host_1 = context.sharedStorage.get('twitch-bridge.host', '127.0.0.1');
        var authed_group_1 = context.sharedStorage.get('twitch-bridge.authed_group', null);
        var status_1 = {
            parkRating: false
        };
        var reconnect_1 = false;
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
                network.sendMessage("{PALELAVENDER}" + (('origin' in msg.body) ? "(" + msg.body.origin + ") " : '') + msg.body.author + ": {WHITE}" + msg.body.content.replace(NEWLINE, '{NEWLINE}'));
            }
            else if (msg.type === 'auth') {
                if (typeof KEYLIST[msg.body.target] !== 'undefined' && KEYLIST[msg.body.target] == msg.body.content) {
                    network.sendMessage(msg.body.author + " 계정으로 인증되었습니다.", [msg.body.target]);
                    KEYLIST[msg.body.target] = null;
                }
                if (authed_group_1 != null) {
                    var player = getPlayer(msg.body.target);
                    player.group = authed_group_1;
                }
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
        if (network.mode === 'server') {
            context.subscribe('network.chat', function (e) {
                if (!e.message.match(PREFIX) && e.player !== 0) {
                    socket_1.write(JSON.stringify({
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
