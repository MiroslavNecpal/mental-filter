# Mental Filter PWA

Next.js 14 Progressive Web Application with TypeScript, Tailwind CSS, and comprehensive testing setup.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **PWA:** next-pwa
- **Testing:** Playwright (E2E)
- **Code Quality:** ESLint + Prettier

## 📱 PWA Features

- Standalone display mode optimized for iPhone
- Theme color: `#FDFCFA`
- Apple touch icon support
- Offline support with service worker
- Installable on iOS and Android devices

## 🛠️ Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
npm start
```

## 🧪 Testing

### E2E Tests with Playwright

```bash
# Run tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Show test report
npm run test:e2e:report
```

## 💅 Code Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint
```

## 🎨 PWA Icons

**Important:** Replace the placeholder icon files with actual PNG images:

- `/public/icon-192x192.png` - 192x192px icon
- `/public/icon-512x512.png` - 512x512px icon
- `/public/apple-touch-icon.png` - 180x180px icon for iOS

You can use tools like:

- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- Or create them manually with image editing software

## 📂 Project Structure

```
├── app/                # Next.js App Router pages
├── e2e/                # Playwright E2E tests
├── public/             # Static assets and PWA icons
├── next.config.mjs     # Next.js + PWA configuration
├── playwright.config.ts # Playwright configuration
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## 📝 Configuration Files

- `.eslintrc.json` - ESLint rules with Prettier integration
- `.prettierrc` - Prettier formatting rules
- `manifest.json` - PWA manifest for installability
- `playwright.config.ts` - E2E test configuration

## 🌐 PWA Testing

To test PWA features:

1. Build the production version: `npm run build`
2. Start the production server: `npm start`
3. Open in browser and check:
   - Chrome DevTools > Application > Manifest
   - Chrome DevTools > Application > Service Workers
   - Install prompt on supported devices

## 📱 iOS Testing

For iPhone PWA testing:

1. Deploy to a server with HTTPS
2. Open in Safari on iOS
3. Tap Share button → "Add to Home Screen"
4. Launch from home screen to see standalone mode

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)
- [Playwright Documentation](https://playwright.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🚀 Deploy

Deploy on [Vercel](https://vercel.com) (recommended for Next.js):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

PWA features work best with HTTPS in production.
