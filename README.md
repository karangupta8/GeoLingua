# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ed921c97-3fcb-4ed9-be49-e4f041f1238e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ed921c97-3fcb-4ed9-be49-e4f041f1238e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ed921c97-3fcb-4ed9-be49-e4f041f1238e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Technical Details

### Architecture Overview

**GeoLingua** is a React-based web application that visualizes global language distribution through interactive 3D maps and statistical dashboards.

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **3D Graphics**: React Three Fiber + Three.js + React Three Drei
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: React hooks + custom service layer
- **Data Format**: Static JSON with language and geographic data

### Data Pipeline

**Language Data Service**
- Language data is served from static JSON files in `/public/data/languages.json`
- `LanguageService` provides caching layer and API abstraction
- Data structure includes speaker counts, country distributions, and geographic coordinates
- Custom hooks (`useLanguages`) manage async data fetching and state

**3D Globe Integration**
- User language selections trigger real-time data filtering
- Geographic coordinates are mapped to 3D sphere positions using spherical coordinate conversion
- Country markers are dynamically positioned and colored based on language coverage intensity
- Language connection arcs are generated between countries sharing selected languages

**Visual Output System**
- Country intensity calculated from speaker percentages (0-100%)
- Color gradients represent language coverage: green (low) → yellow → red (high)
- Day/night textures simulate realistic Earth appearance with dynamic lighting
- Atmospheric glow and country borders enhance visual appeal
- Smooth animations and interactions provide responsive user experience

### Performance Optimizations

- Texture caching and memoization for 3D rendering
- Efficient re-rendering through React optimization patterns
- Level-of-detail scaling for country markers based on coverage
- Debounced user interactions to prevent excessive re-calculations
