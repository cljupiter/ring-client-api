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
exports.__esModule = true;
exports.StreamingConnectionBase = void 0;
var peer_connection_1 = require("./peer-connection");
var subscribed_1 = require("../subscribed");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var util_1 = require("../util");
var StreamingConnectionBase = /** @class */ (function (_super) {
    __extends(StreamingConnectionBase, _super);
    function StreamingConnectionBase(ws, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.ws = ws;
        _this.options = options;
        _this.onCallAnswered = new rxjs_1.ReplaySubject(1);
        _this.onCallEnded = new rxjs_1.ReplaySubject(1);
        _this.onError = new rxjs_1.ReplaySubject(1);
        _this.onMessage = new rxjs_1.ReplaySubject();
        _this.hasEnded = false;
        if (options.createPeerConnection) {
            // we were passed a custom peer connection factory
            _this.pc = options.createPeerConnection();
            // passing rtp packets is not supported for custom peer connections
            _this.onAudioRtp = new rxjs_1.Subject();
            _this.onVideoRtp = new rxjs_1.Subject();
        }
        else {
            // no custom peer connection factory, use the werift and pass along rtp packets
            var pc = new peer_connection_1.WeriftPeerConnection();
            _this.pc = pc;
            _this.onAudioRtp = pc.onAudioRtp;
            _this.onVideoRtp = pc.onVideoRtp;
        }
        _this.onWsOpen = (0, rxjs_1.fromEvent)(_this.ws, 'open');
        var onMessage = (0, rxjs_1.fromEvent)(_this.ws, 'message'), onError = (0, rxjs_1.fromEvent)(_this.ws, 'error'), onClose = (0, rxjs_1.fromEvent)(_this.ws, 'close');
        _this.addSubscriptions(onMessage
            .pipe((0, operators_1.concatMap)(function (event) {
            var message = JSON.parse(event.data);
            _this.onMessage.next(message);
            return _this.handleMessage(message)["catch"](function (e) {
                if (e instanceof Error &&
                    e.message.includes('negotiate codecs failed')) {
                    e = new Error('Failed to negotiate codecs.  This is a known issue with Ring cameras.  Please see https://github.com/dgreif/ring/wiki/Streaming-Legacy-Mode');
                }
                _this.onError.next(e);
                throw e;
            });
        }))
            .subscribe(), onError.subscribe(function (e) {
            (0, util_1.logError)(e);
            _this.callEnded();
        }), onClose.subscribe(function () {
            _this.callEnded();
        }), _this.pc.onConnectionState.subscribe(function (state) {
            if (state === 'failed') {
                (0, util_1.logError)('Stream connection failed');
                _this.callEnded();
            }
            if (state === 'closed') {
                (0, util_1.logDebug)('Stream connection closed');
                _this.callEnded();
            }
        }), _this.onError.subscribe(function (e) {
            (0, util_1.logError)(e);
            _this.callEnded();
        }));
        return _this;
    }
    StreamingConnectionBase.prototype.activate = function () {
        (0, util_1.logInfo)('Activating Session');
        // the activate_session message is required to keep the stream alive longer than 70 seconds
        this.sendSessionMessage('activate_session');
        this.sendSessionMessage('stream_options', {
            audio_enabled: true,
            video_enabled: true
        });
    };
    StreamingConnectionBase.prototype.activateCameraSpeaker = function () {
        var _this = this;
        // Fire and forget this call so that callers don't get hung up waiting for answer (which might not happen)
        (0, rxjs_1.firstValueFrom)(this.onCallAnswered)
            .then(function () {
            _this.sendSessionMessage('camera_options', {
                stealth_mode: false
            });
        })["catch"](function (e) {
            (0, util_1.logError)(e);
        });
    };
    StreamingConnectionBase.prototype.sendMessage = function (message) {
        if (this.hasEnded) {
            return;
        }
        this.ws.send(JSON.stringify(message));
    };
    StreamingConnectionBase.prototype.sendAudioPacket = function (rtp) {
        if (this.hasEnded) {
            return;
        }
        if (this.pc instanceof peer_connection_1.WeriftPeerConnection) {
            this.pc.returnAudioTrack.writeRtp(rtp);
        }
        else {
            throw new Error('Cannot send audio packets to a custom peer connection implementation');
        }
    };
    StreamingConnectionBase.prototype.callEnded = function () {
        if (this.hasEnded) {
            return;
        }
        try {
            this.sendMessage({
                reason: { code: 0, text: '' },
                method: 'close'
            });
            this.ws.close();
        }
        catch (_) {
            // ignore any errors since we are stopping the call
        }
        this.hasEnded = true;
        this.unsubscribe();
        this.onCallEnded.next();
        this.pc.close();
    };
    StreamingConnectionBase.prototype.stop = function () {
        this.callEnded();
    };
    StreamingConnectionBase.prototype.requestKeyFrame = function () {
        var _a, _b;
        (_b = (_a = this.pc).requestKeyFrame) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    return StreamingConnectionBase;
}(subscribed_1.Subscribed));
exports.StreamingConnectionBase = StreamingConnectionBase;
