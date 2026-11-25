// Simmer & Serve — tuning, recipes, kitchen layout and palette.
// One clear job: every number the game balances on lives here.

export const VIEW = { width: 1280, height: 800 };
export const HUD_HEIGHT = 72;
export const BOARD_WIDTH = 192;
export const TILE = 64;
export const SHIFT_SECONDS = 180;
export const MAX_ORDERS = 4;
export const MAX_STRIKES = 3;

// Ingredient ids. A dish is a set of finished items; order matters not.
export const INGREDIENTS = {
  tomato: { name: 'Tomato', choppable: true, color: '#e5484d', dark: '#b3272e' },
  lettuce: { name: 'Lettuce', choppable: true, color: '#57b25e', dark: '#2f7d38' },
  onion: { name: 'Onion', choppable: true, color: '#b07fd4', dark: '#7d4fa3' },
  patty: { name: 'Patty', grillable: true, color: '#8a5a3b', dark: '#5f3a24' },
  cheese: { name: 'Cheese', color: '#f5b81e', dark: '#c78f0a' },
  bun: { name: 'Bun', color: '#e8b06a', dark: '#b97f35' },
};

// Recipes unlock as the shift heats up. `needs` lists finished items.
export const RECIPES = [
  {
    id: 'salad', name: 'Garden Salad', unlockAt: 0, base: 40,
    needs: ['tomato:chopped', 'lettuce:chopped'],
  },
  {
    id: 'burger', name: 'Classic Burger', unlockAt: 25, base: 60,
    needs: ['bun', 'patty:grilled', 'lettuce:chopped'],
  },
  {
    id: 'cheese-burger', name: 'Cheese Melt Burger', unlockAt: 60, base: 80,
    needs: ['bun', 'patty:grilled', 'cheese', 'tomato:chopped'],
  },
  {
    id: 'loaded', name: 'Fully Loaded', unlockAt: 100, base: 110,
    needs: ['bun', 'patty:grilled', 'cheese', 'lettuce:chopped', 'tomato:chopped', 'onion:chopped'],
  },
];

export const CHOP_SECONDS = 1.6;
export const GRILL_SECONDS = 4.0;
export const BURN_SECONDS = 4.5; // past done, before it burns
export const ORDER_FIRST_AT = 3;
export const ORDER_INTERVAL_START = 17;
export const ORDER_INTERVAL_END = 10;
export const PATIENCE_START = 85;
export const PATIENCE_END = 60;

// Stations. Counters run along the top wall (bins, chop, grill) and the
// bottom wall (assembly, serve, bin, plates); the order board is the left wall.
export const STATIONS = [
  { id: 'bin-tomato', kind: 'bin', stock: 'tomato', x: 192, y: 72, w: 96, h: 64, label: 'Tomato' },
  { id: 'bin-lettuce', kind: 'bin', stock: 'lettuce', x: 288, y: 72, w: 96, h: 64, label: 'Lettuce' },
  { id: 'bin-onion', kind: 'bin', stock: 'onion', x: 384, y: 72, w: 96, h: 64, label: 'Onion' },
  { id: 'bin-patty', kind: 'bin', stock: 'patty', x: 480, y: 72, w: 96, h: 64, label: 'Patty' },
  { id: 'bin-cheese', kind: 'bin', stock: 'cheese', x: 576, y: 72, w: 96, h: 64, label: 'Cheese' },
  { id: 'bin-bun', kind: 'bin', stock: 'bun', x: 672, y: 72, w: 96, h: 64, label: 'Bun' },
  { id: 'chop', kind: 'chop', x: 768, y: 72, w: 192, h: 64, label: 'Chop' },
  { id: 'grill', kind: 'grill', x: 960, y: 72, w: 192, h: 64, label: 'Grill' },
  { id: 'plates', kind: 'plates', x: 1152, y: 72, w: 128, h: 64, label: 'Plates' },
  { id: 'assembly', kind: 'assembly', x: 192, y: 736, w: 576, h: 64, label: 'Assemble' },
  { id: 'serve', kind: 'serve', x: 768, y: 736, w: 256, h: 64, label: 'Serve' },
  { id: 'trash', kind: 'trash', x: 1024, y: 736, w: 128, h: 64, label: 'Bin' },
  { id: 'plates-2', kind: 'plates', x: 1152, y: 736, w: 128, h: 64, label: 'Plates' },
];

export const FLOOR = { x: 192, y: 136, w: 1088, h: 600 };
export const CHEF_START = { x: 640, y: 440 };
export const CHEF_RADIUS = 24;
export const CHEF_SPEED = 265; // px per second

export const PALETTE = {
  wall: '#3d2b1f',
  floorA: '#c98f5f',
  floorB: '#bd8252',
  counterTop: '#8a5a3b',
  counterSide: '#6e4527',
  steel: '#b9c0c7',
  steelDark: '#8b939c',
  board: '#f3e3c2',
  boardEdge: '#d9c49a',
  ticket: '#fff7e0',
  ticketEdge: '#e0c98f',
  ink: '#2e2118',
  cream: '#fff3d6',
  red: '#e5484d',
  green: '#57b25e',
  gold: '#f5b81e',
};
