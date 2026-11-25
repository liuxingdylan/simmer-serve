// The order board: tickets arrive, wait with a patience bar, and are served
// or expire. One clear job: everything about orders and scoring a serve.

import {
  RECIPES, MAX_ORDERS, ORDER_FIRST_AT, ORDER_INTERVAL_START, ORDER_INTERVAL_END,
  PATIENCE_START, PATIENCE_END,
} from './config.js';
import { mulberry32, pick } from './random.js';

let ticketId = 0;

export function createOrderBoard(seed = 1) {
  const rand = mulberry32(seed);
  return {
    tickets: [],
    nextIn: ORDER_FIRST_AT,
    elapsed: 0,
    served: 0,
    expired: 0,
    combo: 0,
    bestCombo: 0,
    score: 0,
    unlockedRecipes() {
      return RECIPES.filter((r) => r.unlockAt <= this.elapsed);
    },
    spawnTicket() {
      const available = this.unlockedRecipes();
      const recipe = pick(rand, available);
      const patience = PATIENCE_START + (PATIENCE_END - PATIENCE_START) * (this.elapsed / 180);
      this.tickets.push({
        id: ticketId += 1,
        recipe,
        patience,
        maxPatience: patience,
        bornAt: this.elapsed,
      });
    },
    update(dt, events) {
      this.elapsed += dt;
      this.nextIn -= dt;
      if (this.nextIn <= 0 && this.tickets.length < MAX_ORDERS) {
        this.spawnTicket();
        const t = ORDER_INTERVAL_START + (ORDER_INTERVAL_END - ORDER_INTERVAL_START) * (this.elapsed / 180);
        this.nextIn = t;
      }
      for (let i = this.tickets.length - 1; i >= 0; i -= 1) {
        const ticket = this.tickets[i];
        ticket.patience -= dt;
        if (ticket.patience <= 0) {
          this.tickets.splice(i, 1);
          this.expired += 1;
          this.combo = 0;
          events.expired?.(ticket);
        }
      }
    },
    // Find the ticket whose recipe exactly matches the plate's item keys.
    matchingTicket(plateKeys) {
      const sorted = [...plateKeys].sort().join('|');
      return this.tickets.find((t) => [...t.recipe.needs].sort().join('|') === sorted) ?? null;
    },
    serveTicket(ticket, events) {
      const index = this.tickets.indexOf(ticket);
      if (index === -1) return 0;
      this.tickets.splice(index, 1);
      this.served += 1;
      this.combo += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      const patienceFraction = Math.max(0, ticket.patience / ticket.maxPatience);
      const tip = Math.round(50 * patienceFraction);
      const comboMult = 1 + Math.min(1, (this.combo - 1) * 0.1);
      const points = Math.round((ticket.recipe.base + tip) * comboMult);
      this.score += points;
      events.served?.(ticket, points, this.combo);
      return points;
    },
    reset(seed = 1) {
      this.tickets = [];
      this.nextIn = ORDER_FIRST_AT;
      this.elapsed = 0;
      this.served = 0;
      this.expired = 0;
      this.combo = 0;
      this.bestCombo = 0;
      this.score = 0;
    },
  };
}
