# @zuvix/pixverse-provider

Official PixVerse video generation provider plugin for Zuvix.

This plugin registers PixVerse as a `video_generate` provider for text-to-video and image-to-video workflows.

## Install

```bash
zuvix plugins install @zuvix/pixverse-provider
```

Restart the Gateway after installing or updating the plugin.

## Configure

Store your PixVerse API key in Zuvix config or expose the supported environment variable to the Gateway. Then select PixVerse as a video generation provider.

Full setup and model/provider examples:

- https://docs.zuvix.ai/providers/pixverse

## Package

- Plugin id: `pixverse`
- Package: `@zuvix/pixverse-provider`
- Minimum Zuvix host: `2026.5.26`
