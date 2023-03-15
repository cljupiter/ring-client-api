"use strict";
exports.__esModule = true;
exports.getFfmpegPath = exports.setFfmpegPath = void 0;
var ffmpegPath;
function setFfmpegPath(path) {
    ffmpegPath = path;
}
exports.setFfmpegPath = setFfmpegPath;
function getFfmpegPath() {
    return ffmpegPath;
}
exports.getFfmpegPath = getFfmpegPath;
