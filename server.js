var io = require('socket.io'),
    connect = require('connect'),
    GameServer = require('./server/gameServer'),
    _ = require('underscore');

var port = process.env.PORT || 2060;

console.log('port: ' + port);

var app = connect().listen(port);
var quarto = io.listen(app, {log: true});

var games = {};

//TODO: check player name already exists

quarto.sockets.on('connection', function (socket) {
    var gid = null;
    socket.emit('connected', {message: 'you are connected'});

    socket.on('matchPlayer', function matchPlayer () {
        gameId = GameServer.findWaitingGame();
        if (gameId) {
            socket.emit('gotId', {id: gameId});
        } else {
            socket.emit('gotId', {id: GameServer.generateId(), foundPlayer: false});
        }
    });

    socket.on('getId', function getId () {
        socket.emit('gotId', {id: GameServer.generateId()});
    });

    socket.on('register', function register (data) {
        registerGame(data, socket);
    });

    socket.on('newPlayer', function newPlayer (userData) {
        var game = getGame(socket);
        gid = game.get('id');
        var player = game.addPlayer({socket: socket.id, name: userData.name}).export();
//        console.log('hey! player ' + player['socket'] + ' ' + player['name'] + ' was added yo!');
//        console.log('-----------------------------');
        socket.emit('playerJoined', {player: player, self: true})
        socket.broadcast.to(gid).emit('playerJoined', {player: player, self: false});
        if (game.isGameReady()) {
            player = game.getStartPlayer();
            game.inProgress = true;
            quarto.sockets.in(gid).emit('pickedStartPlayer', {player: player.export()});
        }
    });

    socket.on('message', function message(data) {
        var player= getGame(socket).players[socket.id];
       data['name'] = player.get('name');
       quarto.sockets.in(gid).emit('message', data);
    });

    socket.on('dragPiece', function draggingPiece (data) {
        socket.broadcast.to(gid).emit('draggedPiece', data);
    });
    socket.on('dragend', function (data) {
        socket.broadcast.to(gid).emit('dragended', data);
    });

    socket.on('dropPiece', function (data) {
        // {piece, space}
        var game = getGame(socket);
        game.updateBoard(data.piece, data.space);
        console.log(game.board.export());
        socket.broadcast.to(gid).emit('droppedPiece', data);
    });

    socket.on('selectPiece', function (data) {
        socket.broadcast.to(gid).emit('selectedPiece', {piece: data.piece});
    });

    socket.on('nextMove', function (data) {
        var game = getGame(socket);

        game.switchCurrentPlayer();
        game.newMove();
        var player = getGame(socket).getCurrentPlayer();
        quarto.sockets.in(gid).emit('nextMove', {player: player.export()});
    });

    socket.on('disconnect', function disconnect () {
        var game = getGame(socket),
            player= getGame(socket).players[socket.id];
        getGame(socket).removePlayer(socket.id);
        if (_.isEmpty(game.players)) {
            console.log('NO MORE PLAYERS!!');
            GameServer.destroyGame(gid);
        }
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

function registerGame(data, socket) {
    var message = 'Joining a game';
    var game = GameServer.getGame(data.gameid);
    if ( typeof game == 'undefined' ) {
        GameServer.newGame({id: data.gameid, waiting: data.waiting});
        message = 'new game';
        socket.emit('registered', {message: message, players: [], socket: socket.id});
    } else if (game.inProgress) {
        message = 'Watching a game in progress';
        players = game.exportPlayers();
        socket.emit('registered', {message: message, players: players, board: game.exportBoard()})
    } else {
        players = game.exportPlayers();
        socket.emit('registered', {message: message, players: players, socket: socket.id});
    }

    socket.join(data.gameid);
}

function getGameId(socket) {
    var game = getGame(socket);
    return game.get('id');
}