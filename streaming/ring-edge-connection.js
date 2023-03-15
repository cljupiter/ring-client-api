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
exports.RingEdgeConnection = void 0;
var ws_1 = require("ws");
var rxjs_1 = require("rxjs");
var util_1 = require("../util");
var streaming_connection_base_1 = require("./streaming-connection-base");
var crypto_1 = require("crypto");
// eslint-disable-next-line no-shadow
var CloseReasonCode;
(function (CloseReasonCode) {
    CloseReasonCode[CloseReasonCode["NormalClose"] = 0] = "NormalClose";
    // reason: { code: 5, text: '[rsl-apps/webrtc-liveview-server/Session.cpp:429] [Auth] [0xd540]: [rsl-apps/session-manager/Manager.cpp:227] [AppAuth] Unauthorized: invalid or expired token' }
    // reason: { code: 5, text: 'Authentication failed: -1' }
    // reason: { code: 5, text: 'Sessions with the provided ID not found' }
    CloseReasonCode[CloseReasonCode["AuthenticationFailed"] = 5] = "AuthenticationFailed";
    // reason: { code: 6, text: 'Timeout waiting for ping' }
    CloseReasonCode[CloseReasonCode["Timeout"] = 6] = "Timeout";
})(CloseReasonCode || (CloseReasonCode = {}));
var RingEdgeConnection = /** @class */ (function (_super) {
    __extends(RingEdgeConnection, _super);
    function RingEdgeConnection(authToken, camera, options) {
        var _this = _super.call(this, new ws_1.WebSocket('wss://api.prod.signalling.ring.devices.a2z.com:443/ws', {
            headers: {
                Authorization: "Bearer ".concat(authToken),
                'X-Sig-API-Version': '4.0',
                'X-Sig-Client-ID': "ring_android-".concat(crypto_1["default"]
                    .randomBytes(4)
                    .toString('hex')),
                'X-Sig-Client-Info': 'Ring/3.49.0;Platform/Android;OS/7.0;Density/2.0;Device/samsung-SM-T710;Locale/en-US;TimeZone/GMT-07:00',
                'X-Sig-Auth-Type': 'ring_oauth'
            }
        }), options) || this;
        _this.camera = camera;
        _this.onSessionId = new rxjs_1.ReplaySubject(1);
        _this.onOfferSent = new rxjs_1.ReplaySubject(1);
        _this.sessionId = null;
        _this.addSubscriptions(_this.onWsOpen.subscribe(function () {
            (0, util_1.logDebug)("WebSocket connected for ".concat(camera.name, " (Ring Edge)"));
            _this.initiateCall()["catch"](function (e) {
                (0, util_1.logError)(e);
                _this.callEnded();
            });
        }), 
        // The ring-edge session needs a ping every 5 seconds to keep the connection alive
        (0, rxjs_1.interval)(5000).subscribe(function () {
            _this.sendSessionMessage('ping');
        }), _this.pc.onIceCandidate.subscribe(function (iceCandidate) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, rxjs_1.firstValueFrom)(this.onOfferSent)];
                    case 1:
                        _a.sent();
                        this.sendMessage({
                            method: 'ice',
                            body: {
                                doorbot_id: camera.id,
                                ice: iceCandidate.candidate,
                                mlineindex: iceCandidate.sdpMLineIndex
                            }
                        });
                        return [2 /*return*/];
                }
            });
        }); }));
        return _this;
    }
    RingEdgeConnection.prototype.initiateCall = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sdp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pc.createOffer()];
                    case 1:
                        sdp = (_a.sent()).sdp;
                        this.sendMessage({
                            method: 'live_view',
                            body: {
                                doorbot_id: this.camera.id,
                                stream_options: { audio_enabled: true, video_enabled: true },
                                sdp: sdp
                            }
                        });
                        this.onOfferSent.next();
                        return [2 /*return*/];
                }
            });
        });
    };
    RingEdgeConnection.prototype.handleMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, text;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (message.body.doorbot_id !== this.camera.id) {
                            // ignore messages for other cameras
                            return [2 /*return*/];
                        }
                        if (['session_created', 'session_started'].includes(message.method) &&
                            'session_id' in message.body &&
                            !this.sessionId) {
                            this.sessionId = message.body.session_id;
                            this.onSessionId.next(this.sessionId);
                        }
                        if (message.body.session_id && message.body.session_id !== this.sessionId) {
                            // ignore messages for other sessions
                            return [2 /*return*/];
                        }
                        _a = message.method;
                        switch (_a) {
                            case 'session_created': return [3 /*break*/, 1];
                            case 'session_started': return [3 /*break*/, 1];
                            case 'sdp': return [3 /*break*/, 2];
                            case 'ice': return [3 /*break*/, 4];
                            case 'pong': return [3 /*break*/, 6];
                            case 'notification': return [3 /*break*/, 7];
                            case 'close': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 9];
                    case 1: 
                    // session already stored above
                    return [2 /*return*/];
                    case 2: return [4 /*yield*/, this.pc.acceptAnswer(message.body)];
                    case 3:
                        _b.sent();
                        this.onCallAnswered.next(message.body.sdp);
                        this.activate();
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, this.pc.addIceCandidate({
                            candidate: message.body.ice,
                            sdpMLineIndex: message.body.mlineindex
                        })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                    case 6: return [2 /*return*/];
                    case 7:
                        text = message.body.text;
                        if (text === 'PeerConnectionState::kConnecting' ||
                            text === 'PeerConnectionState::kConnected') {
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 9];
                    case 8:
                        (0, util_1.logError)('Video stream closed');
                        (0, util_1.logError)(message.body);
                        this.callEnded();
                        return [2 /*return*/];
                    case 9:
                        (0, util_1.logError)('UNKNOWN MESSAGE');
                        (0, util_1.logError)(message);
                        return [2 /*return*/];
                }
            });
        });
    };
    RingEdgeConnection.prototype.sendSessionMessage = function (method, body) {
        var _this = this;
        if (body === void 0) { body = {}; }
        var sendSessionMessage = function () {
            var message = {
                method: method,
                body: __assign(__assign({}, body), { doorbot_id: _this.camera.id, session_id: _this.sessionId })
            };
            _this.sendMessage(message);
        };
        if (this.sessionId) {
            // Send immediately if we already have a session id
            // This is needed to send `close` before closing the websocket
            sendSessionMessage();
        }
        else {
            (0, rxjs_1.firstValueFrom)(this.onSessionId)
                .then(sendSessionMessage)["catch"](function (e) { return (0, util_1.logError)(e); });
        }
    };
    return RingEdgeConnection;
}(streaming_connection_base_1.StreamingConnectionBase));
exports.RingEdgeConnection = RingEdgeConnection;
