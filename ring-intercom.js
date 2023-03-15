"use strict";
exports.__esModule = true;
exports.RingIntercom = void 0;
var ring_types_1 = require("./ring-types");
var rest_client_1 = require("./rest-client");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var ring_camera_1 = require("./ring-camera");
var util_1 = require("./util");
var RingIntercom = /** @class */ (function () {
    function RingIntercom(initialData, restClient) {
        this.initialData = initialData;
        this.restClient = restClient;
        this.onRequestUpdate = new rxjs_1.Subject();
        this.onDing = new rxjs_1.Subject();
        this.onUnlocked = new rxjs_1.Subject();
        this.id = this.initialData.id;
        this.deviceType = this.initialData.kind;
        this.onData = new rxjs_1.BehaviorSubject(this.initialData);
        this.onBatteryLevel = this.onData.pipe((0, operators_1.map)(function (data) { return (0, ring_camera_1.getBatteryLevel)(data); }), (0, operators_1.distinctUntilChanged)());
        if (!initialData.subscribed) {
            this.subscribeToDingEvents()["catch"](function (e) {
                (0, util_1.logError)('Failed to subscribe ' + initialData.description + ' to ding events');
                (0, util_1.logError)(e);
            });
        }
    }
    RingIntercom.prototype.updateData = function (update) {
        this.onData.next(update);
    };
    RingIntercom.prototype.requestUpdate = function () {
        this.onRequestUpdate.next(null);
    };
    Object.defineProperty(RingIntercom.prototype, "data", {
        get: function () {
            return this.onData.getValue();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingIntercom.prototype, "name", {
        get: function () {
            return this.data.description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingIntercom.prototype, "isOffline", {
        get: function () {
            return this.data.alerts.connection === 'offline';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingIntercom.prototype, "batteryLevel", {
        get: function () {
            return (0, ring_camera_1.getBatteryLevel)(this.data);
        },
        enumerable: false,
        configurable: true
    });
    RingIntercom.prototype.unlock = function () {
        return this.restClient.request({
            method: 'PUT',
            url: (0, rest_client_1.commandsApi)("devices/".concat(this.id, "/device_rpc")),
            json: {
                command_name: 'device_rpc',
                request: {
                    jsonrpc: '2.0',
                    method: 'unlock_door',
                    params: {
                        door_id: 0,
                        user_id: 0
                    }
                }
            }
        });
    };
    RingIntercom.prototype.doorbotUrl = function (path) {
        if (path === void 0) { path = ''; }
        return (0, rest_client_1.clientApi)("doorbots/".concat(this.id, "/").concat(path));
    };
    RingIntercom.prototype.subscribeToDingEvents = function () {
        return this.restClient.request({
            method: 'POST',
            url: this.doorbotUrl('subscribe')
        });
    };
    RingIntercom.prototype.unsubscribeFromDingEvents = function () {
        return this.restClient.request({
            method: 'POST',
            url: this.doorbotUrl('unsubscribe')
        });
    };
    RingIntercom.prototype.processPushNotification = function (notification) {
        if (notification.action === ring_types_1.PushNotificationAction.Ding) {
            this.onDing.next();
        }
        else if (notification.action === ring_types_1.PushNotificationAction.IntercomUnlock) {
            this.onUnlocked.next();
        }
    };
    return RingIntercom;
}());
exports.RingIntercom = RingIntercom;
