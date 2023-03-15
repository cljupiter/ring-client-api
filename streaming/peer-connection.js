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
exports.WeriftPeerConnection = void 0;
/* eslint-disable brace-style */
var werift_1 = require("werift");
var rxjs_1 = require("rxjs");
var util_1 = require("../util");
var subscribed_1 = require("../subscribed");
var ringIceServers = [
    'stun:stun.kinesisvideo.us-east-1.amazonaws.com:443',
    'stun:stun.kinesisvideo.us-east-2.amazonaws.com:443',
    'stun:stun.kinesisvideo.us-west-2.amazonaws.com:443',
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun2.l.google.com:19302',
    'stun:stun3.l.google.com:19302',
    'stun:stun4.l.google.com:19302',
];
var WeriftPeerConnection = /** @class */ (function (_super) {
    __extends(WeriftPeerConnection, _super);
    function WeriftPeerConnection() {
        var _this = _super.call(this) || this;
        _this.onAudioRtp = new rxjs_1.Subject();
        _this.onAudioRtcp = new rxjs_1.Subject();
        _this.onVideoRtp = new rxjs_1.Subject();
        _this.onVideoRtcp = new rxjs_1.Subject();
        _this.onIceCandidate = new rxjs_1.Subject();
        _this.onConnectionState = new rxjs_1.ReplaySubject(1);
        _this.returnAudioTrack = new werift_1.MediaStreamTrack({ kind: 'audio' });
        _this.onRequestKeyFrame = new rxjs_1.Subject();
        var pc = (_this.pc = new werift_1.RTCPeerConnection({
            codecs: {
                audio: [
                    new werift_1.RTCRtpCodecParameters({
                        mimeType: 'audio/opus',
                        clockRate: 48000,
                        channels: 2
                    }),
                    new werift_1.RTCRtpCodecParameters({
                        mimeType: 'audio/PCMU',
                        clockRate: 8000,
                        channels: 1,
                        payloadType: 0
                    }),
                ],
                video: [
                    new werift_1.RTCRtpCodecParameters({
                        mimeType: 'video/H264',
                        clockRate: 90000,
                        rtcpFeedback: [
                            { type: 'transport-cc' },
                            { type: 'ccm', parameter: 'fir' },
                            { type: 'nack' },
                            { type: 'nack', parameter: 'pli' },
                            { type: 'goog-remb' },
                        ],
                        parameters: 'packetization-mode=1;profile-level-id=640029;level-asymmetry-allowed=1'
                    }),
                    new werift_1.RTCRtpCodecParameters({
                        mimeType: 'video/rtx',
                        clockRate: 90000
                    }),
                ]
            },
            iceServers: ringIceServers.map(function (server) { return ({ urls: server }); }),
            iceTransportPolicy: 'all',
            bundlePolicy: 'disable'
        })), audioTransceiver = pc.addTransceiver(_this.returnAudioTrack, {
            direction: 'sendrecv'
        }), videoTransceiver = pc.addTransceiver('video', {
            direction: 'recvonly'
        });
        audioTransceiver.onTrack.subscribe(function (track) {
            track.onReceiveRtp.subscribe(function (rtp) {
                _this.onAudioRtp.next(rtp);
            });
            track.onReceiveRtcp.subscribe(function (rtcp) {
                _this.onAudioRtcp.next(rtcp);
            });
            track.onReceiveRtp.once(function () {
                (0, util_1.logDebug)('received first audio packet');
            });
        });
        videoTransceiver.onTrack.subscribe(function (track) {
            track.onReceiveRtp.subscribe(function (rtp) {
                _this.onVideoRtp.next(rtp);
            });
            track.onReceiveRtcp.subscribe(function (rtcp) {
                _this.onVideoRtcp.next(rtcp);
            });
            track.onReceiveRtp.once(function () {
                (0, util_1.logDebug)('received first video packet');
                _this.addSubscriptions((0, rxjs_1.merge)(_this.onRequestKeyFrame, (0, rxjs_1.interval)(4000)).subscribe(function () {
                    videoTransceiver.receiver
                        .sendRtcpPLI(track.ssrc)["catch"](function (e) { return (0, util_1.logError)(e); });
                }));
                _this.requestKeyFrame();
            });
        });
        _this.pc.onIceCandidate.subscribe(function (iceCandidate) {
            _this.onIceCandidate.next(iceCandidate);
        });
        pc.iceConnectionStateChange.subscribe(function () {
            (0, util_1.logInfo)("iceConnectionStateChange: ".concat(pc.iceConnectionState));
            if (pc.iceConnectionState === 'closed') {
                _this.onConnectionState.next('closed');
            }
        });
        pc.connectionStateChange.subscribe(function () {
            (0, util_1.logInfo)("connectionStateChange: ".concat(pc.connectionState));
            _this.onConnectionState.next(pc.connectionState);
        });
        return _this;
    }
    WeriftPeerConnection.prototype.createOffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var offer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pc.createOffer()];
                    case 1:
                        offer = _a.sent();
                        return [4 /*yield*/, this.pc.setLocalDescription(offer)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, offer];
                }
            });
        });
    };
    WeriftPeerConnection.prototype.createAnswer = function (offer) {
        return __awaiter(this, void 0, void 0, function () {
            var answer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pc.setRemoteDescription(offer)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.pc.createAnswer()];
                    case 2:
                        answer = _a.sent();
                        return [4 /*yield*/, this.pc.setLocalDescription(answer)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, answer];
                }
            });
        });
    };
    WeriftPeerConnection.prototype.acceptAnswer = function (answer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pc.setRemoteDescription(answer)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WeriftPeerConnection.prototype.addIceCandidate = function (candidate) {
        return this.pc.addIceCandidate(candidate);
    };
    WeriftPeerConnection.prototype.requestKeyFrame = function () {
        this.onRequestKeyFrame.next();
    };
    WeriftPeerConnection.prototype.close = function () {
        this.pc.close()["catch"](util_1.logError);
        this.unsubscribe();
    };
    return WeriftPeerConnection;
}(subscribed_1.Subscribed));
exports.WeriftPeerConnection = WeriftPeerConnection;
