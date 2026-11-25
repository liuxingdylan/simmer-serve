// Boot and the game loop: title → play → game over, plus ?shot= staging.
// One clear job: wire input, world, orders, cooking, audio and rendering.

import { VIEW, SHIFT_SECONDS, MAX_STRIKES } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createParticles } from './particles.js';
import { createWorld } from './world.js';
import { createOrderBoard } from './orders.js';
import { createChef } from './chef.js';
import { createCooking, } from './cooking.js';
import { drawGame } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '1') || 1;

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;
const ctx = canvas.getContext('2d');

const input = createInput(canvas);
const audio = createAudio();
const particles = createParticles();
const world = createWorld();
const board = createOrderBoard(seed);
const chef = createChef();
const cooking = createCooking();

const game = {
  world,
  board,
  chef,
  particles,
  screen: 'title',
  timeLeft: SHIFT_SECONDS,
  strikes: 0,
  muted: false,
  best: 0,
  message: null,
  messageLife: 0,
  nearStation: null,
  frozen: false,
  clickTarget: null,
};

try {
  game.best = Number(window.localStorage.getItem('simmer-serve-best') || '0') || 0;
} catch {
  game.best = 0;
}

function saveBest() {
  try {
    window.localStorage.setItem('simmer-serve-best', String(game.best));
  } catch {
    // storage unavailable (private mode, hosted sandbox): best score is session-only
  }
}

function showMessage(text, seconds = 2.2) {
  game.message = text;
  game.messageLife = seconds;
}

function endShift(reason) {
  game.screen = 'over';
  audio.stopMusic();
  audio.stopSizzle();
  if (board.score > game.best) {
    game.best = board.score;
    saveBest();
  }
  if (reason === 'strikes') showMessage('Too many orders lost!');
}

function startShift() {
  board.reset(seed);
  chef.reset();
  particles.clear();
  for (const s of world.stations) {
    s.item = null;
    s.progress = 0;
    s.burn = 0;
    s.plate = null;
  }
  game.screen = 'play';
  game.timeLeft = SHIFT_SECONDS;
  game.strikes = 0;
  game.message = null;
  audio.unlock();
  audio.startMusic();
}

function handleInteractResult(result, station) {
  switch (result) {
    case 'pickup': audio.pickup(); break;
    case 'place': audio.place(); break;
    case 'trash': audio.place(); showMessage('Tossed it.'); break;
    case 'served': break; // served() below plays the fanfare
    case 'hands-full': audio.error(); showMessage('Hands full — serve or bin something first.'); break;
    case 'wrong-item': audio.error(); showMessage('That station can’t take this.'); break;
    case 'need-plate': audio.error(); showMessage('You need a plate for that.'); break;
    case 'no-match': audio.error(); showMessage('No ticket matches this plate yet.'); break;
    default: break;
  }
  if (station && (result === 'pickup' || result === 'place')) {
    particles.crumbs(station.x + station.w / 2, station.y + station.h / 2, '#fff3d6');
  }
}

const boardEvents = {
  expired(ticket) {
    game.strikes += 1;
    audio.expire();
    showMessage(`Order #${ticket.id} walked out — strike ${game.strikes}/${MAX_STRIKES}`);
    if (game.strikes >= MAX_STRIKES) endShift('strikes');
  },
  served(ticket, points, combo) {
    audio.serve();
    particles.sparkle(896, 700);
    particles.confetti(896, 700);
    particles.floatText(896, 640, `+${points}`, '#ffd94a');
    if (combo >= 3) particles.floatText(640, 300, `COMBO ×${combo}!`, '#ffd94a');
    showMessage(`${ticket.recipe.name} served! +${points}`);
  },
};

const worldEvents = {
  grillDone(station) {
    audio.grillDone();
    particles.floatText(station.x + station.w / 2, station.y - 24, 'READY!', '#ffd94a');
  },
  burnt(station) {
    audio.error();
    showMessage('The patty burnt! Bin it and start over.');
    particles.steam(station.x + station.w / 2, station.y);
  },
};

const cookingEvents = {
  chopTick(station) {
    audio.chop();
    particles.crumbs(station.x + station.w / 2, station.y + station.h / 2, '#57b25e');
  },
  chopDone(station) {
    audio.chopDone();
    particles.floatText(station.x + station.w / 2, station.y - 24, 'Chopped!', '#fff3d6');
  },
};

function update(dt) {
  if (game.screen !== 'play' || game.frozen) return;

  game.timeLeft = Math.max(0, SHIFT_SECONDS - board.elapsed);
  if (board.elapsed >= SHIFT_SECONDS) {
    endShift('time');
    return;
  }

  // Movement: keyboard wins; a click sets a walk target.
  let axis = input.axis();
  const click = input.consumeClick();
  if (click) {
    const station = world.stationAtPoint(click.x, click.y);
    if (station) {
      game.clickTarget = {
        x: Math.max(192 + 24, Math.min(1256, station.x + station.w / 2)),
        y: station.y < 400 ? station.y + station.h + 40 : station.y - 40,
      };
    } else {
      game.clickTarget = click;
    }
    audio.unlock();
  }
  if (axis.x === 0 && axis.y === 0 && game.clickTarget) {
    const dx = game.clickTarget.x - chef.x;
    const dy = game.clickTarget.y - chef.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 12) {
      game.clickTarget = null;
    } else {
      axis = { x: dx / dist, y: dy / dist };
    }
  } else if (axis.x !== 0 || axis.y !== 0) {
    game.clickTarget = null;
  }
  chef.move(dt, axis, world);

  game.nearStation = world.nearestStation(chef.x, chef.y);

  // Interact: E / Space press, or clicking the station in front of us.
  const pressedInteract = input.consumePress('e') || input.consumePress('space');
  if (pressedInteract && game.nearStation) {
    const result = chef.interact(game.nearStation, {
      findOrder: (keys) => board.matchingTicket(keys),
      serve: (ticket) => board.serveTicket(ticket, boardEvents),
    });
    handleInteractResult(result, game.nearStation);
  }
  // Hold-to-chop while the key (or mouse) is held near the board.
  if (input.interactHeld()) {
    cooking.chopHeld(dt, game.nearStation, chef, cookingEvents);
  } else {
    chef.chopAnim = 0;
  }

  board.update(dt, boardEvents);
  world.update(dt, worldEvents);
  particles.update(dt);

  if (world.isGrilling()) audio.startSizzle();
  else audio.stopSizzle();

  if (game.message) {
    game.messageLife -= dt / 2.2;
    if (game.messageLife <= 0) game.message = null;
  }

  // Low-patience warning tick.
  const urgent = board.tickets.some((t) => t.patience < 10 && Math.floor(t.patience * 2) !== Math.floor((t.patience + dt) * 2));
  if (urgent) audio.tick();
}

function frame(now) {
  const dt = Math.min(0.05, (now - (frame.last ?? now)) / 1000 || 0);
  frame.last = now;
  if (input.consumePress('enter') && game.screen === 'title') startShift();
  if (input.consumePress('r') && (game.screen === 'over' || game.screen === 'play')) startShift();
  if (input.consumePress('m')) game.muted = audio.toggleMute();
  update(dt);
  drawGame(ctx, game);
  input.endFrame();
  window.requestAnimationFrame(frame);
}

if (shotName) {
  document.body.classList.add('shot');
  stageShot(shotName, game);
  game.timeLeft = Math.max(0, SHIFT_SECONDS - board.elapsed);
} else {
  // A living kitchen behind the title screen.
  board.spawnTicket();
  world.byId.get('grill').item = { id: 'patty', state: 'raw' };
  world.byId.get('grill').progress = 0.4;
}

window.requestAnimationFrame(frame);
window.__game = game;
