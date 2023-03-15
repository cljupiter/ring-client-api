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
exports.RingApi = void 0;
var rest_client_1 = require("./rest-client");
var location_1 = require("./location");
var ring_types_1 = require("./ring-types");
var ring_camera_1 = require("./ring-camera");
var ring_chime_1 = require("./ring-chime");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var util_1 = require("./util");
var ffmpeg_1 = require("./ffmpeg");
var subscribed_1 = require("./subscribed");
var push_receiver_1 = require("@eneris/push-receiver");
var ring_intercom_1 = require("./ring-intercom");
var RingApi = /** @class */ (function (_super) {
    __extends(RingApi, _super);
    function RingApi(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.restClient = new rest_client_1.RingRestClient(_this.options);
        _this.onRefreshTokenUpdated =
            _this.restClient.onRefreshTokenUpdated.asObservable();
        if (options.debug) {
            (0, util_1.enableDebug)();
        }
        var locationIds = options.locationIds, ffmpegPath = options.ffmpegPath;
        if (locationIds && !locationIds.length) {
            (0, util_1.logError)('Your Ring config has `"locationIds": []`, which means no locations will be used and no devices will be found.');
        }
        if (ffmpegPath) {
            (0, ffmpeg_1.setFfmpegPath)(ffmpegPath);
        }
        return _this;
    }
    RingApi.prototype.fetchRingDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, doorbots, chimes, authorizedDoorbots, stickupCams, baseStations, beamBridges, otherDevices, onvifCameras, intercoms, thirdPartyGarageDoorOpeners, unknownDevices;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({ url: (0, rest_client_1.clientApi)('ring_devices') })];
                    case 1:
                        _a = _b.sent(), doorbots = _a.doorbots, chimes = _a.chimes, authorizedDoorbots = _a.authorized_doorbots, stickupCams = _a.stickup_cams, baseStations = _a.base_stations, beamBridges = _a.beams_bridges, otherDevices = _a.other, onvifCameras = [], intercoms = [], thirdPartyGarageDoorOpeners = [], unknownDevices = [];
                        otherDevices.forEach(function (device) {
                            switch (device.kind) {
                                case ring_types_1.RingDeviceType.OnvifCamera:
                                    onvifCameras.push(device);
                                    break;
                                case ring_types_1.RingDeviceType.IntercomHandsetAudio:
                                    intercoms.push(device);
                                    break;
                                case ring_types_1.RingDeviceType.ThirdPartyGarageDoorOpener:
                                    thirdPartyGarageDoorOpeners.push(device);
                                    break;
                                default:
                                    unknownDevices.push(device);
                                    break;
                            }
                        });
                        return [2 /*return*/, {
                                doorbots: doorbots,
                                chimes: chimes,
                                authorizedDoorbots: authorizedDoorbots,
                                stickupCams: stickupCams,
                                allCameras: __spreadArray(__spreadArray(__spreadArray(__spreadArray([], doorbots, true), stickupCams, true), authorizedDoorbots, true), onvifCameras, true),
                                baseStations: baseStations,
                                beamBridges: beamBridges,
                                onvifCameras: onvifCameras,
                                thirdPartyGarageDoorOpeners: thirdPartyGarageDoorOpeners,
                                intercoms: intercoms,
                                unknownDevices: unknownDevices
                            }];
                }
            });
        });
    };
    RingApi.prototype.listenForDeviceUpdates = function (cameras, chimes, intercoms) {
        var _this = this;
        var cameraStatusPollingSeconds = this.options.cameraStatusPollingSeconds;
        if (!cameraStatusPollingSeconds) {
            return;
        }
        var devices = __spreadArray(__spreadArray(__spreadArray([], cameras, true), chimes, true), intercoms, true), onDeviceRequestUpdate = rxjs_1.merge.apply(void 0, devices.map(function (device) { return device.onRequestUpdate; })), onUpdateReceived = new rxjs_1.Subject(), onPollForStatusUpdate = cameraStatusPollingSeconds
            ? onUpdateReceived.pipe((0, operators_1.debounceTime)(cameraStatusPollingSeconds * 1000))
            : rxjs_1.EMPTY, camerasById = cameras.reduce(function (byId, camera) {
            byId[camera.id] = camera;
            return byId;
        }, {}), chimesById = chimes.reduce(function (byId, chime) {
            byId[chime.id] = chime;
            return byId;
        }, {}), intercomsById = intercoms.reduce(function (byId, intercom) {
            byId[intercom.id] = intercom;
            return byId;
        }, {});
        if (!cameras.length && !chimes.length && !intercoms.length) {
            return;
        }
        this.addSubscriptions((0, rxjs_1.merge)(onDeviceRequestUpdate, onPollForStatusUpdate)
            .pipe((0, operators_1.throttleTime)(500), (0, operators_1.switchMap)(function () { return _this.fetchRingDevices()["catch"](function () { return null; }); }))
            .subscribe(function (response) {
            onUpdateReceived.next(null);
            if (!response) {
                return;
            }
            response.allCameras.forEach(function (data) {
                var camera = camerasById[data.id];
                if (camera) {
                    camera.updateData(data);
                }
            });
            response.chimes.forEach(function (data) {
                var chime = chimesById[data.id];
                if (chime) {
                    chime.updateData(data);
                }
            });
            response.intercoms.forEach(function (data) {
                var intercom = intercomsById[data.id];
                if (intercom) {
                    intercom.updateData(data);
                }
            });
        }));
        if (cameraStatusPollingSeconds) {
            onUpdateReceived.next(null); // kick off polling
        }
    };
    RingApi.prototype.registerPushReceiver = function (cameras, intercoms) {
        return __awaiter(this, void 0, void 0, function () {
            var pushReceiver, devicesById, sendToDevice, _i, cameras_1, camera, _a, intercoms_1, intercom, e_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pushReceiver = new push_receiver_1["default"]({
                            logLevel: 'NONE',
                            senderId: '876313859327'
                        }), devicesById = {}, sendToDevice = function (id, notification) {
                            var _a;
                            (_a = devicesById[id]) === null || _a === void 0 ? void 0 : _a.processPushNotification(notification);
                        };
                        for (_i = 0, cameras_1 = cameras; _i < cameras_1.length; _i++) {
                            camera = cameras_1[_i];
                            devicesById[camera.id] = camera;
                        }
                        for (_a = 0, intercoms_1 = intercoms; _a < intercoms_1.length; _a++) {
                            intercom = intercoms_1[_a];
                            devicesById[intercom.id] = intercom;
                        }
                        pushReceiver.onCredentialsChanged(function (_a) {
                            var token = _a.newCredentials.fcm.token;
                            return __awaiter(_this, void 0, void 0, function () {
                                var e_2;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, this.restClient.request({
                                                    url: (0, rest_client_1.clientApi)('device'),
                                                    method: 'PATCH',
                                                    json: {
                                                        device: {
                                                            metadata: __assign(__assign({}, this.restClient.baseSessionMetadata), { pn_service: 'fcm' }),
                                                            os: 'android',
                                                            push_notification_token: token
                                                        }
                                                    }
                                                })];
                                        case 1:
                                            _b.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            e_2 = _b.sent();
                                            (0, util_1.logError)(e_2);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        });
                        pushReceiver.onNotification(function (_a) {
                            var _b;
                            var message = _a.message;
                            var dataJson = (_b = message.data) === null || _b === void 0 ? void 0 : _b.gcmData;
                            try {
                                var notification = JSON.parse(dataJson);
                                if ('ding' in notification) {
                                    sendToDevice(notification.ding.doorbot_id, notification);
                                }
                                else if ('alarm_meta' in notification) {
                                    // Alarm notification, such as intercom unlocked
                                    sendToDevice(notification.alarm_meta.device_zid, notification);
                                }
                            }
                            catch (e) {
                                (0, util_1.logError)(e);
                            }
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, pushReceiver.connect()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        (0, util_1.logError)('Failed to connect push notification receiver');
                        (0, util_1.logError)(e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RingApi.prototype.fetchRawLocations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rawLocations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({ url: (0, rest_client_1.deviceApi)('locations') })];
                    case 1:
                        rawLocations = (_a.sent()).user_locations;
                        if (!rawLocations) {
                            throw new Error('The Ring account which you used to generate a refresh token does not have any associated locations.  Please use an account that has access to at least one location.');
                        }
                        return [2 /*return*/, rawLocations];
                }
            });
        });
    };
    RingApi.prototype.fetchAmazonKeyLocks = function () {
        return this.restClient.request({
            url: 'https://api.ring.com/integrations/amazonkey/v2/devices/lock_associations'
        });
    };
    RingApi.prototype.fetchAndBuildLocations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rawLocations, _a, authorizedDoorbots, chimes, doorbots, allCameras, baseStations, beamBridges, intercoms, locationIdsWithHubs, cameras, ringChimes, ringIntercoms, locations;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.fetchRawLocations()];
                    case 1:
                        rawLocations = _b.sent();
                        return [4 /*yield*/, this.fetchRingDevices()];
                    case 2:
                        _a = _b.sent(), authorizedDoorbots = _a.authorizedDoorbots, chimes = _a.chimes, doorbots = _a.doorbots, allCameras = _a.allCameras, baseStations = _a.baseStations, beamBridges = _a.beamBridges, intercoms = _a.intercoms, locationIdsWithHubs = __spreadArray(__spreadArray([], baseStations, true), beamBridges, true).map(function (x) { return x.location_id; }), cameras = allCameras.map(function (data) {
                            return new ring_camera_1.RingCamera(data, doorbots.includes(data) ||
                                authorizedDoorbots.includes(data) ||
                                data.kind.startsWith('doorbell'), _this.restClient, _this.options.avoidSnapshotBatteryDrain || false);
                        }), ringChimes = chimes.map(function (data) { return new ring_chime_1.RingChime(data, _this.restClient); }), ringIntercoms = intercoms.map(function (data) { return new ring_intercom_1.RingIntercom(data, _this.restClient); }), locations = rawLocations
                            .filter(function (location) {
                            return (!Array.isArray(_this.options.locationIds) ||
                                _this.options.locationIds.includes(location.location_id));
                        })
                            .map(function (location) {
                            return new location_1.Location(location, cameras.filter(function (x) { return x.data.location_id === location.location_id; }), ringChimes.filter(function (x) { return x.data.location_id === location.location_id; }), ringIntercoms.filter(function (x) { return x.data.location_id === location.location_id; }), {
                                hasHubs: locationIdsWithHubs.includes(location.location_id),
                                hasAlarmBaseStation: baseStations.some(function (station) { return station.location_id === location.location_id; }),
                                locationModePollingSeconds: _this.options.locationModePollingSeconds
                            }, _this.restClient);
                        });
                        this.listenForDeviceUpdates(cameras, ringChimes, ringIntercoms);
                        this.registerPushReceiver(cameras, ringIntercoms)["catch"](function (e) {
                            (0, util_1.logError)(e);
                        });
                        return [2 /*return*/, locations];
                }
            });
        });
    };
    RingApi.prototype.getLocations = function () {
        if (!this.locationsPromise) {
            this.locationsPromise = this.fetchAndBuildLocations();
        }
        return this.locationsPromise;
    };
    RingApi.prototype.getCameras = function () {
        return __awaiter(this, void 0, void 0, function () {
            var locations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getLocations()];
                    case 1:
                        locations = _a.sent();
                        return [2 /*return*/, locations.reduce(function (cameras, location) { return __spreadArray(__spreadArray([], cameras, true), location.cameras, true); }, [])];
                }
            });
        });
    };
    RingApi.prototype.getProfile = function () {
        return this.restClient.request({
            url: (0, rest_client_1.clientApi)('profile')
        });
    };
    RingApi.prototype.disconnect = function () {
        this.unsubscribe();
        if (!this.locationsPromise) {
            return;
        }
        this.getLocations()
            .then(function (locations) {
            return locations.forEach(function (location) { return location.disconnect(); });
        })["catch"](function (e) {
            (0, util_1.logError)(e);
        });
        this.restClient.clearTimeouts();
    };
    return RingApi;
}(subscribed_1.Subscribed));
exports.RingApi = RingApi;
