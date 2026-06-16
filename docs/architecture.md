# Zuvix Cross-Platform Architecture

## 1. Overview
Zuvix is transitioning to a **Bring-Your-Own-Key (BYOK) Cross-Platform AI App**. The app runs locally on the user's device but offers cloud-based synchronization for a seamless multi-device experience.

## 2. Core App Flow
*   **Onboarding**: Users open the app and instantly see the chat interface without mandatory setup screens.
*   **Authentication**: To send a message, the user is prompted to Sign In / Sign Up.
*   **Credentials Setup**: After authentication, a popup or Settings page requires the user to add their personal AI API credentials before they can interact with the AI.

## 3. Storage & Cloud Synchronization
*   **Local Execution**: The core AI processing and tool execution happen locally on the user's device.
*   **Cloud Sync (Paid Feature)**: Users can pay a small monthly subscription (e.g., $4-$5/month) to sync their setup across devices.
*   **Synced Data**:
    *   API Credentials (encrypted)
    *   AI Memory & Chat History
    *   Installed Tools Configurations (stored securely as `.env` formats or metadata)
*   **Infrastructure**: 
    *   **Appwrite / Supabase**: For Auth, Databases, and Real-time syncing.
    *   **Cloudflare R2**: Object storage for backups, files, and potentially the tool metadata.

## 4. Cross-Platform Strategy
The project is structured into platform-specific folders to ensure native-like experiences where necessary, while sharing core logic.
*   `/android` - Mobile Android App
*   `/ios` - Mobile iOS App
*   `/macos` - Desktop Mac App
*   `/windows` - Desktop Windows App
*   `/linux` - Desktop Linux App
*   `/web` - Web interface (Requires payment or self-hosting with internet access)

## 5. Tool Installation & Device Switching
When a user switches from one platform to another (e.g., Android to Windows) and clicks **"Sync"**:
1. The app fetches the user's tool metadata from the cloud.
2. It automatically reinstalls the necessary tools and provisions them with the synced `.env` configurations.
3. Chat memory and API keys are pulled down securely.

## 6. Monetization Model
*   **Local App**: Free (users bring their own API keys).
*   **Cloud Syncing**: ~$5/month subscription.
*   **Web App**: Paywalled completely or Self-Hosted.
*   **Cloud Hosting (Optional)**: A fully hosted Pay-As-You-Go model where Zuvix hosts the AI on cloud servers, and we take a commission.
