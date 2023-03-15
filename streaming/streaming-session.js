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
exports.StreamingSession = void 0;
var werift_1 = require("werift");
var camera_utils_1 = require("@homebridge/camera-utils");
var rxjs_1 = require("rxjs");
var ffmpeg_1 = require("../ffmpeg");
var util_1 = require("../util");
var operators_1 = require("rxjs/operators");
var subscribed_1 = require("../subscribed");
function getCleanSdp(sdp, includeVideo) {
    return sdp
        .split('\nm=')
        .slice(1)
        .map(function (section) { return 'm=' + section; })
        .filter(function (section) { return includeVideo || !section.startsWith('m=video'); })
        .join('\n');
}
var StreamingSession = /** @class */ (function (_super) {
    __extends(StreamingSession, _super);
    function StreamingSession(camera, connection) {
        var _this = _super.call(this) || this;
        _this.camera = camera;
        _this.connection = connection;
        _this.onCallEnded = new rxjs_1.ReplaySubject(1);
        _this.onUsingOpus = new rxjs_1.ReplaySubject(1);
        _this.onVideoRtp = new rxjs_1.Subject();
        _this.onAudioRtp = new rxjs_1.Subject();
        _this.audioSplitter = new camera_utils_1.RtpSplitter();
        _this.videoSplitter = new camera_utils_1.RtpSplitter();
        _this.returnAudioSplitter = new camera_utils_1.RtpSplitter();
        _this.cameraSpeakerActivated = false;
        _this.hasEnded = false;
        _this.bindToConnection(connection);
        return _this;
    }
    StreamingSession.prototype.bindToConnection = function (connection) {
        var _this = this;
        this.addSubscriptions(connection.onAudioRtp.subscribe(this.onAudioRtp), connection.onVideoRtp.subscribe(this.onVideoRtp), connection.onCallAnswered.subscribe(function (sdp) {
            _this.onUsingOpus.next(sdp.toLocaleLowerCase().includes(' opus/'));
        }), connection.onCallEnded.subscribe(function () { return _this.callEnded(); }));
    };
    /**
     * @deprecated
     * activate will be removed in the future. Please use requestKeyFrame if you want to explicitly request an initial key frame
     */
    StreamingSession.prototype.activate = function () {
        this.requestKeyFrame();
    };
    StreamingSession.prototype.activateCameraSpeaker = function () {
        if (this.cameraSpeakerActivated || this.hasEnded) {
            return;
        }
        this.cameraSpeakerActivated = true;
        this.connection.activateCameraSpeaker();
    };
    StreamingSession.prototype.reservePort = function (bufferPorts) {
        if (bufferPorts === void 0) { bufferPorts = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var ports;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, camera_utils_1.reservePorts)({ count: bufferPorts + 1 })];
                    case 1:
                        ports = _a.sent();
                        return [2 /*return*/, ports[0]];
                }
            });
        });
    };
    Object.defineProperty(StreamingSession.prototype, "isUsingOpus", {
        get: function () {
            return (0, rxjs_1.firstValueFrom)(this.onUsingOpus.pipe((0, operators_1.mergeWith)(this.connection.onError.pipe((0, operators_1.map)(function (e) {
                throw e;
            })))));
        },
        enumerable: false,
        configurable: true
    });
    StreamingSession.prototype.startTranscoding = function (ffmpegOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var videoPort, audioPort, transcodeVideoStream, ringSdp, usingOpus, ffmpegInputArguments, inputSdp, ff;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.hasEnded) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.reservePort(1)];
                    case 1:
                        videoPort = _a.sent();
                        return [4 /*yield*/, this.reservePort(1)];
                    case 2:
                        audioPort = _a.sent(), transcodeVideoStream = ffmpegOptions.video !== false;
                        return [4 /*yield*/, Promise.race([
                                (0, rxjs_1.firstValueFrom)(this.connection.onCallAnswered),
                                (0, rxjs_1.firstValueFrom)(this.onCallEnded),
                            ])];
                    case 3:
                        ringSdp = _a.sent();
                        if (!ringSdp) {
                            (0, util_1.logDebug)('Call ended before answered');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.isUsingOpus];
                    case 4:
                        usingOpus = _a.sent(), ffmpegInputArguments = __spreadArray(__spreadArray(__spreadArray(__spreadArray([
                            '-hide_banner',
                            '-protocol_whitelist',
                            'pipe,udp,rtp,file,crypto'
                        ], (usingOpus ? ['-acodec', 'libopus'] : []), true), [
                            '-f',
                            'sdp'
                        ], false), (ffmpegOptions.input || []), true), [
                            '-i',
                            'pipe:',
                        ], false), inputSdp = getCleanSdp(ringSdp, transcodeVideoStream)
                            .replace(/m=audio \d+/, "m=audio ".concat(audioPort))
                            .replace(/m=video \d+/, "m=video ".concat(videoPort)), ff = new camera_utils_1.FfmpegProcess({
                            ffmpegArgs: ffmpegInputArguments.concat.apply(ffmpegInputArguments, __spreadArray(__spreadArray(__spreadArray([], (ffmpegOptions.audio || ['-acodec', 'aac']), false), (transcodeVideoStream
                                ? ffmpegOptions.video || ['-vcodec', 'copy']
                                : []), false), (ffmpegOptions.output || []), false)),
                            ffmpegPath: (0, ffmpeg_1.getFfmpegPath)(),
                            exitCallback: function () { return _this.callEnded(); },
                            logLabel: "From Ring (".concat(this.camera.name, ")"),
                            logger: {
                                error: util_1.logError,
                                info: util_1.logDebug
                            }
                        });
                        this.addSubscriptions(this.onAudioRtp
                            .pipe((0, operators_1.concatMap)(function (rtp) {
                            return _this.audioSplitter.send(rtp.serialize(), {
                                port: audioPort
                            });
                        }))
                            .subscribe());
                        if (transcodeVideoStream) {
                            this.addSubscriptions(this.onVideoRtp
                                .pipe((0, operators_1.concatMap)(function (rtp) {
                                return _this.videoSplitter.send(rtp.serialize(), {
                                    port: videoPort
                                });
                            }))
                                .subscribe());
                        }
                        this.onCallEnded.pipe((0, operators_1.take)(1)).subscribe(function () { return ff.stop(); });
                        ff.writeStdin(inputSdp);
                        // Request a key frame now that ffmpeg is ready to receive
                        this.requestKeyFrame();
                        return [2 /*return*/];
                }
            });
        });
    };
    StreamingSession.prototype.transcodeReturnAudio = function (ffmpegOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var audioOutForwarder, usingOpus, ff, _a, _b, _c, _d;
            var _e;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (this.hasEnded) {
                            return [2 /*return*/];
                        }
                        audioOutForwarder = new camera_utils_1.RtpSplitter(function (_a) {
                            var message = _a.message;
                            var rtp = werift_1.RtpPacket.deSerialize(message);
                            _this.connection.sendAudioPacket(rtp);
                            return null;
                        });
                        return [4 /*yield*/, this.isUsingOpus];
                    case 1:
                        usingOpus = _f.sent();
                        _a = camera_utils_1.FfmpegProcess.bind;
                        _e = {};
                        _b = [__spreadArray(__spreadArray(__spreadArray([
                                '-hide_banner',
                                '-protocol_whitelist',
                                'pipe,udp,rtp,file,crypto',
                                '-re',
                                '-i'
                            ], ffmpegOptions.input, true), [
                                '-acodec'
                            ], false), (usingOpus
                                ? ['libopus', '-ac', 2, '-ar', '48k']
                                : ['pcm_mulaw', '-ac', 1, '-ar', '8k']), true)];
                        _c = ['-flags',
                            '+global_header',
                            '-f',
                            'rtp'];
                        _d = "rtp://127.0.0.1:".concat;
                        return [4 /*yield*/, audioOutForwarder.portPromise];
                    case 2:
                        ff = new (_a.apply(camera_utils_1.FfmpegProcess, [void 0, (_e.ffmpegArgs = __spreadArray.apply(void 0, _b.concat([_c.concat([
                                    _d.apply("rtp://127.0.0.1:", [_f.sent()])
                                ]), false])),
                                _e.ffmpegPath = (0, ffmpeg_1.getFfmpegPath)(),
                                _e.exitCallback = function () { return _this.callEnded(); },
                                _e.logLabel = "Return Audio (".concat(this.camera.name, ")"),
                                _e.logger = {
                                    error: util_1.logError,
                                    info: util_1.logDebug
                                },
                                _e)]))();
                        this.onCallEnded.pipe((0, operators_1.take)(1)).subscribe(function () { return ff.stop(); });
                        return [2 /*return*/];
                }
            });
        });
    };
    StreamingSession.prototype.callEnded = function () {
        if (this.hasEnded) {
            return;
        }
        this.hasEnded = true;
        this.unsubscribe();
        this.onCallEnded.next();
        this.connection.stop();
        this.audioSplitter.close();
        this.videoSplitter.close();
        this.returnAudioSplitter.close();
    };
    StreamingSession.prototype.stop = function () {
        this.callEnded();
    };
    StreamingSession.prototype.sendAudioPacket = function (rtp) {
        if (this.hasEnded) {
            return;
        }
        this.connection.sendAudioPacket(rtp);
    };
    StreamingSession.prototype.requestKeyFrame = function () {
        this.connection.requestKeyFrame();
    };
    return StreamingSession;
}(subscribed_1.Subscribed));
exports.StreamingSession = StreamingSession;
