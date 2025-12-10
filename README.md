# LeftClick CLM - Lead Management Platform

Moderne Lead-Management-Plattform für IT-Dienstleister mit Next.js 15, Supabase und tRPC.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **API**: tRPC
- **State Management**: Zustand + TanStack Query
- **PDF Generation**: @react-pdf/renderer
- **Email**: Nodemailer

## Setup

1. Installiere Dependencies:
```bash
npm install
```

2. Erstelle `.env.local` Datei:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Starte Development Server:
```bash
npm run dev
```

## Projektstruktur

```
├── app/                    # Next.js App Router
├── components/             # React Komponenten
│   ├── ui/                # shadcn/ui Komponenten
│   └── ...
├── server/                 # tRPC Router & Server Logic
├── lib/                    # Utilities & Helpers
│   ├── supabase/          # Supabase Clients
│   └── trpc/              # tRPC Clients
└── ...
```

## Features

- ✅ Multi-Tenant Support
- ✅ Admin Dashboard mit Baukasten
- ✅ Lead-Magnete (E-Books, Checklisten, Kalkulatoren, Quizzes)
- ✅ Widget/API/iFrame Einbettung
- ✅ Branding-Anpassungen
- ✅ Tracking & Analytics
- ✅ E-Mail-Versand
- ✅ PDF-Generierung
- ✅ MFA & SSO (Microsoft 365)

## Deployment

Siehe [DEPLOY.md](./DEPLOY.md) für Coolify-Deployment-Anleitung.

