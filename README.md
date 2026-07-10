# Friend Page 💜

A premium, single-friend, dark-glass website. Pure HTML/CSS/JS, no build step, ready for GitHub Pages.

## How the login works

There's no separate password field. The login page asks you to **enter your best friend's name**.
If the name typed matches `sufyan` (not case-sensitive), the site unlocks.

To change the unlock name, open `script.js` and edit the top lines:

```js
const SPECIAL_NAME = 'sufyan';   // the name that unlocks the site
const DISPLAY_NAME = 'Ayesha';   // whose fan page this is
```

On success a **"Welcome, Ayesha ✨" modal** appears (with confetti), then it moves on to
`welcome.html`. On success the site stores `friendsite_loggedIn` and `friendsite_username`
in `localStorage`. Opening `welcome.html` or `friend.html` directly without logging in
bounces you back to `index.html`. **Logout** clears both keys.

## The greeting page (welcome.html)

- Types out "Would you like to know yourself?" letter by letter.
- **Yes** is clickable; **No** dodges the cursor/tap — it's not meant to ever be caught.
- Clicking **Yes** builds up a 15-line box of compliments about Ayesha, one line at a time
  with a typewriter effect. Edit these in the `SELF_PRAISES` array in `script.js`.
- Once all 15 lines finish typing, a **Next** button appears and leads into `friend.html`.

## The fan page (friend.html)

Built as a **step-by-step flow** — one section per "page" — rather than a long scroll.
Dots at the top show progress; **Back** / **Next** at the bottom move between steps:

1. Superpowers
2. Inside Jokes & Memes
3. Today's Mood Forecast
4. Compliment Generator
5. Friendship Timeline
6. Fun Quiz
7. Memory Wall
8. Closing note (Next here restarts from step 1 with a confetti burst)

## File structure

```
index.html      → login (enter your best friend's name)
welcome.html    → typing greeting screen
friend.html     → the actual fan page (all sections)
style.css       → design system + every component
script.js       → auth, particles, compliments, quiz, memory wall, etc.
assets/
  images/       → drop any photos here
  stickers/     → drop custom sticker PNG/SVGs here (site already ships
                   with lightweight inline SVG stickers, so this is optional)
  music/        → drop an .mp3 here and point #bg-music's src at it in
                   welcome.html / friend.html to enable the mute/unmute button
```

## Deploying to GitHub Pages

1. Push this folder to a repo.
2. Repo → Settings → Pages → Deploy from branch → `main` / root.
3. Done — `index.html` is picked up automatically as the entry point.

## Customizing

- **Compliments**: edit the `COMPLIMENTS` array in `script.js`.
- **Quiz**: edit the `QUIZ` array in `script.js`.
- **Memory wall notes**: edit the `MEMORY_WALL` array in `script.js`.
- **Colors/fonts**: everything is a CSS variable at the top of `style.css` under `:root`.
