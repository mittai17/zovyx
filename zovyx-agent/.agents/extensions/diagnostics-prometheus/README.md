# @zuvix/diagnostics-prometheus

Official Prometheus diagnostics exporter for Zuvix.

This plugin exposes Zuvix Gateway runtime metrics in Prometheus text format for Prometheus, Grafana, VictoriaMetrics, and compatible scrapers.

## Install

```bash
zuvix plugins install @zuvix/diagnostics-prometheus
```

Restart the Gateway after installing or updating the plugin.

## Configure

Enable the plugin and set the scrape endpoint options in `plugins.entries.diagnostics-prometheus.config`.

The full config surface, metric names, and scrape examples live in the docs:

- https://docs.zuvix.ai/gateway/prometheus

## Package

- Plugin id: `diagnostics-prometheus`
- Package: `@zuvix/diagnostics-prometheus`
- Minimum Zuvix host: `2026.4.25`
