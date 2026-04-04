const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const instagramBrowserProvider = require('../src/services/instagramBrowserProvider');

test('parseNetscapeCookies converts Netscape rows into browser cookies', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gheychee-ig-cookies-'));
    const cookiesFile = path.join(tempDir, 'instagram.txt');

    fs.writeFileSync(
        cookiesFile,
        '# Netscape HTTP Cookie File\n.instagram.com\tTRUE\t/\tTRUE\t1800000000\tsessionid\tabc123\n',
        'utf8'
    );

    try {
        const cookies = instagramBrowserProvider._internal.parseNetscapeCookies(cookiesFile);
        assert.deepEqual(cookies, [{
            domain: '.instagram.com',
            path: '/',
            secure: true,
            expires: 1800000000,
            name: 'sessionid',
            value: 'abc123',
            httpOnly: false,
            sameSite: 'Lax'
        }]);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});

test('stripByteRangeQuery removes partial download query parameters', () => {
    const cleanedUrl = instagramBrowserProvider._internal.stripByteRangeQuery(
        'https://cdn.example.com/video.mp4?foo=bar&bytestart=100&byteend=999'
    );

    assert.equal(cleanedUrl, 'https://cdn.example.com/video.mp4?foo=bar');
});

test('decodeMediaDescriptor reads Instagram media metadata from the efg payload', () => {
    const descriptor = {
        xpv_asset_id: 1234567890,
        duration_s: 7,
        bitrate: 451539,
        vencode_tag: 'ig-xpvds.clips.c2-C3.dash_baseline_1_v1'
    };

    const encodedDescriptor = Buffer.from(JSON.stringify(descriptor)).toString('base64');
    const mediaDescriptor = instagramBrowserProvider._internal.decodeMediaDescriptor(
        `https://cdn.example.com/video.mp4?efg=${encodeURIComponent(encodedDescriptor)}`
    );

    assert.deepEqual(mediaDescriptor, {
        durationSeconds: 7,
        bitrate: 451539,
        vencodeTag: 'ig-xpvds.clips.c2-C3.dash_baseline_1_v1',
        xpvAssetId: '1234567890'
    });
});

test('selectBestVideoCandidate prefers the earliest video asset and ignores audio-only responses', () => {
    const candidates = new Map([
        ['audio', {
            url: 'https://cdn.example.com/audio.mp4',
            size: 50000,
            bitrate: 90000,
            durationSeconds: 7,
            vencodeTag: 'dash_lna_heaac_audio',
            xpvAssetId: 'asset-audio',
            firstSeen: 0,
            status: 200
        }],
        ['video-low', {
            url: 'https://cdn.example.com/video-low.mp4',
            size: 100000,
            bitrate: 300000,
            durationSeconds: 7,
            vencodeTag: 'dash_baseline_low',
            xpvAssetId: 'asset-main',
            firstSeen: 1,
            status: 200
        }],
        ['video-high', {
            url: 'https://cdn.example.com/video-high.mp4',
            size: 400000,
            bitrate: 900000,
            durationSeconds: 7,
            vencodeTag: 'dash_baseline_high',
            xpvAssetId: 'asset-main',
            firstSeen: 2,
            status: 200
        }],
        ['video-next-reel', {
            url: 'https://cdn.example.com/video-next.mp4',
            size: 900000,
            bitrate: 1500000,
            durationSeconds: 23,
            vencodeTag: 'dash_baseline_high',
            xpvAssetId: 'asset-next',
            firstSeen: 3,
            status: 200
        }]
    ]);

    const selectedCandidate = instagramBrowserProvider._internal.selectBestVideoCandidate(candidates);

    assert.equal(selectedCandidate.url, 'https://cdn.example.com/video-high.mp4');
});
