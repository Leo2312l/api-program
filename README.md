# Word of the Day + Dictionary App — Fixed

Simple HTML/CSS/JavaScript dictionary project.

## API
Uses the Free Dictionary API:
https://dictionaryapi.dev/

No API key is required.

## Improvements in this version
- 10-second API timeout
- Better API error handling
- Works with GitHub Pages
- Random Word button
- Built-in offline fallback for common words
- Safe HTML rendering
- Pronunciation audio when the API provides it
- Does not show a blank page when the API is temporarily unavailable

## Run
Open `index.html`, or use a simple local server.

For GitHub Pages, upload:
- index.html
- style.css
- script.js

Then enable GitHub Pages in repository Settings → Pages.

## Important
For arbitrary words, the online dictionary API must be reachable from the browser. If the API is temporarily blocked/unavailable on your network, the built-in fallback still provides definitions for the included common words.
