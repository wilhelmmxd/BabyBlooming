# BabyBlooming

BabyBlooming is a parenting and baby-tracking web app designed to help parents organize child profiles, daily logs, and important baby-related information in one place. The app uses a modern full-stack web development setup and can also be packaged into an Android app using Capacitor.

## Overview

BabyBlooming gives users a simple dashboard where they can manage child profiles and track important logs in real time. The goal of the app is to make baby care organization easier by keeping important information accessible, organized, and connected to the user’s account.

This project demonstrates frontend development, authentication, real-time database usage, responsive UI design, and mobile app packaging.

## Features

- User authentication with Firebase Auth
- Real-time database updates using Firestore
- Child profile management
- Parent-focused dashboard interface
- Log tracking connected to each user
- Responsive design for desktop and mobile
- Dark-themed user interface
- Firebase security rules for user-owned data
- Android app support through Capacitor

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Capacitor
- Vercel

## Project Structure

```txt
BabyBlooming/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
├── context/
│   ├── AuthProvider.tsx
│   ├── ChildrenProvider.tsx
│   └── LogsProvider.tsx
├── lib/
│   └── firebase.ts
├── public/
├── capacitor.config.ts
├── package.json
└── README.md
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Run the development server:

```bash
npm run dev
```

Open the app locally:

```txt
http://localhost:3000
```

## Firebase Setup

BabyBlooming uses Firebase Authentication and Cloud Firestore. Firebase Auth handles user accounts, while Firestore stores child profiles and user logs.

Example Firestore security rules:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    match /children/{childId} {
      allow read, write: if isOwner(resource.data.userId) || isOwner(request.resource.data.userId);
    }

    match /logs/{logId} {
      allow read, write: if isOwner(resource.data.userId) || isOwner(request.resource.data.userId);
    }
  }
}
```

## Android App Setup

BabyBlooming can be packaged as an Android app using Capacitor.

Build the project:

```bash
npm run build
```

Sync Capacitor:

```bash
npx cap sync android
```

Open the Android project:

```bash
npx cap open android
```

From Android Studio, the app can be tested on an emulator or a connected Android device.

## Deployment

BabyBlooming can be deployed using Vercel. The GitHub repository can be connected directly to Vercel for automatic deployments.

```bash
vercel
```

## What I Learned

While building BabyBlooming, I gained experience with creating a full-stack Next.js application, managing authentication with Firebase, storing real-time user data with Firestore, structuring global app state with context providers, protecting user data with security rules, designing responsive layouts with Tailwind CSS, deploying with Vercel, and preparing a web app for Android using Capacitor.

## Future Improvements

- Add feeding, diaper, sleep, and growth tracking
- Add charts and statistics for baby logs
- Add profile images for each child
- Improve mobile navigation
- Add push notifications
- Add offline support
- Add exportable parent reports
- Polish the Android app experience

## Contributors

This project was created by:

- Daniel Vega
- Will Stein
- Brendan Morriseey
- Dharati Thaker
- Farhana Rahman

## License

This project is for portfolio and educational purposes.
