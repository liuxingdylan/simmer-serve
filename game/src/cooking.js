// Cooking in progress: holding E chops on the board, the grill cooks on its
// own. One clear job: the active cooking actions and their feedback.

import { CHOP_SECONDS, INGREDIENTS } from './config.js';

export function createCooking() {
  return {
    // Called every frame while the interact key is held near the chop board.
    chopHeld(dt, station, chef, events) {
      if (!station || station.kind !== 'chop' || !station.item) return;
      if (station.item.state !== 'raw') return;
      station.progress = Math.min(1, station.progress + dt / CHOP_SECONDS);
      chef.chopAnim += dt * 14;
      if (Math.floor(chef.chopAnim) !== Math.floor(chef.chopAnim - dt * 14)) {
        events.chopTick?.(station);
      }
      if (station.progress >= 1) {
        station.item.state = 'chopped';
        station.progress = 0;
        events.chopDone?.(station);
      }
    },
    canChop(station) {
      return station?.kind === 'chop' && station.item?.state === 'raw';
    },
    isChopping(station, interactHeld) {
      return interactHeld && this.canChop(station);
    },
    describeCarry(carry) {
      if (!carry) return '';
      if (carry.plate) {
        if (carry.items.length === 0) return 'Empty plate';
        return `Plate: ${carry.items.map((k) => INGREDIENTS[k.split(':')[0]]?.name ?? k).join(' + ')}`;
      }
      const base = INGREDIENTS[carry.id]?.name ?? carry.id;
      if (carry.state === 'chopped') return `Chopped ${base}`;
      if (carry.state === 'grilled') return `Grilled ${base}`;
      if (carry.state === 'burnt') return `Burnt ${base}!`;
      return base;
    },
  };
}
