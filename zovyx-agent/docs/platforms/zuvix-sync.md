# Zuvix Cloud Sync Platforms

Zuvix is shipped as one cloud-synced workspace with platform-specific shells.
The gateway stores and syncs app data through the configured cloud backend, while each OS client connects as a web or native node.

## Cloud Sync Model

- Cloud store: Supabase is the current cloud backend for auth and shared app data.
- Local runtime: the gateway still runs locally or on your server so tools, agents, and OS integrations stay close to the device.
- Device clients: web, macOS, iOS, and Android connect to the same gateway and cloud account.
- Dependency sync: run the workspace install once, then build only the platform you need.

## Dependency Sync

```bash
cd zuvix-agent
pnpm install
pnpm build
```

Use these platform commands after dependencies are synced:

| Platform | App surface | Command |
| --- | --- | --- |
| Windows | Web/PWA control app in Chromium/Edge | `pnpm --dir ui build` |
| Linux | Web/PWA control app in Chromium/Firefox | `pnpm --dir ui build` |
| macOS | Native menu bar companion | `swift build --package-path apps/macos` |
| iOS | Native iPhone/iPad node | `xcodegen generate --spec apps/ios/project.yml` then build in Xcode |
| Android | Native Android node | `pnpm android:assemble` |

Windows and Linux use the installable PWA from the Vite build. macOS, iOS, and Android have native projects under `apps/`.

## Release Checklist

- Update shared branding in `ui/public/manifest.webmanifest` and `ui/public/favicon.svg`.
- Update Android strings and launcher assets under `apps/android/app/src/main/res/`.
- Update Apple display names and permission copy in the app `Info.plist` files.
- Build the web UI first, then build native packages on the OS that owns the toolchain.
- Sign native releases with platform credentials before publishing.

## Current Targets

- Windows: installable browser app backed by the Zuvix cloud sync gateway.
- Linux: installable browser app backed by the Zuvix cloud sync gateway.
- macOS: native menu bar companion with gateway, chat, and OS integration.
- iOS: native mobile node for chat, voice, camera, and canvas surfaces.
- Android: native mobile node for chat, voice, camera, screen, and device commands.
