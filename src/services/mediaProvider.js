// ============================================================================
// Hardware Source: src/services/mediaProvider.js
// Version: 3.1.0
// Why: Phase 3 - Use yt-dlp for reliable video extraction
// Changelog: Removed deprecated youtubeSkipDashManifest, added Instagram cookie support
// Env / Identity: Helper layer
// ============================================================================

const youtubedl = require('youtube-dl-exec');
const path = require('path');

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
        let videoUrl = output.url;

        // If top-level url is missing, try to find the best format
        if (!videoUrl && output.formats) {
            // Simple heuristic: Get best mp4 with audio
            const bestFormat = output.formats.reverse().find(f => f.ext === 'mp4' && f.acodec !== 'none' && f.vcodec !== 'none');
            if (bestFormat) {
                videoUrl = bestFormat.url;
            }
        }

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
        console.error(`[MediaProvider] Error:`, error.message);

        // Provide user-friendly Persian error for Instagram auth issues
        const msg = error.message || '';
        if (platform === 'INSTAGRAM' && (msg.includes('login required') || msg.includes('rate-limit') || msg.includes('cookies'))) {
            throw new Error(
                '⚠️ اینستاگرام در حال حاضر برای دانلود این محتوا نیاز به لاگین دارد.\n' +
                'این مشکل از طرف اینستاگرام هست و ربطی به بات نداره.\n' +
                'لینک دیگه ای امتحان کنید یا کمی بعد دوباره تلاش کنید. 🔄'
            );
        }

        throw new Error(`Failed to download media: ${error.message || 'Unknown error'}`);
    }
};

module.exports = {
    getMedia
};
