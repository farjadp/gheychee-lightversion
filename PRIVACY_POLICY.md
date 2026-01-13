# No Storage Policy
**(Data Minimization Policy)**

## 1. Core Principle
The bot is designed to avoid permanent storage of user content.
Data is processed only to the extent technically required to fulfill a single request.

## 2. What Is NOT Stored
The bot does not permanently store:
*   Video files
*   Copies of extracted media
*   User media libraries
*   Download history or archives
*   Reusable content databases

## 3. Temporary Processing
For operational purposes, the following may exist temporarily:
*   Submitted URLs (per request)
*   Temporary video files created during processing

Temporary files are deleted immediately after:
*   Successful delivery, or
*   Operation failure

## 4. Operational Logs (Minimal)
Minimal logs may be collected strictly for reliability and abuse prevention:
*   Timestamp
*   Telegram user ID or chat ID
*   Detected platform (Instagram / X)
*   Operation status (success / failure)
*   Error messages
*   Internal job identifiers

Media files and media content are never included in logs.

## 5. Retention Period
*   Operational logs are retained for a maximum of 14 days
*   Logs are periodically deleted

Extending retention increases risk and should only be done intentionally.

## 6. Third-Party Infrastructure
The bot operates on third-party infrastructure where data may pass transiently:
*   Telegram
*   Cloud hosting providers (e.g. Google Cloud Run)
*   Network services

Ashavid does not control third-party internal policies but enforces a no-storage policy at the application level.

## 7. User Requests
Authorized users may request:
*   Review of retained operational logs
*   Deletion or anonymization where feasible and lawful

## 8. Security Exceptions
In cases of suspected abuse, attacks, or system integrity threats:
*   Additional technical data may be temporarily retained
*   Solely for investigation and protection purposes
