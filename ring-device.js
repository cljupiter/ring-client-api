"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.RingDevice = void 0;
var rxjs_1 = require("rxjs");
var ring_types_1 = require("./ring-types");
var operators_1 = require("rxjs/operators");
var subscribed_1 = require("./subscribed");
var util_1 = require("./util");
var RingDevice = /** @class */ (function (_super) {
    __extends(RingDevice, _super);
    function RingDevice(initialData, location, assetId) {
        var _this = _super.call(this) || this;
        _this.initialData = initialData;
        _this.location = location;
        _this.assetId = assetId;
        _this.onData = new rxjs_1.BehaviorSubject(_this.initialData);
        _this.zid = _this.initialData.zid;
        _this.id = _this.zid;
        _this.deviceType = _this.initialData.deviceType;
        _this.categoryId = _this.initialData.categoryId;
        _this.onComponentDevices = _this.location.onDevices.pipe((0, operators_1.map)(function (devices) { return devices.filter(function (_a) {
            var data = _a.data;
            return data.parentZid === _this.id;
        }); }));
        _this.addSubscriptions(location.onDeviceDataUpdate
            .pipe((0, operators_1.filter)(function (update) { return update.zid === _this.zid; }))
            .subscribe(function (update) { return _this.updateData(update); }));
        return _this;
    }
    RingDevice.prototype.updateData = function (update) {
        this.onData.next(Object.assign({}, this.data, update));
    };
    Object.defineProperty(RingDevice.prototype, "data", {
        get: function () {
            return this.onData.getValue();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingDevice.prototype, "name", {
        get: function () {
            return this.data.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingDevice.prototype, "supportsVolume", {
        get: function () {
            return (ring_types_1.deviceTypesWithVolume.includes(this.data.deviceType) &&
                this.data.volume !== undefined);
        },
        enumerable: false,
        configurable: true
    });
    RingDevice.prototype.setVolume = function (volume) {
        if (isNaN(volume) || volume < 0 || volume > 1) {
            throw new Error('Volume must be between 0 and 1');
        }
        if (!this.supportsVolume) {
            throw new Error("Volume can only be set on ".concat(ring_types_1.deviceTypesWithVolume.join(', ')));
        }
        return this.setInfo({ device: { v1: { volume: volume } } });
    };
    RingDevice.prototype.setInfo = function (body) {
        return this.location.sendMessage({
            msg: 'DeviceInfoSet',
            datatype: 'DeviceInfoSetType',
            dst: this.assetId,
            body: [
                __assign({ zid: this.zid }, body),
            ]
        });
    };
    RingDevice.prototype.sendCommand = function (commandType, data) {
        if (data === void 0) { data = {}; }
        this.setInfo({
            command: {
                v1: [
                    {
                        commandType: commandType,
                        data: data
                    },
                ]
            }
        })["catch"](util_1.logError);
    };
    RingDevice.prototype.toString = function () {
        return this.toJSON();
    };
    RingDevice.prototype.toJSON = function () {
        return JSON.stringify({
            data: this.data
        }, null, 2);
    };
    RingDevice.prototype.disconnect = function () {
        this.unsubscribe();
    };
    return RingDevice;
}(subscribed_1.Subscribed));
exports.RingDevice = RingDevice;
