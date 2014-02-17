var _ = require('underscore');

var Player = function (attr) {
    this.attributes = {};
    this.initialize(attr);
    return this;
};

var proto = {
    defaults: {
        socket: null,
        name: null,
        inGame: false
    },
    initialize: function (attr) {
        _.extend(this.attributes, this.defaults, attr);
    },
    get: function (prop) {
        return this.attributes[prop];
    },
    isInGame : function () {
        return this.attributes['inGame'];
    },
    setInGame : function () {
        return this.attributes['inGame'] = value;
    },
    export: function () {
        return _.pick(this.attributes, 'socket', 'name', 'inGame');
    }
};

_.extend(Player.prototype, proto);

module.exports = Player;

