var Game = require('./gameModel');
var _ = require('underscore');
var shortId = require('shortid');

var GameServer = {
    games: {},
    validateReady: function () {

    },
    newGame: function (attr) {
        var game = new Game(attr);
        this.games[attr.id] = game;
        return game;
    },
    getGame: function (gameId) {
        return this.games[gameId];
    },
    setGame: function (id, game) {
        this.games[id] = game;
    },
    destroyGame: function (gameId) {
        delete this.games[gameId];
    },
    findWaitingGame: function () {
        for (prop in this.games) {
            if (this.games[prop].get('waiting')) {
                return prop;
            }
        }
        return null;
    },
    generateId: function () {
        return shortId.generate();
    }
}

module.exports = GameServer;