// The chef: movement, what the hands hold, and the interact action.
// The chef carries at most one thing: a raw/chopped/grilled item, or a plate.

import { CHEF_START, CHEF_RADIUS, CHEF_SPEED, INGREDIENTS } from './config.js';
import { makeItem } from './world.js';

export function createChef() {
  return {
    x: CHEF_START.x,
    y: CHEF_START.y,
    facing: 1, // -1 left, 1 right
    moving: false,
    carry: null, // an item, or { plate: true, items: [...] }
    walkPhase: 0,
    chopAnim: 0,
    move(dt, axis, world) {
      const len = Math.hypot(axis.x, axis.y);
      this.moving = len > 0;
      if (!this.moving) return;
      const nx = axis.x / len;
      const ny = axis.y / len;
      if (nx !== 0) this.facing = nx > 0 ? 1 : -1;
      this.walkPhase += dt * 10;
      const next = world.clampChef(
        this.x + nx * CHEF_SPEED * dt,
        this.y + ny * CHEF_SPEED * dt,
        CHEF_RADIUS,
      );
      this.x = next.x;
      this.y = next.y;
    },
    isCarryingPlate() {
      return this.carry !== null && this.carry.plate === true;
    },
    // One press of E / Space / click: the context action for the station in
    // front of the chef. Returns a short event name for sound/feedback.
    interact(station, events) {
      if (!station) return null;
      switch (station.kind) {
        case 'bin': {
          if (this.carry) return 'hands-full';
          this.carry = makeItem(station.stock, 'raw');
          return 'pickup';
        }
        case 'plates': {
          if (this.carry) return 'hands-full';
          this.carry = { plate: true, items: [] };
          return 'pickup';
        }
        case 'trash': {
          if (!this.carry) return null;
          this.carry = null;
          return 'trash';
        }
        case 'chop': {
          const item = this.carry;
          if (station.item) {
            if (item) return 'hands-full';
            // A raw item on the board is chopped by holding E — pressing E
            // must not pick it straight back up. Only a finished (chopped)
            // item comes off with a press.
            if (station.item.state !== 'chopped') return null;
            this.carry = station.item;
            station.item = null;
            station.progress = 0;
            return 'pickup';
          }
          if (!item || !INGREDIENTS[item.id]?.choppable || item.state !== 'raw') {
            return item ? 'wrong-item' : null;
          }
          station.item = item;
          this.carry = null;
          station.progress = 0;
          return 'place';
        }
        case 'grill': {
          if (station.item) {
            if (this.carry) return 'hands-full';
            this.carry = station.item;
            station.item = null;
            station.progress = 0;
            station.burn = 0;
            return 'pickup';
          }
          if (!this.carry || this.carry.id !== 'patty' || this.carry.state !== 'raw') {
            return this.carry ? 'wrong-item' : null;
          }
          station.item = this.carry;
          this.carry = null;
          station.progress = 0;
          station.burn = 0;
          return 'place';
        }
        case 'assembly': {
          if (station.plate) {
            if (this.carry && this.carry.plate) return 'hands-full';
            if (this.carry) {
              const key = this.carry.state === 'raw' ? this.carry.id : `${this.carry.id}:${this.carry.state}`;
              station.plate.push(key);
              this.carry = null;
              return 'place';
            }
            this.carry = { plate: true, items: station.plate };
            station.plate = null;
            return 'pickup';
          }
          if (this.carry && this.carry.plate) {
            station.plate = this.carry.items;
            this.carry = null;
            return 'place';
          }
          return this.carry ? 'need-plate' : null;
        }
        case 'serve': {
          if (!this.isCarryingPlate()) return this.carry ? 'need-plate' : null;
          const ticket = events.findOrder?.(this.carry.items);
          if (!ticket) return 'no-match';
          events.serve?.(ticket);
          this.carry = null;
          return 'served';
        }
        default:
          return null;
      }
    },
    reset() {
      this.x = CHEF_START.x;
      this.y = CHEF_START.y;
      this.facing = 1;
      this.moving = false;
      this.carry = null;
      this.walkPhase = 0;
      this.chopAnim = 0;
    },
  };
}
