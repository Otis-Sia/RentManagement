# Offline & Sync Capabilities

> **Note:** The offline/PWA features from the React frontend are no longer available in the Thymeleaf-based application.
> The system now uses server-side rendering, which requires a network connection.

## Current Architecture

The application is now a server-rendered web app using:
- **Micronaut** (Java) for backend logic and Thymeleaf template rendering
- **NGINX** for local network broadcasting
- Standard browser caching for performance

## Network Requirements

- An active network connection is required to use the application
- NGINX broadcasts the app to all devices on the local network (`http://192.168.100.242`)

## Legacy Reference

The original React frontend supported:
- Service worker-based caching
- Offline data queuing
- Auto-sync on reconnection
- PWA installation

These features were part of the `frontend/` directory which is being replaced.
