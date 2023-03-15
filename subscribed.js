"use strict";
exports.__esModule = true;
exports.Subscribed = void 0;
var Subscribed = /** @class */ (function () {
    function Subscribed() {
        this.subscriptions = [];
    }
    Subscribed.prototype.addSubscriptions = function () {
        var _a;
        var subscriptions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            subscriptions[_i] = arguments[_i];
        }
        (_a = this.subscriptions).push.apply(_a, subscriptions);
    };
    Subscribed.prototype.unsubscribe = function () {
        this.subscriptions.forEach(function (subscription) { return subscription.unsubscribe(); });
    };
    return Subscribed;
}());
exports.Subscribed = Subscribed;
