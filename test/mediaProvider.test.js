const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const mediaProvider = require('../src/services/mediaProvider');

test('getYtDlpBinaryPath prefers an executable YTDLP_PATH', () => {
    const originalPath = process.env.YTDLP_PATH;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gheychee-ytdlp-'));
    const binaryPath = path.join(tempDir, 'yt-dlp');

    fs.writeFileSync(binaryPath, '#!/bin/sh\nexit 0\n', { mode: 0o755 });
    process.env.YTDLP_PATH = binaryPath;

    try {
        assert.equal(mediaProvider._internal.getYtDlpBinaryPath(), binaryPath);
    } finally {
        if (originalPath === undefined) {
            delete process.env.YTDLP_PATH;
        } else {
            process.env.YTDLP_PATH = originalPath;
        }
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});

test('isBinaryMissingError detects ENOENT-style failures even without an error message', () => {
    const err = {
        code: 'ENOENT',
        errno: -2,
        message: '',
        path: 'yt-dlp',
        syscall: 'spawn yt-dlp'
    };

    assert.equal(mediaProvider._internal.isBinaryMissingError(err, 'yt-dlp'), true);
});

test('pickBestVideoUrl falls back to requested downloads and nested entries', () => {
    const requestedDownloadUrl = mediaProvider._internal.pickBestVideoUrl({
        requested_downloads: [{ url: 'https://cdn.example.com/video.mp4' }]
    });
    assert.equal(requestedDownloadUrl, 'https://cdn.example.com/video.mp4');

    const entryUrl = mediaProvider._internal.pickBestVideoUrl({
        entries: [
            { title: 'ignored' },
            { formats: [{ ext: 'mp4', acodec: 'aac', vcodec: 'h264', url: 'https://cdn.example.com/from-entry.mp4' }] }
        ]
    });
    assert.equal(entryUrl, 'https://cdn.example.com/from-entry.mp4');
});
