# Couple Holiday Season Surprise Program

A DIY template for a tiny, cosy "operating system" you give to your partner for the holiday season.
It boots up, shows a desktop, and new apps unlock on their own days: a countdown until you meet,
a birthday app with candles and a letter, a Christmas tree with a present, a New Year's Eve invitation,
an anniversary photo wall, a playlist and three mini games with prize coupons.

It runs locally on a Windows laptop: you build it into a zip, and the recipient double-clicks a `.bat`
file that serves it on their own computer. Nothing is hosted online, nothing needs installing on their
side, and everything (music included) works offline.

Stack: Vite, React 18, TypeScript, Tailwind CSS v4. No backend, no analytics, no network calls, no
environment variables.

Every name, message, photo, date and prize in this template is a placeholder. Fill them in with your own.

## Quick start (Windows)

You need [Node.js](https://nodejs.org) 18 or newer (LTS) on the computer you build on.

1. Double-click **`Test Run.bat`**. The first run installs packages, then it builds the site and opens it
   in your browser. Leave the black window open while testing; close it to stop.
2. Fill in your content (see the placeholder table below) and run `Test Run.bat` again to check it.
3. When it's ready, double-click **`Make Package.bat`** to make the gift zip (see Package and share).

While editing you can also use a live-reloading dev server:

```bash
npm install
npm run dev        # http://localhost:5173
```

### Try every app straight away

- `src/config/testing.ts`: set `UNLOCK_EVERYTHING = true` to open every app whatever the date.
  Set it back to `false` before you share the site.
- Date simulator: press the backtick key **`** on desktop, or tap the taskbar clock 5 times on mobile.
  The default password is `change-me` (see the table below for how to change it).

## Placeholders to fill in

All personal text lives in `src/content/`. Images live in `public/` and are referenced as `/photos/...`
or `/images/...`. Every image in the template is a placeholder SVG; replace it with a JPG, PNG, WebP or
SVG and update the path.

| File | Placeholder | What to enter |
| --- | --- | --- |
| `src/content/person.ts` | `THEIR_NAME = 'Their Name'` | The name or nickname of the person the site is for |
| `src/content/person.ts` | `MY_NAME = 'Your Name'` | Your name; used as the letter signature and on coupons |
| `src/content/person.ts` | `APP_NAME = 'YourProject.exe'` | The name of your "OS", shown on the boot screen and taskbar |
| `index.html` | `<title>YourProject.exe</title>` | Same name, for the browser tab |
| `package.json` | `"name": "your-project-name"` | A lowercase package name (optional) |
| `src/config/time.ts` | `UNLOCK_TZ = 'UTC'` | Your IANA time zone, e.g. `Europe/London`. Every unlock and theme uses it |
| `src/config/time.ts` | `THEME_DATES` (2026-12-10, 12-11, 12-25, 12-30) | Birthday, day after the birthday, Christmas, anniversary |
| `src/config/time.ts` | `REUNION_AT` (2026-12-20 18:00) | When you'll be together again: the countdown target |
| `src/apps/registry.ts` | `unlockAt` dates | Unlock day of each app (keep in line with `THEME_DATES`) |
| `src/apps/registry.ts` | `windowTitle: 'Time until we meet'` | Title of the Countdown window |
| `src/theme/themes.ts` | `dates: 'Dec 10'` etc. | The date labels shown in Settings for each theme |
| `src/dev/DateSimulator.tsx` | `PRESETS` | Quick-jump dates in the simulator (match your dates) |
| `src/config/devtools.ts` | `SIMULATOR_PASSWORD_SHA256` (password `change-me`) | SHA-256 of your own simulator password; the file shows the command |
| `src/content/countdown.ts` | `Your first countdown message` …, `/images/countdown-1.svg` | Rotating messages, optional image or GIF and its alt text |
| `src/content/birthday.ts` | `greeting`, `candleCount`, `Your gift tag text` | Headline, number of candles (1–30), gift tag text |
| `src/content/birthday.ts` | `Your birthday letter, first paragraph.` … | The birthday letter (paragraphs separated by `\n\n`), sign-off and PS |
| `src/content/birthday.ts` | `languageLabel: 'English'`, `translation` | The letter's language label, plus an optional second-language version and its label |
| `src/content/christmas.ts` | `Your Christmas greeting`, `Your gift tag text` | Greeting above the tree, gift tag |
| `src/content/christmas.ts` | `/photos/gift.svg`, `Describe your Christmas present here`, `Your message about the present here.` | Photo of the real present (use a file name that doesn't give it away), alt text, message |
| `src/content/anniversary.ts` | `Your intro line here`, `Your bouquet button label`, `Your anniversary message here.` | Text for the anniversary app |
| `src/content/anniversary.ts` | `/photos/bouquet.svg`, `/photos/anniversary-message.svg` | Bouquet button picture (transparent PNG works best) and the picture above the message |
| `src/content/memories.ts` | `Caption for memory 1` …, `/photos/1.svg` … | Your photo wall: one entry per photo with caption, date and alt text |
| `src/content/newyear.ts` | `Your invitation intro here.`, `Dress code: ...`, `Your Happy New Year message here.` | The New Year's Eve invitation |
| `src/content/newyear.ts` | `Restaurant Name`, `123 Example Street, City`, `Dessert Place Name` … | The plan for the night: times, venues, addresses, notes |
| `src/content/playlist.ts` | `Song Title 1`, `Artist Name` | Your songs. Put MP3s in `public/music/` and add `audio: '/music/file.mp3'` |
| `src/content/games.ts` | `Ball 1 name` …, `/images/merge/1.svg` … | The five photo balls in the merge game, smallest first |
| `src/content/games.ts` | `/photos/puzzle.svg`, `Describe your puzzle photo here` | The jigsaw photo (cropped to a centred square) |
| `src/content/games.ts` | `Your first question?`, `Option A` … | Quiz questions, answers and optional reveals |
| `src/content/games.ts` | `Your Quiz Prize`, `Your Puzzle Prize`, `Your Jar Prize`, `Your first coupon term.` … | The prize coupons for each game |
| `src/content/games.ts` | `GAME_UNLOCKS` (2026-12-14, 12-19, 12-26) | When each mini game opens |
| `src/content/system.ts` | Boot lines, fake settings | Optional: the boot text and joke settings |
| `share-tools/*`, `Make Package.bat`, `Test Run.bat`, `.gitignore` | `YourProject` | Your project name in the Windows launcher and zip name |

Tips:

- Resize photos to about 1600px on the long edge so the site stays quick on a phone.
- A missing image shows a soft 📷 frame instead of a broken image, so you can fill things in gradually.
- Progress (lit ornaments, quiz prizes, best scores) is saved in the browser's `localStorage`. To test from
  scratch, use a private window or the "clear progress" button in the date simulator.

## How the dates work

All "is it unlocked yet?" and theme decisions use one time zone, `UNLOCK_TZ` in `src/config/time.ts`.
With the template defaults:

| Date | Theme | Unlocks |
| --- | --- | --- |
| before Dec 1 | Cosy December | Playlist, Countdown, Settings, NYE.exe (always open) |
| Dec 1 | Cosy December | Mini Games (each game opens on its `GAME_UNLOCKS` date) |
| Dec 10 | Birthday | Birthday.exe |
| Dec 11 – Dec 20, 6:00 pm | Missing You | |
| from `REUNION_AT` | Together Mode | Countdown switches to "LongDistance.exe has stopped running" |
| Dec 25 | Christmas | Christmas.exe |
| Dec 30 onward | Anniversary | Anniversary.exe |

## Package and share

Before packaging: set `UNLOCK_EVERYTHING` to `false` and change the simulator password.

Double-click **`Make Package.bat`**. It builds the site and writes `YourProject.zip` to the project folder,
containing:

- `site/`: the built site
- `Start YourProject.bat`: the launcher the recipient double-clicks
- `server.ps1`: a tiny PowerShell web server the launcher runs (localhost only, ports 4173–4193)
- `READ ME FIRST.txt`: instructions for the recipient

Give them the zip (USB stick, email, cloud drive). They extract it, double-click `Start YourProject.bat`,
and the site opens in their browser. If Windows SmartScreen warns about it, they click "More info" then
"Run anyway". Their progress is saved in that browser, so they should keep using the same one.
The recipient needs Windows but not Node.js.

## Project map

```
src/
  content/              ALL personal text and data (start here)
  config/               time zone and dates, test switch, simulator password
  apps/                 the apps and their registry (unlock dates)
  date/                 useAppDate(): the only source of "now"
  theme/                theme selection
  desktop/, windows/    desktop shell and window manager
  audio/                shared music player
  dev/                  date simulator
public/
  photos/, images/      your pictures (placeholders included)
  music/                your MP3s
```

## License

MIT, see `LICENSE`.
