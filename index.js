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
                            msg.body.origin = servername;
                            client.say(`${msg.body.author} (${msg.body.origin}) : ${msg.body.content}`);
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
                if(self || !message.startsWith('!')) return;
                
                let message = {
                    type: 'chat',
                    body: {
                        author: tags.username,
                        content: message.trim()
                    }
                };
            });

            client.on('message', async msg => {
                if (!msg.author.bot && msg.guild && msg.channel.id === config.channel) {
                    let message = {
                        type: 'chat',
                        body: {
                            author: msg.author.username,
                            content: msg.content
                        }
                    };
                    
                    message = JSON.stringify(message);
                    for (conid in connections) {
                        connections[conid].write(message);
                    }
                }
            });
            
            client.on('connected', function(addr, port) {
                console.log(`* Connected to ${addr}:${port}`);
            });

            server.listen(config.port, '0.0.0.0', () => {
                console.log(`Discord Bridge server listening on ${config.port}`);
            });
        }
    });
}
