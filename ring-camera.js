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
exports.__esModule = true;
exports.RingCamera = exports.getSearchQueryString = exports.getBatteryLevel = void 0;
var ring_types_1 = require("./ring-types");
var rest_client_1 = require("./rest-client");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var util_1 = require("./util");
var subscribed_1 = require("./subscribed");
var webrtc_connection_1 = require("./streaming/webrtc-connection");
var ring_edge_connection_1 = require("./streaming/ring-edge-connection");
var streaming_session_1 = require("./streaming/streaming-session");
var simple_webrtc_session_1 = require("./streaming/simple-webrtc-session");
var maxSnapshotRefreshSeconds = 15, fullDayMs = 24 * 60 * 60 * 1000;
function parseBatteryLife(batteryLife) {
    if (batteryLife === null || batteryLife === undefined) {
        return null;
    }
    var batteryLevel = typeof batteryLife === 'number'
        ? batteryLife
        : Number.parseFloat(batteryLife);
    if (isNaN(batteryLevel)) {
        return null;
    }
    return batteryLevel;
}
function getStartOfToday() {
    return new Date(new Date().toLocaleDateString()).getTime();
}
function getEndOfToday() {
    return getStartOfToday() + fullDayMs - 1;
}
function getBatteryLevel(data) {
    var levels = [
        parseBatteryLife(data.battery_life),
        parseBatteryLife(data.battery_life_2),
    ].filter(function (level) { return level !== null; }), health = data.health;
    if (!levels.length ||
        (health && !health.battery_percentage && !health.battery_present)) {
        return null;
    }
    return Math.min.apply(Math, levels);
}
exports.getBatteryLevel = getBatteryLevel;
function getSearchQueryString(options) {
    var queryString = Object.entries(options)
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        if (value === undefined) {
            return '';
        }
        if (key === 'olderThanId') {
            key = 'pagination_key';
        }
        return "".concat(key, "=").concat(value);
    })
        .filter(function (x) { return x; })
        .join('&');
    return queryString.length ? "?".concat(queryString) : '';
}
exports.getSearchQueryString = getSearchQueryString;
var RingCamera = /** @class */ (function (_super) {
    __extends(RingCamera, _super);
    function RingCamera(initialData, isDoorbot, restClient, avoidSnapshotBatteryDrain) {
        var _this = _super.call(this) || this;
        _this.initialData = initialData;
        _this.isDoorbot = isDoorbot;
        _this.restClient = restClient;
        _this.avoidSnapshotBatteryDrain = avoidSnapshotBatteryDrain;
        _this.onRequestUpdate = new rxjs_1.Subject();
        _this.onNewNotification = new rxjs_1.Subject();
        _this.onActiveNotifications = new rxjs_1.BehaviorSubject([]);
        _this.onDoorbellPressed = _this.onNewNotification.pipe((0, operators_1.filter)(function (notification) { return notification.action === ring_types_1.PushNotificationAction.Ding; }), (0, operators_1.share)());
        _this.onMotionDetected = _this.onActiveNotifications.pipe((0, operators_1.map)(function (notifications) {
            return notifications.some(function (notification) { return notification.action === ring_types_1.PushNotificationAction.Motion; });
        }), (0, operators_1.distinctUntilChanged)(), (0, operators_1.publishReplay)(1), (0, operators_1.refCount)());
        _this.onMotionStarted = _this.onMotionDetected.pipe((0, operators_1.filter)(function (currentlyDetected) { return currentlyDetected; }), (0, operators_1.mapTo)(null), // no value needed, event is what matters
        (0, operators_1.share)());
        _this.lastSnapshotTimestamp = 0;
        _this.lastSnapshotTimestampLocal = 0;
        _this.fetchingSnapshot = false;
        _this.id = _this.initialData.id;
        _this.deviceType = _this.initialData.kind;
        _this.model =
            ring_types_1.RingCameraModel[_this.initialData.kind] ||
                'Unknown Model';
        _this.onData = new rxjs_1.BehaviorSubject(_this.initialData);
        _this.hasLight = _this.initialData.led_status !== undefined;
        _this.hasSiren = _this.initialData.siren_status !== undefined;
        _this.onBatteryLevel = _this.onData.pipe((0, operators_1.map)(function (data) {
            if (!('battery_life' in data)) {
                return null;
            }
            return getBatteryLevel(data);
        }), (0, operators_1.distinctUntilChanged)());
        _this.onInHomeDoorbellStatus = _this.onData.pipe((0, operators_1.map)(function (_a) {
            var chime_settings = _a.settings.chime_settings;
            return Boolean(chime_settings === null || chime_settings === void 0 ? void 0 : chime_settings.enable);
        }), (0, operators_1.distinctUntilChanged)());
        if (!initialData.subscribed) {
            _this.subscribeToDingEvents()["catch"](function (e) {
                (0, util_1.logError)('Failed to subscribe ' + initialData.description + ' to ding events');
                (0, util_1.logError)(e);
            });
        }
        if (!initialData.subscribed_motions) {
            _this.subscribeToMotionEvents()["catch"](function (e) {
                (0, util_1.logError)('Failed to subscribe ' + initialData.description + ' to motion events');
                (0, util_1.logError)(e);
            });
        }
        return _this;
    }
    RingCamera.prototype.updateData = function (update) {
        this.onData.next(update);
    };
    RingCamera.prototype.requestUpdate = function () {
        this.onRequestUpdate.next(null);
    };
    Object.defineProperty(RingCamera.prototype, "data", {
        get: function () {
            return this.onData.getValue();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "name", {
        get: function () {
            return this.data.description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "activeNotifications", {
        get: function () {
            return this.onActiveNotifications.getValue();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "latestNotification", {
        get: function () {
            var notifications = this.activeNotifications;
            return notifications[notifications.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "batteryLevel", {
        get: function () {
            if (!('battery_life' in this.data)) {
                return null;
            }
            return getBatteryLevel(this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "hasBattery", {
        get: function () {
            return this.batteryLevel !== null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "hasLowBattery", {
        get: function () {
            return this.data.alerts.battery === 'low';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "isCharging", {
        get: function () {
            if (!('external_connection' in this.data)) {
                return false;
            }
            return this.data.external_connection;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "operatingOnBattery", {
        get: function () {
            return this.hasBattery && this.data.settings.power_mode !== 'wired';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "isOffline", {
        get: function () {
            return this.data.alerts.connection === 'offline';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "isRingEdgeEnabled", {
        get: function () {
            return this.data.settings.sheila_settings.local_storage_enabled === true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "hasInHomeDoorbell", {
        get: function () {
            var chime_settings = this.data.settings.chime_settings;
            return (this.isDoorbot &&
                Boolean(chime_settings &&
                    [ring_types_1.DoorbellType.Mechanical, ring_types_1.DoorbellType.Digital].includes(chime_settings.type)));
        },
        enumerable: false,
        configurable: true
    });
    RingCamera.prototype.doorbotUrl = function (path) {
        if (path === void 0) { path = ''; }
        return (0, rest_client_1.clientApi)("doorbots/".concat(this.id, "/").concat(path));
    };
    RingCamera.prototype.deviceUrl = function (path) {
        if (path === void 0) { path = ''; }
        return (0, rest_client_1.deviceApi)("devices/".concat(this.id, "/").concat(path));
    };
    RingCamera.prototype.setLight = function (on) {
        return __awaiter(this, void 0, void 0, function () {
            var state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasLight) {
                            return [2 /*return*/, false];
                        }
                        state = on ? 'on' : 'off';
                        return [4 /*yield*/, this.restClient.request({
                                method: 'PUT',
                                url: this.doorbotUrl('floodlight_light_' + state)
                            })];
                    case 1:
                        _a.sent();
                        this.updateData(__assign(__assign({}, this.data), { led_status: state }));
                        return [2 /*return*/, true];
                }
            });
        });
    };
    RingCamera.prototype.setSiren = function (on) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasSiren) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.restClient.request({
                                method: 'PUT',
                                url: this.doorbotUrl('siren_' + (on ? 'on' : 'off'))
                            })];
                    case 1:
                        _a.sent();
                        this.updateData(__assign(__assign({}, this.data), { siren_status: { seconds_remaining: 1 } }));
                        return [2 /*return*/, true];
                }
            });
        });
    };
    RingCamera.prototype.setSettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({
                            method: 'PUT',
                            url: this.doorbotUrl(),
                            json: { doorbot: { settings: settings } }
                        })];
                    case 1:
                        _a.sent();
                        this.requestUpdate();
                        return [2 /*return*/];
                }
            });
        });
    };
    RingCamera.prototype.setDeviceSettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({
                            method: 'PATCH',
                            url: this.deviceUrl('settings'),
                            json: settings
                        })];
                    case 1:
                        response = _a.sent();
                        this.requestUpdate();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    RingCamera.prototype.getDeviceSettings = function () {
        return this.restClient.request({
            method: 'GET',
            url: this.deviceUrl('settings')
        });
    };
    // Enable or disable the in-home doorbell (if digital or mechanical)
    RingCamera.prototype.setInHomeDoorbell = function (enable) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasInHomeDoorbell) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.setSettings({ chime_settings: { enable: enable } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    RingCamera.prototype.getHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({
                            url: this.doorbotUrl('health')
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.device_health];
                }
            });
        });
    };
    RingCamera.prototype.createStreamingConnection = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var auth, liveCall;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isRingEdgeEnabled) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.restClient.getCurrentAuth()];
                    case 1:
                        auth = _a.sent();
                        return [2 /*return*/, new ring_edge_connection_1.RingEdgeConnection(auth.access_token, this, options)];
                    case 2: return [4 /*yield*/, this.restClient
                            .request({
                            method: 'POST',
                            url: this.doorbotUrl('live_call')
                        })["catch"](function (e) {
                            var _a;
                            if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                                var errorMessage = "Camera ".concat(_this.name, " returned 403 when starting a live stream.  This usually indicates that live streaming is blocked by Modes settings.  Check your Ring app and verify that you are able to stream from this camera with the current Modes settings.");
                                (0, util_1.logError)(errorMessage);
                                throw new Error(errorMessage);
                            }
                            throw e;
                        })];
                    case 3:
                        liveCall = _a.sent();
                        return [2 /*return*/, new webrtc_connection_1.WebrtcConnection(liveCall.data.session_id, this, options)];
                }
            });
        });
    };
    RingCamera.prototype.startLiveCall = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createStreamingConnection(options)];
                    case 1:
                        connection = _a.sent();
                        return [2 /*return*/, new streaming_session_1.StreamingSession(this, connection)];
                }
            });
        });
    };
    RingCamera.prototype.removeDingById = function (idToRemove) {
        var allActiveDings = this.activeNotifications, otherDings = allActiveDings.filter(function (_a) {
            var ding = _a.ding;
            return ding.id !== idToRemove;
        });
        this.onActiveNotifications.next(otherDings);
    };
    RingCamera.prototype.processPushNotification = function (notification) {
        var _this = this;
        if (!('ding' in notification)) {
            // only process ding/motion notifications
            return;
        }
        var activeDings = this.activeNotifications, dingId = notification.ding.id;
        this.onActiveNotifications.next(activeDings.filter(function (d) { return d.ding.id !== dingId; }).concat([notification]));
        this.onNewNotification.next(notification);
        setTimeout(function () {
            _this.removeDingById(dingId);
        }, 65 * 1000); // dings last ~1 minute
    };
    RingCamera.prototype.getEvents = function (options) {
        if (options === void 0) { options = {}; }
        return this.restClient.request({
            url: (0, rest_client_1.clientApi)("locations/".concat(this.data.location_id, "/devices/").concat(this.id, "/events").concat(getSearchQueryString(options)))
        });
    };
    RingCamera.prototype.videoSearch = function (_a) {
        var _b = _a === void 0 ? {
            dateFrom: getStartOfToday(),
            dateTo: getEndOfToday()
        } : _a, dateFrom = _b.dateFrom, dateTo = _b.dateTo, _c = _b.order, order = _c === void 0 ? 'asc' : _c;
        return this.restClient.request({
            url: (0, rest_client_1.clientApi)("video_search/history?doorbot_id=".concat(this.id, "&date_from=").concat(dateFrom, "&date_to=").concat(dateTo, "&order=").concat(order, "&api_version=11&includes%5B%5D=pva"))
        });
    };
    RingCamera.prototype.getPeriodicalFootage = function (_a) {
        var _b = _a === void 0 ? {
            startAtMs: getStartOfToday(),
            endAtMs: getEndOfToday()
        } : _a, startAtMs = _b.startAtMs, endAtMs = _b.endAtMs;
        // These will be mp4 clips that are created using periodic snapshots
        return this.restClient.request({
            url: "https://api.ring.com/recordings/public/footages/".concat(this.id, "?start_at_ms=").concat(startAtMs, "&end_at_ms=").concat(endAtMs, "&kinds=online_periodical&kinds=offline_periodical")
        });
    };
    RingCamera.prototype.getRecordingUrl = function (dingIdStr, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.transcoded, transcoded = _c === void 0 ? false : _c;
        return __awaiter(this, void 0, void 0, function () {
            var path, response;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        path = transcoded ? 'recording' : 'share/play';
                        return [4 /*yield*/, this.restClient.request({
                                url: (0, rest_client_1.clientApi)("dings/".concat(dingIdStr, "/").concat(path, "?disable_redirect=true"))
                            })];
                    case 1:
                        response = _d.sent();
                        return [2 /*return*/, response.url];
                }
            });
        });
    };
    RingCamera.prototype.isTimestampInLifeTime = function (timestampAge) {
        return timestampAge < this.snapshotLifeTime;
    };
    Object.defineProperty(RingCamera.prototype, "snapshotsAreBlocked", {
        get: function () {
            return this.data.settings.motion_detection_enabled === false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "snapshotLifeTime", {
        get: function () {
            return this.avoidSnapshotBatteryDrain && this.operatingOnBattery
                ? 600 * 1000 // battery cams only refresh timestamp every 10 minutes
                : 10 * 1000; // snapshot updates will be forced.  Limit to 10s lifetime
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "currentTimestampAge", {
        get: function () {
            return Date.now() - this.lastSnapshotTimestampLocal;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingCamera.prototype, "hasSnapshotWithinLifetime", {
        get: function () {
            return this.isTimestampInLifeTime(this.currentTimestampAge);
        },
        enumerable: false,
        configurable: true
    });
    RingCamera.prototype.checkIfSnapshotsAreBlocked = function () {
        if (this.snapshotsAreBlocked) {
            throw new Error("Motion detection is disabled for ".concat(this.name, ", which prevents snapshots from this camera.  This can be caused by Modes settings or by turning off the Record Motion setting."));
        }
        if (this.isOffline) {
            throw new Error("Cannot fetch snapshot for ".concat(this.name, " because it is offline"));
        }
    };
    RingCamera.prototype.shouldUseExistingSnapshotPromise = function () {
        if (this.fetchingSnapshot) {
            return true;
        }
        if (this.hasSnapshotWithinLifetime) {
            (0, util_1.logDebug)("Snapshot for ".concat(this.name, " is still within its life time (").concat(this.currentTimestampAge / 1000, "s old)"));
            return true;
        }
        if (!this.avoidSnapshotBatteryDrain || !this.operatingOnBattery) {
            // tell the camera to update snapshot immediately.
            // avoidSnapshotBatteryDrain is best if you have a battery cam that you request snapshots for frequently.  This can lead to battery drain if snapshot updates are forced.
            return false;
        }
    };
    RingCamera.prototype.getSnapshot = function (_a) {
        var _b = _a === void 0 ? {} : _a, uuid = _b.uuid;
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.lastSnapshotPromise && this.shouldUseExistingSnapshotPromise()) {
                            return [2 /*return*/, this.lastSnapshotPromise];
                        }
                        this.checkIfSnapshotsAreBlocked();
                        this.lastSnapshotPromise = Promise.race([
                            this.getNextSnapshot(uuid
                                ? { uuid: uuid }
                                : {
                                    afterMs: this.lastSnapshotTimestamp,
                                    force: true
                                }),
                            (0, util_1.delay)(maxSnapshotRefreshSeconds * 1000).then(function () {
                                var extraMessageForBatteryCam = _this.operatingOnBattery
                                    ? '.  This is normal behavior since this camera is unable to capture snapshots while streaming'
                                    : '';
                                throw new Error("Snapshot for ".concat(_this.name, " (").concat(_this.deviceType, " - ").concat(_this.model, ") failed to refresh after ").concat(maxSnapshotRefreshSeconds, " seconds").concat(extraMessageForBatteryCam));
                            }),
                        ]);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.lastSnapshotPromise];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _c.sent();
                        // snapshot request failed, don't use it again
                        this.lastSnapshotPromise = undefined;
                        throw e_1;
                    case 4:
                        this.fetchingSnapshot = false;
                        return [2 /*return*/, this.lastSnapshotPromise];
                }
            });
        });
    };
    RingCamera.prototype.getNextSnapshot = function (_a) {
        var afterMs = _a.afterMs, maxWaitMs = _a.maxWaitMs, force = _a.force, uuid = _a.uuid;
        return __awaiter(this, void 0, void 0, function () {
            var response, responseTimestamp, timeMillis, timestampAge;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({
                            url: "https://app-snaps.ring.com/snapshots/next/".concat(this.id),
                            responseType: 'buffer',
                            searchParams: {
                                'after-ms': afterMs,
                                'max-wait-ms': maxWaitMs,
                                extras: force ? 'force' : undefined,
                                uuid: uuid
                            },
                            headers: {
                                accept: 'image/jpeg'
                            },
                            allowNoResponse: true
                        })];
                    case 1:
                        response = _b.sent(), responseTimestamp = response.responseTimestamp, timeMillis = response.timeMillis, timestampAge = Math.abs(responseTimestamp - timeMillis);
                        this.lastSnapshotTimestamp = timeMillis;
                        this.lastSnapshotTimestampLocal = Date.now() - timestampAge;
                        return [2 /*return*/, response];
                }
            });
        });
    };
    RingCamera.prototype.getSnapshotByUuid = function (uuid) {
        return this.restClient.request({
            url: (0, rest_client_1.clientApi)('snapshots/uuid?uuid=' + uuid),
            responseType: 'buffer',
            headers: {
                accept: 'image/jpeg'
            }
        });
    };
    RingCamera.prototype.recordToFile = function (outputPath, duration) {
        if (duration === void 0) { duration = 30; }
        return __awaiter(this, void 0, void 0, function () {
            var liveCall;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.streamVideo({
                            output: ['-t', duration.toString(), outputPath]
                        })];
                    case 1:
                        liveCall = _a.sent();
                        return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(liveCall.onCallEnded)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RingCamera.prototype.streamVideo = function (ffmpegOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var liveCall;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.startLiveCall()];
                    case 1:
                        liveCall = _a.sent();
                        return [4 /*yield*/, liveCall.startTranscoding(ffmpegOptions)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, liveCall];
                }
            });
        });
    };
    /**
     * Returns a SimpleWebRtcSession, which can be initiated with an sdp offer.
     * This session has no backplane for trickle ICE, and is designed for use in a
     * browser setting.  Note, cameras with Ring Edge enabled will stream with the speaker
     * enabled as soon as the stream starts, which can drain the battery more quickly.
     */
    RingCamera.prototype.createSimpleWebRtcSession = function () {
        return new simple_webrtc_session_1.SimpleWebRtcSession(this, this.restClient);
    };
    RingCamera.prototype.subscribeToDingEvents = function () {
        return this.restClient.request({
            method: 'POST',
            url: this.doorbotUrl('subscribe')
        });
    };
    RingCamera.prototype.unsubscribeFromDingEvents = function () {
        return this.restClient.request({
            method: 'POST',
            url: this.doorbotUrl('unsubscribe')
        });
    };
    RingCamera.prototype.subscribeToMotionEvents = function () {
        return this.restClient.request({
            method: 'POST',
            url: this.doorbotUrl('motions_subscribe')
        });
    };
    RingCamera.prototype.unsubscribeFromMotionEvents = function () {
        return this.restClient.request({
            method: 'POST',
            url: this.doorbotUrl('motions_unsubscribe')
        });
    };
    RingCamera.prototype.disconnect = function () {
        this.unsubscribe();
    };
    return RingCamera;
}(subscribed_1.Subscribed));
exports.RingCamera = RingCamera;
