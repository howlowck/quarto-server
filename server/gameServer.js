var Game = require('./gameModel');
var _ = require('underscore');

var GameServer = {
    games: {},
    validateReady: function () {

    },
    newGame: function (attr) {
        var game = new Game(attr);
        console.log(game);
        this.games[attr['id']] = game;
        return game;
    },
    getGame: function (gameId) {
        return this.games[gameId];
    },
    setGame: function (id, game) {
        this.games[id] = game;
    }
}

module.exports = GameServer;