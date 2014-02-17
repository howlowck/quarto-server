var io = require('socket.io'),
    connect = require('connect'),
    shortId = require('shortid'),
    GameServer = require('./server/gameServer'),
    http = require('http');
    fs = require('fs');

var port = process.env.PORT || 2060;

console.log('port: ' + port);

var app = connect().listen(port);
var quarto = io.listen(app, {log: true});

var request = function (req, res) {
    res.writeHead(200);
    res.write(html);
}

var games = {};

//TODO: check player name already exists



quarto.sockets.on('connection', function (socket) {
    var gid;

    socket.emit('connected', {message: 'you were connected'});

    socket.on('getId', function getId () {
        socket.emit('gotId', shortId.generate());
    });

    socket.on('register', function register (gameId) {
        var message = 'Joining a game';
        gid = gameId;
        var game = GameServer.getGame(gameId);
        if ( typeof game == 'undefined' ) {
            GameServer.newGame({id:gameId});
            message = 'new game';
            socket.emit('registered', {message: message, players: [], socket: socket.id});
        } else {
            players = game.exportPlayers();
//            console.log(players);
            socket.emit('registered', {message: message, players: players, socket: socket.id});
        }

        socket.join(gameId);

    });

    socket.on('newPlayer', function newPlayer (userData) {
        var game = getGame(socket);
        var player = game.addPlayer({socket: socket.id, name: userData.name}).export();
//        console.log('hey! player ' + player['socket'] + ' ' + player['name'] + ' was added yo!');
//        console.log('-----------------------------');
        socket.emit('playerJoined', {player: player, self: true})
        socket.broadcast.to(gid).emit('playerJoined', {player: player, self: false});
        if (game.isGameReady()) {
            player = game.getStartPlayer();
            quarto.sockets.in(gid).emit('pickedStartPlayer', {player: player.export()});
        }
    });

    socket.on('dragPiece', function draggingPiece (data) {
        socket.broadcast.to(gid).emit('draggedPiece', data);
    });
    socket.on('dragend', function (data) {
        socket.broadcast.to(gid).emit('dragended', data);
    });

    socket.on('dropPiece', function (data) {
        socket.broadcast.to(gid).emit('droppedPiece', data);
    });

    socket.on('selectPiece', function (data) {
        socket.broadcast.to(gid).emit('selectedPiece', {piece: data.piece});
    });

    socket.on('nextMove', function (data) {
        getGame(socket).switchCurrentPlayer();
        var player = getGame(socket).getCurrentPlayer();
        quarto.sockets.in(gid).emit('nextMove', {player: player.export()});
    });

    socket.on('disconnect', function disconnect () {
        var player= getGame(socket).players[socket.id];
//        console.log('this is the player ready to delete: ' + player.get('name'));
        getGame(socket).removePlayer(socket.id);
        socket.leave(gid);
        quarto.sockets.in(gid).emit('exit', {message: 'A player left', player: player.export()});
    });
});

function getGame(socket) {
    var rooms = quarto.sockets.manager.roomClients[socket.id];
    for (prop in rooms) {
        if (prop != '') {
            return GameServer.getGame(prop.replace('/', ''));
        }
    }
}
