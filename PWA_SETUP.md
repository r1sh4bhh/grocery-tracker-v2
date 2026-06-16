# PWA Setup for Grocery Tracker

## What's been configured:

### 1. **next-pwa Integration**
- `next.config.ts` with PWA plugin
- Runtime caching for fonts, CDN, and images
- Auto-generated service worker

### 2. **Service Worker**
- `public/sw.js` - Custom service worker with:
  - Cache-first strategy for assets
  - Network-first for HTML
  - Offline fallback page
  - Auto-update on app refresh

### 3. **Manifest & Icons**
- `public/manifest.json` - Full PWA manifest with:
  - App shortcuts (Add Purchase, View Reports)
  - Screenshots for app stores
  - Maskable icons for adaptive display
- `public/browserconfig.xml` - Windows tile config

### 4. **Install Prompt**
- `components/PWAInstall.tsx` - Native install popup
- Shows automatically on supported browsers
- Dismissible until next session

### 5. **Offline Support**
- `lib/pwa-utils.ts` - Utilities for:
  - Sync queue for offline actions
  - Online/offline detection
  - Periodic sync registration
- `components/layout/OnlineIndicator.tsx` - Shows offline banner
- `public/offline.html` - Fallback page

### 6. **Root Layout Updates**
- Service worker registration script
- Apple web app metadata
- Mobile web app capabilities

## Installation Steps:

```bash
# 1. Install next-pwa
npm install next-pwa

# 2. Add icons to public/
# Create these with a design tool or online generator:
# - icon-192.png (192x192)
# - icon-192-maskable.png (192x192 with safe zone)
# - icon-512.png (512x512)
# - icon-512-maskable.png (512x512 with safe zone)
# - screenshot-narrow.png (540x720)
# - screenshot-wide.png (1280x720)

# 3. Build the app
npm run build

# 4. Run locally to test PWA
npm run dev
# Then open in Chrome DevTools > Application > Service Workers
```

## Testing PWA Locally:

```bash
# Build for production
npm run build

# Serve locally (requires HTTPS simulation)
npm run start

# Or use ngrok for HTTPS tunnel:
# npx ngrok http 3000
# Test on actual mobile device via the HTTPS URL
```

## Features Available:

✅ **Install to Home Screen** - Works on iOS, Android, Desktop
✅ **Offline Support** - Full app works without internet
✅ **Background Sync** - Queue purchases when offline, auto-sync online
✅ **App Shortcuts** - Quick access to key features
✅ **Standalone Mode** - Fullscreen app without browser UI
✅ **Theme Color** - Matches brand color (#10b981)

## Production Deployment:

1. Ensure HTTPS is enabled on your hosting
2. Place icons in `public/` folder
3. Build once: `npm run build`
4. Deploy the `.next` folder + `public/` folder
5. Verify manifest.json is served correctly

## Lighthouse PWA Score:

After proper icon setup and HTTPS, you should get 90+ PWA score.

## Mobile App Store (Optional):

Once PWA is complete, you can publish to:
- **Google Play** via PWA Builder
- **Microsoft Store** via PWA Builder
- **App Store** via wrapper tools (TestFlight/PWA wrapper)
