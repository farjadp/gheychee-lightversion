const fs = require('fs');
const { URL } = require('url');
const { chromium } = require('playwright-core');

const DEFAULT_CHROMIUM_CANDIDATES = [
    process.env.INSTAGRAM_CHROMIUM_PATH,
    process.env.CHROMIUM_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
].filter(Boolean);

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const NAVIGATION_TIMEOUT_MS = 60000;
const MEDIA_DISCOVERY_WAIT_MS = 12000;

const FOOTER = `

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

const getChromiumExecutablePath = () => {
    const discoveredPath = DEFAULT_CHROMIUM_CANDIDATES.find((candidate) => candidate && fs.existsSync(candidate));

    if (!discoveredPath) {
        throw new Error('Instagram browser runtime is not available.');
    }

    return discoveredPath;
};

const parseNetscapeCookies = (cookiesFilePath) => {
    const cookieLines = fs.readFileSync(cookiesFilePath, 'utf8')
        .split(/\r?\n/)
        .filter((line) => line && (!line.startsWith('#') || line.startsWith('#HttpOnly_')));

    return cookieLines
        .map((line) => ({
            httpOnly: line.startsWith('#HttpOnly_'),
            parts: line.replace(/^#HttpOnly_/, '').split('\t')
        }))
        .filter(({ parts }) => parts.length >= 7)
        .map(({ httpOnly, parts }) => {
            const [domain, , path, secure, expires, name, value] = parts;
            return {
                domain,
                path,
                secure: secure === 'TRUE',
                expires: Number(expires) > 0 ? Number(expires) : -1,
                name,
                value,
                httpOnly,
                sameSite: 'Lax'
            };
        });
};

const stripByteRangeQuery = (rawUrl) => {
    const parsedUrl = new URL(rawUrl);
    parsedUrl.searchParams.delete('bytestart');
    parsedUrl.searchParams.delete('byteend');
    return parsedUrl.toString();
};

const decodeMediaDescriptor = (rawUrl) => {
    try {
        const encodedPayload = new URL(rawUrl).searchParams.get('efg');
        if (!encodedPayload) {
            return null;
        }

        const decodedPayload = Buffer.from(encodedPayload, 'base64').toString('utf8');
        const descriptor = JSON.parse(decodedPayload);

        return {
            durationSeconds: Number(descriptor.duration_s) || 0,
            bitrate: Number(descriptor.bitrate) || 0,
            vencodeTag: descriptor.vencode_tag || '',
            xpvAssetId: descriptor.xpv_asset_id ? String(descriptor.xpv_asset_id) : null
        };
    } catch (_) {
        return null;
    }
};

const isAudioOnlyCandidate = (candidate) => {
    return candidate.vencodeTag.toLowerCase().includes('audio');
};

const selectBestVideoCandidate = (candidateMap) => {
    const groupedCandidates = new Map();

    for (const candidate of candidateMap.values()) {
        if (isAudioOnlyCandidate(candidate)) {
            continue;
        }

        const groupKey = candidate.xpvAssetId || candidate.url;
        const existingGroup = groupedCandidates.get(groupKey) || [];
        existingGroup.push(candidate);
        groupedCandidates.set(groupKey, existingGroup);
    }

    const rankedGroups = [...groupedCandidates.values()]
        .map((group) => ({
            firstSeen: Math.min(...group.map((candidate) => candidate.firstSeen)),
            bestCandidate: [...group].sort((left, right) =>
                right.size - left.size ||
                right.bitrate - left.bitrate ||
                right.durationSeconds - left.durationSeconds
            )[0]
        }))
        .sort((left, right) => left.firstSeen - right.firstSeen);

    return rankedGroups[0]?.bestCandidate || null;
};

const buildInstagramCaption = (url) => {
    return `🎥 *Instagram Reel*\n\n🔗 ${url}\n${FOOTER}`;
};

const getInstagramMedia = async (url) => {
    let browser;
    try {
        if (!process.env.INSTAGRAM_COOKIES_FILE) {
            throw new Error('Instagram login cookies are not configured.');
        }

        const cookiesFilePath = process.env.INSTAGRAM_COOKIES_FILE;
        const chromiumExecutablePath = getChromiumExecutablePath();
        browser = await chromium.launch({
            executablePath: chromiumExecutablePath,
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        const browserContext = await browser.newContext({
            userAgent: DEFAULT_USER_AGENT
        });

        await browserContext.addCookies(parseNetscapeCookies(cookiesFilePath));

        const page = await browserContext.newPage();
        const candidateMap = new Map();
        let responseIndex = 0;

        page.on('response', async (response) => {
            const responseUrl = response.url();
            if (!responseUrl.includes('.mp4')) {
                return;
            }

            const normalizedUrl = stripByteRangeQuery(responseUrl);
            const descriptor = decodeMediaDescriptor(responseUrl) || {};
            const contentLengthHeader = await response.headerValue('content-length').catch(() => null);
            const contentLength = Number(contentLengthHeader || 0);
            const existingCandidate = candidateMap.get(normalizedUrl);

            candidateMap.set(normalizedUrl, {
                url: normalizedUrl,
                size: Math.max(existingCandidate?.size || 0, contentLength),
                bitrate: descriptor.bitrate || existingCandidate?.bitrate || 0,
                durationSeconds: descriptor.durationSeconds || existingCandidate?.durationSeconds || 0,
                vencodeTag: descriptor.vencodeTag || existingCandidate?.vencodeTag || '',
                xpvAssetId: descriptor.xpvAssetId || existingCandidate?.xpvAssetId || null,
                firstSeen: existingCandidate?.firstSeen ?? responseIndex,
                status: response.status()
            });

            responseIndex += 1;
        });

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: NAVIGATION_TIMEOUT_MS
        });

        await page.waitForTimeout(MEDIA_DISCOVERY_WAIT_MS);

        const selectedCandidate = selectBestVideoCandidate(candidateMap);

        if (!selectedCandidate) {
            throw new Error('Instagram browser extraction did not find a playable video URL.');
        }

        return {
            type: 'video',
            url: selectedCandidate.url,
            description: buildInstagramCaption(url)
        };
    } catch (error) {
        const detail = error.message || 'Unknown error';
        console.error('[InstagramBrowser] Error:', detail);

        if (
            detail.includes('login cookies') ||
            detail.includes('did not find a playable video URL') ||
            detail.includes('Target page, context or browser has been closed')
        ) {
            throw new Error(
                '⚠️ اینستاگرام در حال حاضر برای دانلود این محتوا نیاز به لاگین دارد.\n' +
                'این مشکل از طرف اینستاگرام هست و ربطی به بات نداره.\n' +
                'لینک دیگه ای امتحان کنید یا کمی بعد دوباره تلاش کنید. 🔄'
            );
        }

        throw new Error('Failed to download media: Instagram browser extraction failed.');
    } finally {
        if (browser) {
            await browser.close().catch(() => {});
        }
    }
};

module.exports = {
    getInstagramMedia,
    _internal: {
        getChromiumExecutablePath,
        parseNetscapeCookies,
        stripByteRangeQuery,
        decodeMediaDescriptor,
        isAudioOnlyCandidate,
        selectBestVideoCandidate
    }
};
