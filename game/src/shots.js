// Screenshot scenes for ?shot=cover|title|cook|serve. Each one stages a real,
// reachable game state through the game's own functions — spawn tickets,
// place items on stations, hand the chef something to carry — then freezes
// the loop, so the frame is what a short game really looks like.

import { RECIPES } from './config.js';
import { makeItem } from './world.js';

function ticketFor(recipeId, patience) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  return { id: 0, recipe, patience, maxPatience: patience, bornAt: 0 };
}

function layTickets(board, specs) {
  board.tickets = specs.map(([id, patience], i) => {
    const t = ticketFor(id, patience);
    t.id = 101 + i;
    return t;
  });
}

/**
 * Stage the named scene on a fresh game and return the screen to draw.
 * The game loop freezes after staging, so the screenshot is stable.
 */
export function stageShot(name, game) {
  const { world, board, chef, particles } = game;
  game.screen = 'play';
  game.strikes = 0;
  game.message = null;
  game.frozen = true;
  board.reset();
  chef.reset();
  particles.clear();
  for (const s of world.stations) {
    s.item = null;
    s.progress = 0;
    s.burn = 0;
    s.plate = null;
  }

  if (name === 'title') {
    board.elapsed = 12;
    layTickets(board, [['salad', 72], ['burger', 48]]);
    world.byId.get('grill').item = makeItem('patty', 'raw');
    world.byId.get('grill').progress = 0.55;
    world.byId.get('chop').item = makeItem('tomato', 'raw');
    world.byId.get('chop').progress = 0.4;
    chef.x = 640;
    chef.y = 430;
    game.screen = 'title';
    game.best = 480;
    return;
  }

  if (name === 'cook') {
    board.elapsed = 42;
    board.score = 180;
    board.served = 3;
    layTickets(board, [['burger', 52], ['cheese-burger', 66]]);
    const grill = world.byId.get('grill');
    grill.item = makeItem('patty', 'raw');
    grill.progress = 0.55;
    const chop = world.byId.get('chop');
    chop.item = makeItem('tomato', 'raw');
    chop.progress = 0.5;
    chef.x = 1056;
    chef.y = 210;
    chef.facing = 1;
    chef.chopAnim = 0.3;
    for (let i = 0; i < 6; i += 1) particles.steam(1056, 110);
    return;
  }

  if (name === 'serve') {
    board.elapsed = 74;
    board.score = 320;
    board.served = 5;
    board.combo = 3;
    board.bestCombo = 3;
    layTickets(board, [['cheese-burger', 58], ['salad', 40]]);
    world.byId.get('assembly').plate = ['bun', 'patty:grilled', 'lettuce:chopped'];
    chef.x = 880;
    chef.y = 690;
    chef.facing = 1;
    particles.confetti(896, 700);
    particles.floatText(896, 640, '+120  COMBO ×3', '#ffd94a');
    particles.floatText(640, 300, 'SERVED!', '#fff3d6');
    return;
  }

  // 'cover' (default): the full dinner rush in one frame.
  board.elapsed = 93;
  board.score = 245;
  board.served = 4;
  board.combo = 2;
  board.bestCombo = 2;
  layTickets(board, [['salad', 58], ['burger', 34], ['cheese-burger', 71]]);
  const grill = world.byId.get('grill');
  grill.item = makeItem('patty', 'raw');
  grill.progress = 0.7;
  const chop = world.byId.get('chop');
  chop.item = makeItem('onion', 'chopped');
  world.byId.get('assembly').plate = ['bun', 'patty:grilled', 'lettuce:chopped'];
  chef.x = 640;
  chef.y = 640;
  chef.facing = 1;
  chef.carry = { plate: true, items: ['tomato:chopped', 'lettuce:chopped'] };
  for (let i = 0; i < 5; i += 1) particles.steam(1056, 110);
}
