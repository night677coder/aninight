# 🎬 VoidAnime

> A modern, feature-rich anime streaming platform built with Next.js, showcasing advanced API integration and data mapping techniques.

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Development-yellow.svg)

**Made with ❤️ by [Rishab](https://github.com/voidborn) (VoidBorn)**

</div>

---

## ⚠️ Important Notice

> **This project is for educational and development purposes only.**
>
> - 🎓 **Educational Use**: Learn how to integrate multiple anime APIs and map data structures
> - 💻 **Development Reference**: Understand API integration patterns and best practices
> - ❌ **NOT for Commercial Use**: This project is not intended for commercial deployment or profit
> - 📚 **Learning Resource**: Use this as a reference to build your own projects
>
> **If you use this project or its code, please provide proper attribution to Rishab (VoidBorn).**

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [API Integration](#-api-integration)
- [Project Structure](#-project-structure)
- [Credits & Attribution](#-credits--attribution)
- [License](#-license)
- [Disclaimer](#-disclaimer)

---

## ✨ Features

- 🎥 **Multiple Anime Sources** - Seamlessly integrate with AniWatch, Gogoanime, Hianime, and AnimeParhe
- 🔐 **AniList Integration** - Sync your anime list with AniList OAuth
- 🎨 **Beautiful UI** - Modern, responsive design with smooth Framer Motion animations
- 📱 **Mobile Friendly** - Fully responsive on all devices
- 🔄 **Persistent Playback** - Resume watching from where you left off
- 🌙 **Dark Mode** - Eye-friendly dark theme by default
- ⚡ **Fast Performance** - Optimized streaming with HLS support
- 🎯 **Advanced Search** - Find anime with filters and sorting
- 📊 **User Tracking** - Keep track of watched anime with MongoDB
- 🎬 **Multiple Players** - ArtPlayer with Chromecast support
- � **API Mapaping** - Learn how to map and integrate multiple anime APIs
- 💾 **Redis Caching** - Optimized performance with intelligent caching

---

## 📸 Screenshots

<div align="center">

### 🏠 UI Preview
![Details 1](./public/preview/Screenshot%202025-11-16%20161845.png)
![Details 2](./public/preview/Screenshot%202025-11-16%20161853.png)
![Player 1](./public/preview/Screenshot%202025-11-16%20161909.png)
![Player 2](./public/preview/Screenshot%202025-11-16%20161920.png)
![Player 3](./public/preview/Screenshot%202025-11-16%20161930.png)
![Search 1](./public/preview/Screenshot%202025-11-16%20162158.png)
![Search 2](./public/preview/Screenshot%202025-11-16%20162208.png)
![Features 1](./public/preview/Screenshot%202025-11-16%20162506.png)
![Features 2](./public/preview/Screenshot%202025-11-16%20162525.png)
![Features 3](./public/preview/Screenshot%202025-11-16%20162543.png)
![Settings 1](./public/preview/Screenshot%202025-11-16%20162558.png)
![Settings 2](./public/preview/Screenshot%202025-11-16%20162612.png)
![Settings 3](./public/preview/Screenshot%202025-11-16%20162626.png)
![Settings 4](./public/preview/Screenshot%202025-11-16%20162646.png)
![Settings 5](./public/preview/Screenshot%202025-11-16%20162827.png)

</div>

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|---------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | NextAuth.js with AniList OAuth |
| **Video Player** | ArtPlayer, HLS.js, Vidstack |
| **State Management** | Zustand |
| **Caching** | Redis, IORedis |
| **Styling** | Tailwind CSS, Tailwind Animate |
| **Streaming** | HLS Protocol, M3U8 Proxy |
| **API Integration** | Axios, Fetch API |

</div>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **MongoDB** account (free tier available)
- **AniList** developer credentials
- **Git** for version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voidanime
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🔧 Environment Setup

### Step 1: AniList OAuth Configuration

Get your credentials from [AniList Developer Console](https://anilist.co/settings/developer)

```env
GRAPHQL_ENDPOINT=https://graphql.anilist.co
ANILIST_CLIENT_ID=your_client_id_here
ANILIST_CLIENT_SECRET=your_client_secret_here
```

**How to get AniList credentials:**
1. Visit https://anilist.co/settings/developer
2. Click "Create New Application"
3. Fill in the application details
4. Set redirect URL to: `https://your-domain.com/api/auth/callback/AniListProvider`
5. Copy your **Client ID** and **Client Secret**

### Step 2: NextAuth Configuration

```env
NEXTAUTH_SECRET=generate_a_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

### Step 3: Proxy & API Configuration

```env
NEXT_PUBLIC_PROXY_URI=http://localhost:3000
CONSUMET_URI=https://consumet-six-alpha.vercel.app
API_URI=https://yumaapi.vercel.app
```

### Step 4: Anime Sources

```env
# AnimeParhe Base URL - Configure your anime source
ANIMEPAHE_BASE_URL=https://animepahe.com

# M3U8 Proxy for HLS streaming (handles CORS)
VITE_PROXY_URL=https://m8u3.vercel.app/m3u8-proxy?url=
VITE_M3U8_PROXY_URL=https://m8u3.vercel.app/m3u8-proxy?url=
NEXT_PUBLIC_EXTERNAL_PROXY_URL=https://m8u3.vercel.app/m3u8-proxy?url=
```

### Step 5: Database Configuration

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**Setup MongoDB:**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with strong password
4. Get your connection string
5. Replace `username` and `password` with your credentials

### Step 6: Deployment URLs

```env
NEXT_PUBLIC_DEV_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCTION_URL=https://your-domain.com
```

---

## 📋 Complete .env.local Example

```env
# ============================================
# AniList OAuth Configuration
# ============================================
GRAPHQL_ENDPOINT=https://graphql.anilist.co
ANILIST_CLIENT_ID=your_client_id
ANILIST_CLIENT_SECRET=your_client_secret

# ============================================
# NextAuth Configuration
# ============================================
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# ============================================
# NextJS Configuration
# ============================================
NEXT_PUBLIC_PROXY_URI=http://localhost:3000
CONSUMET_URI=https://consumet-six-alpha.vercel.app

# ============================================
# Database Configuration
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# ============================================
# Deployment URLs
# ============================================
NEXT_PUBLIC_DEV_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCTION_URL=https://your-domain.com

# ============================================
# Anime Sources
# ============================================
ANIMEPAHE_BASE_URL=https://animepahe.com

# ============================================
# Proxy URLs (for HLS streaming)
# ============================================
VITE_PROXY_URL=https://m8u3.vercel.app/m3u8-proxy?url=
VITE_M3U8_PROXY_URL=https://m8u3.vercel.app/m3u8-proxy?url=
NEXT_PUBLIC_EXTERNAL_PROXY_URL=https://m8u3.vercel.app/m3u8-proxy?url=
API_URI=https://yumaapi.vercel.app
```

---

## 🔌 API Integration

This project demonstrates advanced API integration and data mapping techniques:

### Supported Anime Sources

| Source | Provider | Status | Features |
|--------|----------|--------|----------|
| **AniWatch** | Consumet | ✅ Active | Sub/Dub, Multiple Servers |
| **Gogoanime** | Consumet | ✅ Active | Sub/Dub, Fast Streaming |
| **Hianime** | Consumet | ✅ Active | Sub/Dub, HD Quality |
| **AnimeParhe** | AnimeParhe API | ✅ Active | Sub/Dub, Download Links |

### API Mapping Architecture

```
AniList (Anime Metadata)
    ↓
    ├─→ Consumet API (Multiple Sources)
    ├─→ AnimeParhe API (Specific Source)
    └─→ Anify API (Fallback)
         ↓
    Episode Data & Streaming URLs
         ↓
    M3U8 Proxy (CORS Handling)
         ↓
    ArtPlayer (Video Playback)
```

### Key Integration Points

- **AniList GraphQL**: Fetch anime metadata and user lists
- **Consumet API**: Get episodes and streaming sources
- **AnimeParhe API**: Alternative source with download support
- **M3U8 Proxy**: Handle CORS issues for HLS streams
- **MongoDB**: Store user progress and preferences

---

## 📁 Project Structure

```
voidanime/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── animepahe/          # AnimeParhe API routes
│   │   │   ├── anilist/            # AniList integration
│   │   │   ├── source/             # Episode source handler
│   │   │   └── ...
│   │   ├── anime/                  # Anime pages
│   │   ├── user/                   # User profile pages
│   │   └── ...
│   ├── components/                 # React components
│   ├── lib/
│   │   ├── animepahe.js           # AnimeParhe functions
│   │   ├── Anilistfunctions.js    # AniList integration
│   │   ├── kyomu.js               # Kyomu API integration
│   │   └── ...
│   ├── utils/                      # Utility functions
│   └── styles/                     # Global styles
├── public/
│   └── preview/                    # Screenshot previews
├── .env.example                    # Environment template
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## 🎓 Learning Resources

This project is designed to teach:

- ✅ **API Integration**: How to work with multiple anime APIs
- ✅ **Data Mapping**: Transform data from different sources into unified format
- ✅ **Authentication**: Implement OAuth with NextAuth.js
- ✅ **Streaming**: Handle HLS streams and CORS issues
- ✅ **Caching**: Optimize performance with Redis
- ✅ **Database Design**: MongoDB schema for user data
- ✅ **Next.js Best Practices**: API routes, middleware, SSR
- ✅ **React Patterns**: State management with Zustand, component composition

---

## 🏗️ Build & Deployment

### Build for Production

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker-compose up -d
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 👨‍💻 Credits & Attribution

### Created By

**Rishab** (VoidBorn)
- GitHub: [@voidbornfr](https://github.com/voidbornfr)
- Project: VoidAnime

### If You Use This Project

Please provide proper attribution:

```markdown
Built with [VoidAnime](https://github.com/voidbornfr/voidanime) by Rishab (VoidBorn)
```

Or in your code:

```javascript
// VoidAnime - API Integration Framework
// Created by Rishab (VoidBorn)
// Educational & Development Use Only
```

### Third-Party Services

- **AniList** - Anime metadata and user lists
- **Consumet API** - Anime streaming sources
- **AnimeParhe** - Anime source provider
- **MongoDB** - Database service
- **Vercel** - Deployment platform

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Rishab (VoidBorn)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## ⚠️ Disclaimer

### Educational Purpose Only

This project is created for **educational and development purposes only**. It demonstrates:
- How to integrate multiple APIs
- Data mapping and transformation techniques
- Building a streaming application architecture
- Best practices in Next.js and React

### Not for Commercial Use

- ❌ Do not use this project for commercial purposes
- ❌ Do not deploy this as a public streaming service
- ❌ Do not monetize content from this application
- ❌ Do not violate copyright laws

### Legal Notice

- Users are responsible for ensuring they have the right to stream content
- We do not host any content
- We are not responsible for any copyright infringement
- Respect the terms of service of all integrated APIs

### Content Rights

- All anime content belongs to their respective copyright holders
- This project only provides access to publicly available streaming sources
- Users must comply with local laws and regulations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

If you encounter any issues or have questions:

1. Check existing [Issues](https://github.com/voidbornfr/voidanime/issues)
2. Create a new issue with detailed description
3. Include error logs and environment details

---

## 🙏 Acknowledgments

- Thanks to all the anime API providers
- Thanks to the open-source community
- Thanks to everyone using and learning from this project

---

<div align="center">

### Made with ❤️ by Rishab (VoidBorn)

**Please give proper credit if you use this project**

⭐ If you find this helpful, please consider giving it a star!

---

**Last Updated:** November 16, 2025

</div>
