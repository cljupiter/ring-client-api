"use strict";
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
exports.RingChime = void 0;
var ring_types_1 = require("./ring-types");
var rest_client_1 = require("./rest-client");
var rxjs_1 = require("rxjs");
var settingsWhichRequireReboot = [
    'ding_audio_id',
    'ding_audio_user_id',
    'motion_audio_id',
    'motion_audio_user_id',
];
var RingChime = /** @class */ (function () {
    function RingChime(initialData, restClient) {
        this.initialData = initialData;
        this.restClient = restClient;
        this.onRequestUpdate = new rxjs_1.Subject();
        this.id = this.initialData.id;
        this.deviceType = this.initialData.kind;
        this.model = ring_types_1.ChimeModel[this.deviceType] || 'Chime';
        this.onData = new rxjs_1.BehaviorSubject(this.initialData);
    }
    RingChime.prototype.updateData = function (update) {
        this.onData.next(update);
    };
    RingChime.prototype.requestUpdate = function () {
        this.onRequestUpdate.next(null);
    };
    Object.defineProperty(RingChime.prototype, "data", {
        get: function () {
            return this.onData.getValue();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingChime.prototype, "name", {
        get: function () {
            return this.data.description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingChime.prototype, "description", {
        get: function () {
            return this.data.description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RingChime.prototype, "volume", {
        get: function () {
            return this.data.settings.volume;
        },
        enumerable: false,
        configurable: true
    });
    RingChime.prototype.getRingtones = function () {
        return this.restClient.request({
            url: (0, rest_client_1.clientApi)('ringtones')
        });
    };
    RingChime.prototype.getRingtoneByDescription = function (description, kind) {
        return __awaiter(this, void 0, void 0, function () {
            var ringtones, requestedRingtone;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRingtones()];
                    case 1:
                        ringtones = _a.sent(), requestedRingtone = ringtones.audios.find(function (audio) {
                            return audio.available &&
                                audio.description === description &&
                                audio.kind === kind;
                        });
                        if (!requestedRingtone) {
                            throw new Error('Requested ringtone not found');
                        }
                        return [2 /*return*/, requestedRingtone];
                }
            });
        });
    };
    RingChime.prototype.chimeUrl = function (path) {
        if (path === void 0) { path = ''; }
        return (0, rest_client_1.clientApi)("chimes/".concat(this.id, "/").concat(path));
    };
    RingChime.prototype.playSound = function (kind) {
        return this.restClient.request({
            url: this.chimeUrl('play_sound'),
            method: 'POST',
            json: { kind: kind }
        });
    };
    RingChime.prototype.snooze = function (time) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // time is in minutes, max 24 * 60 (1440)
                    return [4 /*yield*/, this.restClient.request({
                            url: this.chimeUrl('do_not_disturb'),
                            method: 'POST',
                            json: { time: time }
                        })];
                    case 1:
                        // time is in minutes, max 24 * 60 (1440)
                        _a.sent();
                        this.requestUpdate();
                        return [2 /*return*/];
                }
            });
        });
    };
    RingChime.prototype.clearSnooze = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({
                            url: this.chimeUrl('do_not_disturb'),
                            method: 'POST'
                        })];
                    case 1:
                        _a.sent();
                        this.requestUpdate();
                        return [2 /*return*/];
                }
            });
        });
    };
    RingChime.prototype.updateChime = function (update) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({
                            url: this.chimeUrl(),
                            method: 'PUT',
                            json: { chime: update }
                        })];
                    case 1:
                        _a.sent();
                        this.requestUpdate();
                        // inform caller if this change requires a reboot
                        return [2 /*return*/, Object.keys(update.settings || {}).some(function (key) {
                                return settingsWhichRequireReboot.includes(key);
                            })];
                }
            });
        });
    };
    RingChime.prototype.setVolume = function (volume) {
        if (volume < 0 || volume > 11) {
            throw new Error("Volume for ".concat(this.name, " must be between 0 and 11, got ").concat(volume));
        }
        return this.updateChime({
            settings: {
                volume: volume
            }
        });
    };
    RingChime.prototype.getHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restClient.request({
                            url: (0, rest_client_1.clientApi)("chimes/".concat(this.id, "/health"))
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.device_health];
                }
            });
        });
    };
    return RingChime;
}());
exports.RingChime = RingChime;
