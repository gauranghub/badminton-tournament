# Turtlemint Badminton Tournament

A modern, immersive React UI for managing a one-day badminton doubles tournament — landing page, public spectator mode, admin dashboard, teams, group assignment, schedule, result entry, points table, and knockout bracket.

## Stack

- **React 18** with hooks
- **Vite** for dev server and build
- Plain CSS (custom design system, no Tailwind)
- Google Fonts: Space Grotesk · Inter · JetBrains Mono

## Quick start

```bash
npm install
npm run dev      # open http://localhost:5173
npm run build    # production build into ./dist
npm run preview  # preview the production build
```

## Project layout

```
src/
  main.jsx              # React entry
  App.jsx               # Shell, routing, top bar, sidebar nav, Tweaks panel
  styles.css            # Design tokens + component CSS
  data.js               # Mock teams, matches, activity
  components.jsx        # Icons, badges, avatars, stat cards, helpers
  tweaks.jsx            # Local tweaks panel + control primitives
  screens/
    LandingScreen.jsx
    LoginScreen.jsx
    DashboardScreen.jsx
    TeamsScreen.jsx
    SettingsScreen.jsx
    GroupsScreen.jsx
    SchedulerScreen.jsx
    ResultsScreen.jsx
    PointsScreen.jsx
    BracketScreen.jsx
    PublicScreen.jsx
```

## Notes

- Auth is a UX mock — clicking **Sign in** flips an `isAdmin` flag. Wire your real auth into `App.jsx` (see the `isAdmin` state + `onLogin` callback).
- The Tweaks panel persists to React state only in this standalone build (no host postMessage protocol). Wire it to your backend or `localStorage` if you want persistence.
- Tournament config (name, date, time, courts, third-place match toggle) lives in `App.jsx → TWEAKS_DEFAULT` and is editable from Settings + Tweaks panel.

## License

Internal project demo. Adapt freely.
