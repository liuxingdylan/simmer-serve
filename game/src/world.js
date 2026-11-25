// The kitchen itself: station rectangles, collision, and the items that sit
// on stations (a chopping tomato, a grilling patty, a plate being built).
// An item is { id, state } where state is raw | chopped | grilled | burnt.

import { STATIONS, FLOOR, CHOP_SECONDS, GRILL_SECONDS, BURN_SECONDS } from './config.js';

export function makeItem(id, state = 'raw') {
  return { id, state };
}

export function itemKey(item) {
  return item.state === 'raw' ? item.id : `${item.id}:${item.state}`;
}

export function createWorld() {
  const stations = STATIONS.map((s) => ({
    ...s,
    item: null, // item resting on this station (chop / grill / assembly plate)
    progress: 0, // chop progress 0..1, or grill doneness 0..1
    burn: 0, // grill overcook 0..1 once done
    plate: null, // assembly station only: array of item keys on the plate
  }));
  const byId = new Map(stations.map((s) => [s.id, s]));

  return {
    stations,
    byId,
    stationAtPoint(x, y) {
      return stations.find((s) => x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h) ?? null;
    },
    // The station whose front edge the chef stands nearest to, within reach.
    nearestStation(chefX, chefY) {
      let best = null;
      let bestDist = 78;
      for (const s of stations) {
        const cx = Math.max(s.x, Math.min(chefX, s.x + s.w));
        const cy = Math.max(s.y, Math.min(chefY, s.y + s.h));
        const d = Math.hypot(chefX - cx, chefY - cy);
        if (d < bestDist) { best = s; bestDist = d; }
      }
      return best;
    },
    isGrilling() {
      return stations.some((s) => s.kind === 'grill' && s.item);
    },
    update(dt, events) {
      for (const s of stations) {
        if (s.kind === 'grill' && s.item && s.item.state !== 'burnt') {
          if (s.progress < 1) {
            s.progress = Math.min(1, s.progress + dt / GRILL_SECONDS);
            if (s.progress >= 1) {
              s.item.state = 'grilled';
              events.grillDone?.(s);
            }
          } else {
            s.burn = Math.min(1, s.burn + dt / BURN_SECONDS);
            if (s.burn >= 1) {
              s.item.state = 'burnt';
              events.burnt?.(s);
            }
          }
        }
      }
    },
    // Keep the chef inside the floor and out of the counters.
    clampChef(x, y, radius) {
      let nx = Math.max(FLOOR.x + radius, Math.min(FLOOR.x + FLOOR.w - radius, x));
      let ny = Math.max(FLOOR.y + radius, Math.min(FLOOR.y + FLOOR.h - radius, y));
      for (const s of stations) {
        const cx = Math.max(s.x, Math.min(nx, s.x + s.w));
        const cy = Math.max(s.y, Math.min(ny, s.y + s.h));
        const dx = nx - cx;
        const dy = ny - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 < radius * radius) {
          if (d2 === 0) { ny = s.y + s.h + radius; continue; }
          const d = Math.sqrt(d2);
          nx = cx + (dx / d) * radius;
          ny = cy + (dy / d) * radius;
        }
      }
      return { x: nx, y: ny };
    },
  };
}

export { CHOP_SECONDS };
