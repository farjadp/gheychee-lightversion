# How to Use Gheychee Bot

## For Users

1.  **Start the Bot**:
    Find the bot in Telegram and tap **Start**.

2.  **Send a Link**:
    Copy a link from Instagram (Reels/Post) or X (Twitter).
    - Example X: `https://x.com/user/status/123456...`
    - Example Insta: `https://instagram.com/reel/abcde...`

3.  **Wait for Processing**:
    The bot will display "Typing..." (or Uploading Video).
    - **Note**: Video processing takes 3-10 seconds depending on the file size.

4.  **Download**:
    The video will appear directly in the chat. You can save it to your gallery.

## Troubleshooting

-   **"No media found"**: The account might be private. The bot can only download public videos.
-   **"Error processing"**: The link might be invalid or deleted.
-   **Slow Response**: Large videos takes time to download to the server and re-upload to Telegram.

## Support
For issues, contact the developer or open an issue on GitHub.

---

## 🛡️ For Admins: Accessing Logs

### 1. Telegram Alerts (Instant)
You will receive an **immediate message** in your Telegram Admin Chat if:
*   Users face "Login Required" errors.
*   The bot gets "Rate Limited" (429).
*   The server crashes or times out.

### 2. Daily Report (08:00 AM)
Every morning, the bot sends a summary:
*   **Total Requests**: Usage count.
*   **Success/Fail**: Health check.
*   **Platform Stats**: IG vs Twitter popularity.

### 3. Google Cloud Logs (Full Debug)
For deep debugging (seeing every single request), visit the Google Cloud Console:

👉 **[View Live Logs](https://console.cloud.google.com/run/detail/europe-west1/gheychee-lightversion/logs?project=gheychee-lightversion)**

*(Select "Logs" tab -> "Log Explorer" for advanced filtering)*
