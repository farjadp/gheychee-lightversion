// ============================================================================
// Hardware Source: src/services/mediaProvider.js
// Version: 3.2.0
// Why: Phase 3 - Use yt-dlp for reliable video extraction
// Changelog: Use system yt-dlp via create() to fix python3-not-found on Cloud Run
// Env / Identity: Helper layer
// ============================================================================

const fs = require('fs');
const os = require('os');
const path = require('path');
const { create } = require('youtube-dl-exec');
const { getInstagramMedia } = require('./instagramBrowserProvider');

const DEFAULT_YTDLP_BINARY = 'yt-dlp';

const isExecutableFile = (filePath) => {
    if (!filePath) {
        return false;
    }

    try {
        fs.accessSync(filePath, fs.constants.X_OK);
        return true;
    } catch (_) {
        return false;
    }
};

const getMacUserBaseCandidates = () => {
    const pythonRoot = path.join(os.homedir(), 'Library', 'Python');
    if (!fs.existsSync(pythonRoot)) {
        return [];
    }

    try {
        return fs.readdirSync(pythonRoot, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => path.join(pythonRoot, entry.name, 'bin', DEFAULT_YTDLP_BINARY));
    } catch (_) {
        return [];
    }
};

const getYtDlpBinaryPath = () => {
    const candidates = [
        process.env.YTDLP_PATH,
        path.join(os.homedir(), '.local', 'bin', DEFAULT_YTDLP_BINARY),
        ...getMacUserBaseCandidates(),
        '/usr/local/bin/yt-dlp',
        '/opt/homebrew/bin/yt-dlp',
        '/usr/bin/yt-dlp'
    ].filter(Boolean);

    const discoveredPath = [...new Set(candidates)].find(isExecutableFile);
    return discoveredPath || process.env.YTDLP_PATH || DEFAULT_YTDLP_BINARY;
};

const isBinaryMissingError = (error, binaryPath) => {
    const diagnostic = [
        error.code,
        error.message,
        error.stderr,
        error.syscall,
        error.path,
        binaryPath
    ].filter(Boolean).join(' ');

    return error.code === 'ENOENT' ||
        error.errno === -2 ||
        error.path === binaryPath ||
        /enoent|not found|spawn .*yt-dlp/i.test(diagnostic);
};

const pickBestVideoUrl = (output) => {
    if (!output || typeof output !== 'object') {
        return null;
    }

    if (output.url) {
        return output.url;
    }

    if (Array.isArray(output.requested_downloads)) {
        const requestedDownload = output.requested_downloads.find((download) => download && download.url);
        if (requestedDownload) {
            return requestedDownload.url;
        }
    }

    if (Array.isArray(output.formats)) {
        const bestFormat = [...output.formats].reverse().find((format) =>
            format.ext === 'mp4' &&
            format.acodec !== 'none' &&
            format.vcodec !== 'none' &&
            format.url
        );

        if (bestFormat) {
            return bestFormat.url;
        }
    }

    if (Array.isArray(output.entries)) {
        for (const entry of output.entries) {
            const entryUrl = pickBestVideoUrl(entry);
            if (entryUrl) {
                return entryUrl;
            }
        }
    }

    return null;
};

/**
 * Interface definition:
 * getMedia(url, platform) -> Promise<{ type: 'video'|'image', url: string, description: string }>
 */

/**
 * Fetches media Using yt-dlp (via youtube-dl-exec wrapper).
 * 
 * @param {string} url - The URL to scrape
 * @param {string} platform - The detected platform
 * @returns {Promise<Object>} - Media object
 */
const getMedia = async (url, platform) => {
    console.log(`[MediaProvider] Phase 3 Extraction for ${platform}: ${url}`);

    if (platform === 'INSTAGRAM') {
        return getInstagramMedia(url);
    }

    const ytdlpBinaryPath = getYtDlpBinaryPath();
    const youtubedl = create(ytdlpBinaryPath);

    try {
        // 1. Build yt-dlp options
        // --dump-single-json: Get JSON metadata only
        // --no-warnings: Clean output
        // --no-check-certificate: Avoid SSL issues in some envs
        // --prefer-free-formats: Good practice
        const ytdlpOptions = {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificate: true,
            preferFreeFormats: true
            // Note: youtubeSkipDashManifest was removed — deprecated in yt-dlp >= 2024.x
        };

        // 2. Instagram Cookie Support
        // Instagram requires authentication for most content.
        // Export cookies from your browser using a cookies.txt extension
        // and set the file path in INSTAGRAM_COOKIES_FILE env var.
        if (platform === 'INSTAGRAM' && process.env.INSTAGRAM_COOKIES_FILE) {
            const cookiesPath = path.resolve(process.env.INSTAGRAM_COOKIES_FILE);
            ytdlpOptions.cookies = cookiesPath;
            console.log(`[MediaProvider] Using Instagram cookies from: ${cookiesPath}`);
        }

        // 3. Call yt-dlp
        const output = await youtubedl(url, ytdlpOptions);

        // 2. Extract Data
        const title = output.title || 'No Title';
        const description = output.description || title;
        const thumbnail = output.thumbnail;

        // The 'url' field in yt-dlp JSON is usually the direct video link (if single file)
        // or we might need to look at 'formats' if 'url' is missing.
        // For simple usage, 'url' or 'requested_downloads[0].url' is best.
        const videoUrl = pickBestVideoUrl(output);

        if (!videoUrl) {
            throw new Error('yt-dlp could not find a direct video URL.');
        }

        console.log(`[MediaProvider] Success: ${title.substring(0, 30)}...`);

        const footer = `

        〰️〰️〰️〰️〰️

شما دارید از بات تلگرام قیچی نسخه ی لایت استفاده میکنید
این نسخه فقط برای توییتر و اینستاگرام هست
این بات توسط فرجاد نوشته شده و توسعه داده شده
اطلاعات شما کاملا رمزنگاری میشه و در دیتابیس های تلگرام و گوگل قرار میگیره. هیچ دیتایی توسط من ذخیره نمیشه .
برای اثبات میتونید از کد گیت هاب بازدید کنید.
🔗 https://github.com/farjadp/gheychee-lightversion.git
خوشحال میشم نظرتون رو بگید

www.ashavid.ca
LinkedIn: https://www.linkedin.com/company/ashavid/
YouTube: https://www.youtube.com/@ashavidgroup
X: https://x.com/ashavidgroup

و یادمون نره ما عاشق ایران هستیم و داریم با ظحاک میجنگیم. هیچ چیزی برامون با ارزش تر از ایران نیست
به امید ایرانی آباد و آزاد

`;

        return {
            type: 'video',
            url: videoUrl,
            description: `🎥 *${title}*\n\n${description.substring(0, 200)}...\n\n🔗 ${url}\n${footer}`
        };

    } catch (error) {
        // Capture full error details including yt-dlp stderr
        const msg = error.message || '';
        const stderr = error.stderr || '';
        const fullError = [msg, stderr, error.code, error.syscall, error.path].filter(Boolean).join(' | ');
        console.error(`[MediaProvider] Error:`, fullError);
        console.error(`[MediaProvider] ytdlp binary: ${ytdlpBinaryPath}`);
        console.error(`[MediaProvider] cookies file: ${process.env.INSTAGRAM_COOKIES_FILE || 'not set'}`);

        // Binary not found
        if (isBinaryMissingError(error, ytdlpBinaryPath)) {
            throw new Error(`Failed to download media: yt-dlp binary not found at ${ytdlpBinaryPath}`);
        }

        // Instagram authentication issues
        if (platform === 'INSTAGRAM' && (fullError.includes('login required') || fullError.includes('rate-limit') || fullError.includes('cookies') || fullError.includes('HTTP Error 401') || fullError.includes('HTTP Error 403'))) {
            throw new Error(
                '⚠️ اینستاگرام در حال حاضر برای دانلود این محتوا نیاز به لاگین دارد.\n' +
                'این مشکل از طرف اینستاگرام هست و ربطی به بات نداره.\n' +
                'لینک دیگه ای امتحان کنید یا کمی بعد دوباره تلاش کنید. 🔄'
            );
        }

        throw new Error(`Failed to download media: ${fullError || 'Unknown error'}`);
    }
};

module.exports = {
    getMedia,
    _internal: {
        getYtDlpBinaryPath,
        isBinaryMissingError,
        pickBestVideoUrl
    }
};
