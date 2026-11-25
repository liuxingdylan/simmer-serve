# simmer-serve

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/liuxingdylan/simmer-serve/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/liuxingdylan/simmer-serve/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Simmer & Serve** — a tiny kitchen, a big dinner rush. A complete 3-minute cooking game that runs offline in a desktop browser from static files: no build step, no network requests, all art drawn on canvas and all sound synthesized with WebAudio.

You are the only cook on the line. Tickets land on the order board with a patience bar; grab ingredients from the pantry bins, chop them on the board, grill the patty (don't let it burn), build the dish on a plate, and serve it at the window before the customer walks out. Four recipes unlock as the shift heats up, orders arrive faster, and a combo multiplier rewards a clean service.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

WASD / arrows to move · E / Space / click to use a station · M mute · R restart.

## How it plays

- **Pantry bins** (top wall): tomato, lettuce, onion, patty, cheese, bun.
- **Chop board**: hold E to chop tomato, lettuce or onion.
- **Grill**: the patty cooks on its own — take it when the ring says READY, before it burns.
- **Plates + assembly counter**: build the dish on a plate, item by item.
- **Serve window**: only a plate that exactly matches a ticket goes out.
- **Bin**: toss burnt food and mistakes.
- **Scoring**: dish price + tip for patience left, times a combo multiplier. Three lost orders end the shift early.

## Files

- `game/index.html` + `game/style.css` — page shell
- `game/src/main.js` — boot and the game loop
- `game/src/config.js` — tuning, recipes, kitchen layout, palette
- `game/src/world.js` — stations, collision, items resting on stations
- `game/src/orders.js` — the order board, tickets, patience, scoring
- `game/src/chef.js` — movement, carrying, the interact action
- `game/src/cooking.js` — chopping and grilling in progress
- `game/src/render.js` — all canvas drawing (kitchen, board, HUD, chef, screens)
- `game/src/food.js` — drawn food: every ingredient in every state
- `game/src/audio.js` — synthesized effects and music (WebAudio, no files)
- `game/src/particles.js` — steam, crumbs, sparkles, floating scores
- `game/src/input.js` — keyboard and mouse
- `game/src/shots.js` — staged screenshot scenes (`?shot=cover|title|cook|serve`)
- `main.ts` — the make.fun entry program (copies `game/` + `screenshots/`, writes `dossier.json`)

Screenshots in `screenshots/` are real renders of the game's own code, staged through `?shot=` scenes that play the real rules forward into a mid-rush frame.

---

<sub>Entered on [make.fun](https://make.fun/?ref=zzj73w81&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
