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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.Location = void 0;
var socket_io_client_1 = require("socket.io-client");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var util_1 = require("./util");
var ring_types_1 = require("./ring-types");
var rest_client_1 = require("./rest-client");
var ring_camera_1 = require("./ring-camera");
var ring_device_1 = require("./ring-device");
var subscribed_1 = require("./subscribed");
var deviceListMessageType = 'DeviceInfoDocGetList';
function flattenDeviceData(data) {
    return Object.assign({}, data.general && data.general.v2, data.device && data.device.v1);
}
var Location = /** @class */ (function (_super) {
    __extends(Location, _super);
    function Location(locationDetails, cameras, chimes, intercoms, options, restClient) {
        var _this = _super.call(this) || this;
        _this.locationDetails = locationDetails;
        _this.cameras = cameras;
        _this.chimes = chimes;
        _this.intercoms = intercoms;
        _this.options = options;
        _this.restClient = restClient;
        _this.seq = 1;
        _this.onMessage = new rxjs_1.Subject();
        _this.onDataUpdate = new rxjs_1.Subject();
        _this.onDeviceDataUpdate = _this.onDataUpdate.pipe((0, operators_1.filter)(function (message) {
            return message.datatype === 'DeviceInfoDocType' && Boolean(message.body);
        }), (0, operators_1.concatMap)(function (message) { return message.body; }), (0, operators_1.map)(flattenDeviceData));
        _this.onDeviceList = _this.onMessage.pipe((0, operators_1.filter)(function (m) { return m.msg === deviceListMessageType; }));
        _this.onDevices = _this.onDeviceList.pipe((0, operators_1.scan)(function (devices, _a) {
            var deviceList = _a.body, src = _a.src;
            if (!deviceList) {
                return devices;
            }
            if (!_this.receivedAssetDeviceLists.includes(src)) {
                _this.receivedAssetDeviceLists.push(src);
            }
            return deviceList.reduce(function (updatedDevices, data) {
                var flatData = flattenDeviceData(data), existingDevice = updatedDevices.find(function (x) { return x.zid === flatData.zid; });
                if (existingDevice) {
                    existingDevice.updateData(flatData);
                    return updatedDevices;
                }
                return __spreadArray(__spreadArray([], updatedDevices, true), [new ring_device_1.RingDevice(flatData, _this, src)], false);
            }, devices);
        }, []), (0, operators_1.distinctUntilChanged)(function (a, b) { return a.length === b.length; }), (0, operators_1.filter)(function () {
            return Boolean(_this.assets &&
                _this.assets.every(function (asset) {
                    return _this.receivedAssetDeviceLists.includes(asset.uuid);
                }));
        }), (0, operators_1.shareReplay)(1));
        _this.onSessionInfo = _this.onDataUpdate.pipe((0, operators_1.filter)(function (m) { return m.msg === 'SessionInfo'; }), (0, operators_1.map)(function (m) { return m.body; }));
        _this.onConnected = new rxjs_1.BehaviorSubject(false);
        _this.onLocationMode = new rxjs_1.ReplaySubject(1);
        _this.onLocationModeRequested = new rxjs_1.Subject();
        _this.reconnecting = false;
        _this.disconnected = false;
        _this.receivedAssetDeviceLists = [];
        _this.offlineAssets = [];
        _this.hasHubs = _this.options.hasHubs;
        _this.hasAlarmBaseStation = _this.options.hasAlarmBaseStation;
        _this.addSubscriptions(
        // start listening for devices immediately
        _this.onDevices.subscribe(), 
        // watch for sessions to come online
        _this.onSessionInfo.subscribe(function (sessions) {
            sessions.forEach(function (_a) {
                var connectionStatus = _a.connectionStatus, assetUuid = _a.assetUuid;
                var assetWasOffline = _this.offlineAssets.includes(assetUuid), asset = _this.assets && _this.assets.find(function (x) { return x.uuid === assetUuid; });
                if (!asset) {
                    // we don't know about this asset, so don't worry about it
                    return;
                }
                if (connectionStatus === 'online') {
                    if (assetWasOffline) {
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        _this.requestList(deviceListMessageType, assetUuid)["catch"](function () { });
                        _this.offlineAssets = _this.offlineAssets.filter(function (id) { return id !== assetUuid; });
                        (0, util_1.logInfo)("Ring ".concat(asset.kind, " ").concat(assetUuid, " has come back online"));
                    }
                }
                else if (!assetWasOffline) {
                    (0, util_1.logError)("Ring ".concat(asset.kind, " ").concat(assetUuid, " is offline or on cellular backup.  Waiting for status to change"));
                    _this.offlineAssets.push(assetUuid);
                }
            });
        }));
        if (!options.hasAlarmBaseStation && options.locationModePollingSeconds) {
            _this.addSubscriptions((0, rxjs_1.merge)(_this.onLocationModeRequested, _this.onLocationMode)
                .pipe((0, operators_1.debounceTime)(options.locationModePollingSeconds * 1000))
                .subscribe(function () { return _this.getLocationMode(); }));
            _this.getLocationMode()["catch"](util_1.logError);
        }
        return _this;
    }
    Object.defineProperty(Location.prototype, "id", {
        get: function () {
            return this.locationId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Location.prototype, "locationId", {
        get: function () {
            return this.locationDetails.location_id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Location.prototype, "name", {
        get: function () {
            return this.locationDetails.name;
        },
        enumerable: false,
        configurable: true
    });
    Location.prototype.createConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, assets, ticket, host, supportedAssets, errorMessage, connection, reconnect;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.disconnected) {
                            return [2 /*return*/, Promise.resolve({ disconnected: true })];
                        }
                        (0, util_1.logInfo)('Creating location socket.io connection - ' + this.name);
                        if (process.version.startsWith('v15.')) {
                            (0, util_1.logError)('Node 15 is not currently supported by the Ring client. Please install the latest Node 14 instead. May not be able to fetch devices from Ring Alarm and Smart Lighting Hubs on this version of node.');
                        }
                        return [4 /*yield*/, this.restClient.request({
                                url: (0, rest_client_1.appApi)('clap/tickets?locationID=' + this.id)
                            })];
                    case 1:
                        _a = _b.sent(), assets = _a.assets, ticket = _a.ticket, host = _a.host, supportedAssets = assets.filter(ring_types_1.isWebSocketSupportedAsset);
                        this.assets = supportedAssets;
                        this.receivedAssetDeviceLists.length = 0;
                        this.offlineAssets.length = 0;
                        if (!supportedAssets.length) {
                            errorMessage = "No assets (alarm hubs or beam bridges) found for location ".concat(this.name, " - ").concat(this.id);
                            (0, util_1.logError)(errorMessage);
                            throw new Error(errorMessage);
                        }
                        connection = (0, socket_io_client_1.connect)("wss://".concat(host, "/?authcode=").concat(ticket, "&ack=false&EIO=3"), { transports: ['websocket'] }), reconnect = function () {
                            if (_this.reconnecting && _this.connectionPromise) {
                                return _this.connectionPromise;
                            }
                            _this.onConnected.next(false);
                            if (!_this.disconnected) {
                                (0, util_1.logInfo)('Reconnecting location socket.io connection');
                            }
                            _this.reconnecting = true;
                            connection.close();
                            return (_this.connectionPromise = (0, util_1.delay)(1000).then(function () {
                                return _this.createConnection();
                            }));
                        };
                        this.reconnecting = false;
                        connection.on('DataUpdate', function (message) {
                            if (message.datatype === 'HubDisconnectionEventType') {
                                (0, util_1.logInfo)('Location connection told to reconnect');
                                return reconnect();
                            }
                            _this.onDataUpdate.next(message);
                        });
                        connection.on('message', function (message) {
                            return _this.onMessage.next(message);
                        });
                        connection.on('error', reconnect);
                        connection.on('disconnect', reconnect);
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                connection.once('connect', function () {
                                    resolve(connection);
                                    _this.onConnected.next(true);
                                    (0, util_1.logInfo)('Ring connected to socket.io server');
                                    assets.forEach(function (asset) {
                                        return _this.requestList(deviceListMessageType, asset.uuid);
                                    });
                                });
                                connection.once('error', reject);
                            })["catch"](reconnect)];
                }
            });
        });
    };
    Location.prototype.getConnection = function () {
        if (!this.hasHubs) {
            return Promise.reject(new Error("Location ".concat(this.name, " does not have any hubs")));
        }
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        return (this.connectionPromise = this.createConnection());
    };
    Location.prototype.sendMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        message.seq = this.seq++;
                        connection.emit('message', message);
                        return [2 /*return*/];
                }
            });
        });
    };
    Location.prototype.sendCommandToSecurityPanel = function (commandType, data) {
        return __awaiter(this, void 0, void 0, function () {
            var securityPanel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSecurityPanel()];
                    case 1:
                        securityPanel = _a.sent();
                        securityPanel.sendCommand(commandType, data);
                        return [2 /*return*/];
                }
            });
        });
    };
    Location.prototype.setAlarmMode = function (alarmMode, bypassSensorZids) {
        return __awaiter(this, void 0, void 0, function () {
            var securityPanel, updatedDataPromise, updatedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSecurityPanel()];
                    case 1:
                        securityPanel = _a.sent(), updatedDataPromise = (0, rxjs_1.firstValueFrom)(securityPanel.onData.pipe((0, operators_1.skip)(1)));
                        return [4 /*yield*/, this.sendCommandToSecurityPanel('security-panel.switch-mode', {
                                mode: alarmMode,
                                bypass: bypassSensorZids
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, updatedDataPromise];
                    case 3:
                        updatedData = _a.sent();
                        if (updatedData.mode !== alarmMode) {
                            throw new Error("Failed to set alarm mode to \"".concat(alarmMode, "\".  Sensors may require bypass, which can only be done in the Ring app."));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Location.prototype.getAlarmMode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var securityPanel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSecurityPanel()];
                    case 1:
                        securityPanel = _a.sent();
                        return [2 /*return*/, securityPanel.data.mode];
                }
            });
        });
    };
    Location.prototype.soundSiren = function () {
        return this.sendCommandToSecurityPanel('security-panel.sound-siren');
    };
    Location.prototype.silenceSiren = function () {
        return this.sendCommandToSecurityPanel('security-panel.silence-siren');
    };
    Location.prototype.setLightGroup = function (groupId, on, durationSeconds) {
        if (durationSeconds === void 0) { durationSeconds = 60; }
        return this.restClient.request({
            method: 'POST',
            url: "https://api.ring.com/groups/v1/locations/".concat(this.id, "/groups/").concat(groupId, "/devices"),
            json: {
                lights_on: {
                    duration_seconds: durationSeconds,
                    enabled: on
                }
            }
        });
    };
    Location.prototype.getNextMessageOfType = function (type, src) {
        return (0, rxjs_1.firstValueFrom)(this.onMessage.pipe((0, operators_1.filter)(function (m) { return m.msg === type && m.src === src; }), (0, operators_1.map)(function (m) { return m.body; })));
    };
    Location.prototype.requestList = function (listType, assetId) {
        return this.sendMessage({ msg: listType, dst: assetId });
    };
    Location.prototype.getList = function (listType, assetId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requestList(listType, assetId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.getNextMessageOfType(listType, assetId)];
                }
            });
        });
    };
    Location.prototype.getDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasHubs) {
                            return [2 /*return*/, Promise.resolve([])];
                        }
                        if (!!this.connectionPromise) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getConnection()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, (0, rxjs_1.firstValueFrom)(this.onDevices)];
                }
            });
        });
    };
    Location.prototype.getRoomList = function (assetId) {
        return this.getList('RoomGetList', assetId);
    };
    Location.prototype.getSecurityPanel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devices, securityPanel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.securityPanel) {
                            return [2 /*return*/, this.securityPanel];
                        }
                        return [4 /*yield*/, this.getDevices()];
                    case 1:
                        devices = _a.sent(), securityPanel = devices.find(function (device) {
                            return device.data.deviceType === ring_types_1.RingDeviceType.SecurityPanel;
                        });
                        if (!securityPanel) {
                            throw new Error("Could not find a security panel for location ".concat(this.name, " - ").concat(this.id));
                        }
                        return [2 /*return*/, (this.securityPanel = securityPanel)];
                }
            });
        });
    };
    Location.prototype.disarm = function () {
        return this.setAlarmMode('none');
    };
    Location.prototype.armHome = function (bypassSensorZids) {
        return this.setAlarmMode('some', bypassSensorZids);
    };
    Location.prototype.armAway = function (bypassSensorZids) {
        return this.setAlarmMode('all', bypassSensorZids);
    };
    Location.prototype.getHistory = function (options) {
        if (options === void 0) { options = {}; }
        options.maxLevel = options.maxLevel || 50;
        return this.restClient.request({
            url: (0, rest_client_1.appApi)("rs/history".concat((0, ring_camera_1.getSearchQueryString)(__assign({ accountId: this.id }, options))))
        });
    };
    Location.prototype.getCameraEvents = function (options) {
        if (options === void 0) { options = {}; }
        return this.restClient.request({
            url: (0, rest_client_1.clientApi)("locations/".concat(this.id, "/events").concat((0, ring_camera_1.getSearchQueryString)(options)))
        });
    };
    Location.prototype.getAccountMonitoringStatus = function () {
        return this.restClient.request({
            url: (0, rest_client_1.appApi)('rs/monitoring/accounts/' + this.id)
        });
    };
    Location.prototype.triggerAlarm = function (signalType) {
        var now = Date.now(), alarmSessionUuid = (0, util_1.generateUuid)(), baseStationAsset = this.assets && this.assets.find(function (x) { return x.kind === 'base_station_v1'; });
        if (!baseStationAsset) {
            throw new Error('Cannot dispatch panic events without an alarm base station');
        }
        return this.restClient.request({
            method: 'POST',
            url: (0, rest_client_1.appApi)("rs/monitoring/accounts/".concat(this.id, "/assets/").concat(baseStationAsset.uuid, "/userAlarm")),
            json: {
                alarmSessionUuid: alarmSessionUuid,
                currentTsMs: now,
                eventOccurredTime: now,
                signalType: signalType
            }
        });
    };
    Location.prototype.triggerBurglarAlarm = function () {
        return this.triggerAlarm(ring_types_1.DispatchSignalType.Burglar);
    };
    Location.prototype.triggerFireAlarm = function () {
        return this.triggerAlarm(ring_types_1.DispatchSignalType.Fire);
    };
    Location.prototype.getLocationMode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.onLocationModeRequested.next(null);
                        return [4 /*yield*/, this.restClient.request({
                                method: 'GET',
                                url: (0, rest_client_1.appApi)("mode/location/".concat(this.id))
                            })];
                    case 1:
                        response = _a.sent();
                        this.onLocationMode.next(response.mode);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Location.prototype.setLocationMode = function (mode) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({
                            method: 'POST',
                            url: (0, rest_client_1.appApi)("mode/location/".concat(this.id)),
                            json: { mode: mode }
                        })];
                    case 1:
                        response = _a.sent();
                        this.onLocationMode.next(response.mode);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Location.prototype.disableLocationModes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({
                            method: 'DELETE',
                            url: (0, rest_client_1.appApi)("mode/location/".concat(this.id, "/settings"))
                        })];
                    case 1:
                        _a.sent();
                        this.onLocationMode.next('disabled');
                        return [2 /*return*/];
                }
            });
        });
    };
    Location.prototype.enableLocationModes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({
                            method: 'POST',
                            url: (0, rest_client_1.appApi)("mode/location/".concat(this.id, "/settings/setup"))
                        })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.getLocationMode()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Location.prototype.getLocationModeSettings = function () {
        return this.restClient.request({
            method: 'GET',
            url: (0, rest_client_1.appApi)("mode/location/".concat(this.id, "/settings"))
        });
    };
    Location.prototype.setLocationModeSettings = function (settings) {
        return this.restClient.request({
            method: 'POST',
            url: (0, rest_client_1.appApi)("mode/location/".concat(this.id, "/settings")),
            json: settings
        });
    };
    Location.prototype.getLocationModeSharing = function () {
        return this.restClient.request({
            method: 'GET',
            url: (0, rest_client_1.appApi)("mode/location/".concat(this.id, "/sharing"))
        });
    };
    Location.prototype.setLocationModeSharing = function (sharedUsersEnabled) {
        return this.restClient.request({
            method: 'POST',
            url: (0, rest_client_1.appApi)("mode/location/".concat(this.id, "/sharing")),
            json: { sharedUsersEnabled: sharedUsersEnabled }
        });
    };
    Location.prototype.supportsLocationModeSwitching = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modeResponse, mode, readOnly;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.hasAlarmBaseStation || !this.cameras.length) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.getLocationMode()];
                    case 1:
                        modeResponse = _a.sent(), mode = modeResponse.mode, readOnly = modeResponse.readOnly;
                        (0, util_1.logDebug)('Location Mode: ' + JSON.stringify(modeResponse));
                        return [2 /*return*/, !readOnly && !ring_types_1.disabledLocationModes.includes(mode)];
                }
            });
        });
    };
    Location.prototype.disconnect = function () {
        this.disconnected = true;
        this.unsubscribe();
        this.cameras.forEach(function (camera) { return camera.disconnect(); });
        this.getDevices()
            .then(function (devices) {
            devices.forEach(function (device) { return device.disconnect(); });
        })["catch"](util_1.logError);
        if (this.connectionPromise) {
            this.connectionPromise
                .then(function (connection) { return connection.close(); })["catch"](util_1.logError);
        }
    };
    return Location;
}(subscribed_1.Subscribed));
exports.Location = Location;
