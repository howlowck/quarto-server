var _ = require('underscore');

var Board = function (attr) {
    this.attributes = {};
    this.spaces = {};
    this.currentMove = null;
    this.initialize(attr);
    return this;
};

var proto = {
    defaults: {
        frozen: false
    },
    defaultSpace: {
        name: null,
        occupied: null,
        frozen: false
    },
    initialize: function (attr) {
        _.extend(this.attributes, this.defaults, attr);
        this.spaces = {
            a1: _.defaults({name: 'a1'}, this.defaultSpace),
            a2: _.defaults({name: 'a2'}, this.defaultSpace),
            a3: _.defaults({name: 'a3'}, this.defaultSpace),
            a4: _.defaults({name: 'a4'}, this.defaultSpace),
            b1: _.defaults({name: 'b1'}, this.defaultSpace),
            b2: _.defaults({name: 'b2'}, this.defaultSpace),
            b3: _.defaults({name: 'b3'}, this.defaultSpace),
            b4: _.defaults({name: 'b4'}, this.defaultSpace),
            c1: _.defaults({name: 'c1'}, this.defaultSpace),
            c2: _.defaults({name: 'c2'}, this.defaultSpace),
            c3: _.defaults({name: 'c3'}, this.defaultSpace),
            c4: _.defaults({name: 'c4'}, this.defaultSpace),
            d1: _.defaults({name: 'd1'}, this.defaultSpace),
            d2: _.defaults({name: 'd2'}, this.defaultSpace),
            d3: _.defaults({name: 'd3'}, this.defaultSpace),
            d4: _.defaults({name: 'd4'}, this.defaultSpace)
        }
    },
    get: function (prop) {
        return this.attributes[prop];
    },
    set: function (prop, value) {
        this.attributes[prop] = value;
    },
    setSpace: function (spaceId, piece) {
        var space = this.spaces[spaceId];
        if (space.frozen) {
            return false;
        }

        if ( !! this.currentMove) {
            this.spaces[this.currentMove].occupied = null;
        }

        this.currentMove = spaceId;

        space.occupied = piece;
        return true;
    },
    newMove: function() {
        this.lockBoard();
        this.currentMove = null;
    },
    lockBoard: function () {
        _.each(this.spaces, function (space) {
            if (!! space.occupied) {
                space.frozen = true;
            }
        });
    },
    export: function () {
//        return _.filter(this.spaces, function (space) {
//            return !! space.occupied;
//        });
        return this.spaces;
    }
};

_.extend(Board.prototype, proto);

module.exports = Board;