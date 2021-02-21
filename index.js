// This should not run as openrct2 plugin
if (typeof (registerPlugin) === "undefined") {
    const fs = require('fs');
    const net = require('net');
    const JSON5 = require('json5');
    const Server = net.Server;
    const tmi = require('tmi.js');
    const server = new Server();
    let clients = 0;

    fs.readFile('config/config.json5', (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            let config = JSON5.parse(data);
            let connections = {};
            let connectionsByName = {};

            if (!('port' in config)) {
                config.port = 35711;
            }
            
            const opts = {
                identity: {
                    username: config.username,
                    password: config.token
                },
                channels: config.channels
            };
            
            const client = new tmi.client(opts);

            server.on('connection', (socket) => {
                clients++;
                console.log("New client connected.");
                let id = Date.now();
                connections[id] = socket;
                let servername = 'unknown server';
                socket.on('data', (data) => {
                    try {
                        let msg = JSON5.parse(data);
                        if (msg.type === 'id') {
                            servername = msg.body.replace('(', '').replace(')', '');
                            connectionsByName[servername] = socket;
                        }
                        else if (msg.type === 'chat') {
                            let message = "";
                            if(servername != "unknown server") message = `${msg.body.author} (${servername}) : ${msg.body.content}`;
                            else message = `${msg.body.author} : ${msg.body.content}`;
                            for (channel in config.channels) {
                                client.say(config.channels[channel], message);
                            }
                        }
                        else if (msg.type === 'message') {
                            client.say(`(${servername}) : ${msg.body}`);
                        }
                    }
                    catch (ex) {
                        console.log(`Error parsing json: ${ex}\nInput json: ${data.toString()}`);
                    }
                });
                socket.on('close', had_error => {
                    clients--;
                    delete connections[id];
                    delete connectionsByName[servername];
                });
                socket.write(JSON.stringify({
                    type: "handshake"
                }));
            });
            server.on('error', (err) => {
                console.log(err);
            });
            
            client.on('message', function(channel, tags, message, self) {
                let msg;
                if(self || tags.username == config.username) return;
                
                // 인증메세지 처리
                if(message.startsWith("!인증 ")) {
                    let auth = message.replace("!인증 ","").split("-");
                    if(auth.length == 2) {
                        msg = {
                            type: 'auth',
                            body: {
                                author: tags.username,
                                target: auth[0],
                                content: auth[1]
                            }
                        };
                    } else {
                        // 인증이 잘못된 형식이면 걍 리턴
                        return;
                    }
                } else {
                    //일반메세지중 !로 시작하는건 스킵
                    if(message.startsWith('!')) return;
                    msg = {
                        type: 'chat',
                        body: {
                            author: tags.username,
                            content: message.trim()
                        }
                    };
                }
                
                msg = JSON.stringify(msg);
                for (conid in connections) {
                    connections[conid].write(msg);
                }
            });
            
            client.on('connected', function(addr, port) {
                console.log(`* Connected to ${addr}:${port}`);
            });

            server.listen(config.port, '0.0.0.0', () => {
                console.log(`Twitch Bridge server listening on ${config.port}`);
            });
            
            client.connect();
        }
    });
}
