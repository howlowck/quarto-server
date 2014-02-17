var Player = require('./playerModel');
var _ = require('underscore');

var Game = function (attr) {
    this.attributes = {};
    this.players = {};
    this.spaces = {};
    this.currentPlayer = null;
    this.otherPlayer = null;
    return this.initialize(attr);
};

var prototype = {
    defaults: {
        id: null
    },

    initialize: function (attr) {
        _.extend(this.attributes, this.defaults, attr);
        return this;
    },

    get: function (attr) {
        return this.attributes[attr];
    },

    addPlayer: function (attr) {
        var shouldInGame = ! this.enoughPlayers();
        attr['inGame'] = shouldInGame;
        var player = new Player(attr);
        this.players[attr.socket] = new Player(attr);
//        console.log('added ' + player.get('name') + ' as ' + player.get('socket') + ' to server!!!!');
        return player;
    },
    removePlayer: function (socketId) {
//        console.log('DELETING Player: ' + this.players[socketId].get('name'));
        delete this.players[socketId];
    },
    enoughPlayers: function () {
        var activePlayers = _.reduce(this.players, function (acc, player) {
            if (player.isInGame()) {
                return acc + 1;
            }
            return acc;
        }, 0);

        if (activePlayers > 1) {
            return true;
        }
        return false;
    },
    getStartPlayer: function () {
        var player = this.players[Object.keys(this.players)[0]];
        this.setCurrentPlayer(player);
        this.otherPlayer = this.players[Object.keys(this.players)[1]];
        return player;
    },
    switchCurrentPlayer: function () {
        var temp = this.currentPlayer;
        this.setCurrentPlayer(this.otherPlayer);
        this.otherPlayer = temp;
    },
    setCurrentPlayer: function (player) {
        this.currentPlayer = player;
    },
    getCurrentPlayer: function () {
        if (! this.currentPlayer) {
            return this.getStartPlayer();
        }
        return this.currentPlayer;
    },
    exportPlayers: function() {
        var results = [];
        for (prop in this.players) {
//            console.log('here is the property: ' + prop + ' value: ' + this.players[prop].export()['socket']);
            results.push(this.players[prop].export());
        }
        return results;
    },
    isGameReady: function () {
        if (this.enoughPlayers()) {
            return true;
        }
        return false;
    }
}

Game.prototype.getActivePlayer = function () {

};

Game.prototype.setActivePlayer = function () {

};

Game.prototype.validatePlayers = function () {

};

Game.prototype.movePiece = function () {

};

Game.prototype.preparePiece = function () {

};

Game.prototype.nextMove = function () {

};

Game.prototype.validateMove = function () {

};

_.extend(Game.prototype, prototype);

module.exports = Game;