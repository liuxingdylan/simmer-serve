// All canvas drawing: the kitchen, the order board, the HUD, the chef and
// the title / game-over screens. One clear job: everything the player sees.

import { VIEW, HUD_HEIGHT, BOARD_WIDTH, FLOOR, PALETTE, INGREDIENTS, RECIPES, SHIFT_SECONDS } from './config.js';
import { drawIngredient, drawPlate } from './food.js';

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.save();
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function bar(ctx, x, y, w, h, fraction, fill, bg = 'rgba(0,0,0,0.35)') {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, Math.max(0, Math.min(1, fraction)) * w, h, h / 2);
  ctx.fill();
  ctx.restore();
}

function drawFloor(ctx) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  for (let ty = 0; ty < 10; ty += 1) {
    for (let tx = 0; tx < 17; tx += 1) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(FLOOR.x + tx * 64, FLOOR.y + ty * 60, 64, 60);
    }
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  for (let tx = 0; tx <= 17; tx += 1) {
    ctx.beginPath();
    ctx.moveTo(FLOOR.x + tx * 64, FLOOR.y);
    ctx.lineTo(FLOOR.x + tx * 64, FLOOR.y + 600);
    ctx.stroke();
  }
  for (let ty = 0; ty <= 10; ty += 1) {
    ctx.beginPath();
    ctx.moveTo(FLOOR.x, FLOOR.y + ty * 60);
    ctx.lineTo(FLOOR.x + 1088, FLOOR.y + ty * 60);
    ctx.stroke();
  }
}

function drawCounter(ctx, s, highlight) {
  ctx.save();
  ctx.fillStyle = PALETTE.counterSide;
  ctx.fillRect(s.x, s.y + 8, s.w, s.h - 8);
  ctx.fillStyle = PALETTE.counterTop;
  ctx.beginPath();
  ctx.roundRect(s.x, s.y, s.w, s.h - 8, 6);
  ctx.fill();
  if (highlight) {
    ctx.strokeStyle = '#ffd94a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(s.x + 2, s.y + 2, s.w - 4, s.h - 12, 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStationContents(ctx, s) {
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  if (s.kind === 'bin') {
    drawIngredient(ctx, s.stock, 'raw', cx, cy - 6, 15);
    drawIngredient(ctx, s.stock, 'raw', cx - 20, cy + 8, 11);
    drawIngredient(ctx, s.stock, 'raw', cx + 20, cy + 8, 11);
  } else if (s.kind === 'chop') {
    ctx.fillStyle = '#dfc084';
    ctx.beginPath();
    ctx.roundRect(s.x + 14, s.y + 12, s.w - 28, s.h - 26, 6);
    ctx.fill();
    if (s.item) {
      drawIngredient(ctx, s.item.id, s.item.state, cx, cy, 20);
      if (s.item.state === 'raw') {
        bar(ctx, cx - 42, s.y + s.h + 4, 84, 9, s.progress, '#57b25e');
        // the knife, mid-chop
        ctx.save();
        ctx.translate(cx + 34, cy - 14);
        ctx.rotate(-0.5);
        ctx.fillStyle = '#dfe5ea';
        ctx.fillRect(0, -3, 34, 6);
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(34, -3, 14, 6);
        ctx.restore();
      }
    }
  } else if (s.kind === 'grill') {
    ctx.fillStyle = '#4a4d52';
    ctx.beginPath();
    ctx.roundRect(s.x + 12, s.y + 10, s.w - 24, s.h - 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#2c2e31';
    ctx.lineWidth = 3;
    for (let i = 1; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(s.x + 12 + i * ((s.w - 24) / 5), s.y + 12);
      ctx.lineTo(s.x + 12 + i * ((s.w - 24) / 5), s.y + s.h - 14);
      ctx.stroke();
    }
    if (s.item) {
      drawIngredient(ctx, 'patty', s.item.state, cx, cy - 6, 19);
      if (s.item.state === 'raw' || s.item.state === 'grilled') {
        const done = s.progress;
        const color = s.item.state === 'grilled' ? '#e5484d' : '#f5b81e';
        const frac = s.item.state === 'grilled' ? 1 - s.burn : done;
        ctx.save();
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 27, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 27, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        if (s.item.state === 'grilled') text(ctx, 'READY!', cx, s.y - 18, 13, '#ffd94a', 'center');
        if (s.burn > 0.45) text(ctx, 'BURNING!', cx, s.y - 18, 13, '#ff6b5e', 'center');
      }
    }
  } else if (s.kind === 'plates') {
    for (let i = 0; i < 3; i += 1) drawPlate(ctx, cx, cy + 8 - i * 5, 26);
  } else if (s.kind === 'assembly') {
    if (s.plate) drawPlate(ctx, cx, cy + 4, 34, s.plate);
    else text(ctx, 'PLACE A PLATE', cx, cy + 5, 13, 'rgba(255,243,214,0.75)', 'center');
  } else if (s.kind === 'serve') {
    ctx.fillStyle = '#7a4a21';
    ctx.beginPath();
    ctx.roundRect(s.x + 8, s.y + 8, s.w - 16, s.h - 18, 6);
    ctx.fill();
    ctx.fillStyle = '#ffd94a';
    ctx.beginPath();
    ctx.moveTo(s.x + s.w / 2 - 8, s.y + 16);
    ctx.lineTo(s.x + s.w / 2 + 8, s.y + 16);
    ctx.lineTo(s.x + s.w / 2, s.y + 30);
    ctx.closePath();
    ctx.fill();
  } else if (s.kind === 'trash') {
    ctx.fillStyle = '#5b6066';
    ctx.beginPath();
    ctx.roundRect(cx - 22, cy - 16, 44, 34, 4);
    ctx.fill();
    ctx.fillStyle = '#3a3d41';
    ctx.fillRect(cx - 26, cy - 20, 52, 7);
  }
  text(ctx, s.label.toUpperCase(), cx, s.y + s.h - 4, 11, 'rgba(255,243,214,0.9)', 'center');
}

function drawTicket(ctx, ticket, x, y, w) {
  const h = 118;
  const urgency = ticket.patience / ticket.maxPatience;
  ctx.save();
  ctx.fillStyle = PALETTE.ticket;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = urgency < 0.3 ? '#e5484d' : PALETTE.ticketEdge;
  ctx.lineWidth = urgency < 0.3 ? 3 : 1.5;
  ctx.stroke();
  text(ctx, `#${ticket.id}  ${ticket.recipe.name}`, x + 10, y + 20, 13, PALETTE.ink);
  const needs = ticket.recipe.needs;
  needs.forEach((key, i) => {
    const [id, state] = key.split(':');
    const ix = x + 22 + i * 36;
    drawIngredient(ctx, id, state || 'raw', ix, y + 46, 13);
  });
  text(ctx, `$${ticket.recipe.base} + tip`, x + 10, y + 82, 12, '#7a5a2e');
  bar(ctx, x + 10, y + 94, w - 20, 10, urgency, urgency < 0.3 ? '#e5484d' : '#57b25e');
  text(ctx, `${Math.ceil(ticket.patience)}s`, x + w - 10, y + 82, 12, urgency < 0.3 ? '#e5484d' : '#7a5a2e', 'right');
  ctx.restore();
}

function drawBoard(ctx, board) {
  ctx.save();
  ctx.fillStyle = PALETTE.board;
  ctx.fillRect(0, HUD_HEIGHT, BOARD_WIDTH, VIEW.height - HUD_HEIGHT);
  ctx.fillStyle = PALETTE.boardEdge;
  ctx.fillRect(BOARD_WIDTH - 6, HUD_HEIGHT, 6, VIEW.height - HUD_HEIGHT);
  text(ctx, 'ORDERS', BOARD_WIDTH / 2, HUD_HEIGHT + 24, 16, PALETTE.ink, 'center');
  board.tickets.forEach((t, i) => drawTicket(ctx, t, 10, HUD_HEIGHT + 36 + i * 128, BOARD_WIDTH - 20));
  const y = HUD_HEIGHT + 36 + board.tickets.length * 128 + 8;
  if (board.tickets.length < 4) {
    text(ctx, `next order in ${Math.max(0, Math.ceil(board.nextIn))}s`, BOARD_WIDTH / 2, y + 16, 12, '#7a5a2e', 'center');
  }
  const unlocked = RECIPES.filter((r) => r.unlockAt <= board.elapsed);
  text(ctx, 'MENU', BOARD_WIDTH / 2, VIEW.height - 168, 13, PALETTE.ink, 'center');
  RECIPES.forEach((r, i) => {
    const locked = !unlocked.includes(r);
    const ry = VIEW.height - 148 + i * 24;
    ctx.fillStyle = locked ? 'rgba(46,33,24,0.35)' : PALETTE.ink;
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${locked ? '🔒 ' : ''}${r.name}  $${r.base}`, 14, ry);
  });
  text(ctx, 'WASD / arrows — move', BOARD_WIDTH / 2, VIEW.height - 42, 11, '#7a5a2e', 'center');
  text(ctx, 'E / Space / click — use', BOARD_WIDTH / 2, VIEW.height - 26, 11, '#7a5a2e', 'center');
  text(ctx, 'M — mute · R — restart', BOARD_WIDTH / 2, VIEW.height - 10, 11, '#7a5a2e', 'center');
  ctx.restore();
}

function drawHud(ctx, game) {
  const { board, timeLeft } = game;
  ctx.save();
  ctx.fillStyle = '#2e2118';
  ctx.fillRect(0, 0, VIEW.width, HUD_HEIGHT);
  const mm = Math.floor(Math.max(0, timeLeft) / 60);
  const ss = Math.floor(Math.max(0, timeLeft) % 60).toString().padStart(2, '0');
  const urgent = timeLeft <= 30;
  text(ctx, `${mm}:${ss}`, 220, 46, 34, urgent ? '#ff6b5e' : '#fff3d6');
  text(ctx, timeLeft <= 30 ? 'FINAL RUSH!' : 'SHIFT', 330, 30, 12, urgent ? '#ff6b5e' : '#c9a98f', 'left');
  bar(ctx, 330, 40, 180, 10, 1 - timeLeft / SHIFT_SECONDS, urgent ? '#e5484d' : '#f5b81e');
  text(ctx, 'SCORE', 560, 28, 12, '#c9a98f');
  text(ctx, String(board.score), 560, 56, 30, '#fff3d6');
  text(ctx, 'SERVED', 700, 28, 12, '#c9a98f');
  text(ctx, `${board.served} dishes`, 700, 56, 20, '#fff3d6');
  if (board.combo >= 2) {
    ctx.fillStyle = '#f5b81e';
    ctx.beginPath();
    ctx.roundRect(880, 14, 130, 44, 22);
    ctx.fill();
    text(ctx, `COMBO ×${board.combo}`, 945, 44, 20, '#2e2118', 'center');
  }
  const hearts = '♥'.repeat(3 - game.strikes) + '♡'.repeat(game.strikes);
  text(ctx, hearts, 1018, 46, 21, '#e5484d');
  text(ctx, game.muted ? 'MUTED (M)' : 'M — mute', 1180, 30, 12, '#c9a98f', 'right');
  text(ctx, 'SIMMER & SERVE', 1180, 52, 12, '#fff3d6', 'right');
  ctx.restore();
}

function drawChef(ctx, chef) {
  const { x, y } = chef;
  const bob = chef.moving ? Math.sin(chef.walkPhase) * 2.5 : 0;
  ctx.save();
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y + 22, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // body (white coat)
  ctx.fillStyle = '#f4f1ea';
  ctx.beginPath();
  ctx.roundRect(x - 17, y - 6 + bob, 34, 28, 10);
  ctx.fill();
  ctx.fillStyle = '#e5484d';
  ctx.fillRect(x - 17, y + 8 + bob, 34, 4);
  // head
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(x, y - 18 + bob, 13, 0, Math.PI * 2);
  ctx.fill();
  // toque
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - 8, y - 30 + bob, 8, 0, Math.PI * 2);
  ctx.arc(x, y - 34 + bob, 9, 0, Math.PI * 2);
  ctx.arc(x + 8, y - 30 + bob, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 12, y - 32 + bob, 24, 8);
  // eyes
  ctx.fillStyle = '#2e2118';
  const ex = chef.facing * 4;
  ctx.beginPath();
  ctx.arc(x - 5 + ex, y - 19 + bob, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 5 + ex, y - 19 + bob, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // arms + carried item
  if (chef.carry) {
    const lift = Math.sin(chef.walkPhase) * 2;
    ctx.fillStyle = '#f4f1ea';
    ctx.beginPath();
    ctx.arc(x - 16, y - 26 + bob, 5, 0, Math.PI * 2);
    ctx.arc(x + 16, y - 26 + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    if (chef.carry.plate) {
      drawPlate(ctx, x, y - 52 + lift, 24, chef.carry.items);
    } else {
      drawIngredient(ctx, chef.carry.id, chef.carry.state, x, y - 52 + lift, 14);
    }
  }
  // chop animation: knife flash
  if (chef.chopAnim > 0 && chef.chopAnim % 1 < 0.5) {
    ctx.save();
    ctx.translate(x + chef.facing * 20, y - 30);
    ctx.rotate(chef.facing * 0.6);
    ctx.fillStyle = '#dfe5ea';
    ctx.fillRect(0, -2, 22, 4);
    ctx.restore();
  }
  ctx.restore();
}

function drawPrompt(ctx, game) {
  const station = game.nearStation;
  if (!station || game.screen !== 'play') return;
  const carry = game.chef.carry ? '  ·  carrying' : '';
  const pillY = station.y < 400 ? station.y + station.h + 6 : station.y - 30;
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#2e2118';
  ctx.beginPath();
  ctx.roundRect(station.x + station.w / 2 - 66, pillY, 132, 22, 11);
  ctx.fill();
  ctx.restore();
  text(ctx, `${station.label}${carry} — press E`, station.x + station.w / 2, pillY + 15, 12, '#fff3d6', 'center');
}

function overlay(ctx, title, lines, foot) {
  ctx.save();
  ctx.fillStyle = 'rgba(30,18,10,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff7e0';
  ctx.beginPath();
  ctx.roundRect(VIEW.width / 2 - 330, 150, 660, 440, 16);
  ctx.fill();
  ctx.strokeStyle = '#e0c98f';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, title, VIEW.width / 2, 230, 52, '#e5484d', 'center');
  lines.forEach((line, i) => text(ctx, line, VIEW.width / 2, 300 + i * 34, 19, PALETTE.ink, 'center', 'normal'));
  if (foot) text(ctx, foot, VIEW.width / 2, 540, 20, '#7a5a2e', 'center');
  ctx.restore();
}

function gradeFor(score, served) {
  if (score >= 900 && served >= 9) return 'S — Head Chef!';
  if (score >= 600) return 'A — Sous Chef';
  if (score >= 350) return 'B — Line Cook';
  if (score >= 150) return 'C — Prep Cook';
  return 'D — Dishwasher (for now)';
}

export function drawGame(ctx, game) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawFloor(ctx);
  for (const s of game.world.stations) {
    drawCounter(ctx, s, game.nearStation === s);
    drawStationContents(ctx, s);
  }
  drawBoard(ctx, game.board);
  drawHud(ctx, game);
  drawChef(ctx, game.chef);
  game.particles.draw(ctx);
  drawPrompt(ctx, game);

  if (game.message) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, game.messageLife);
    ctx.fillStyle = '#2e2118';
    ctx.beginPath();
    ctx.roundRect(VIEW.width / 2 - 220, 96, 440, 40, 20);
    ctx.fill();
    ctx.restore();
    text(ctx, game.message, VIEW.width / 2, 123, 17, '#fff3d6', 'center');
  }

  if (game.screen === 'title') {
    overlay(ctx, 'SIMMER & SERVE', [
      'A tiny kitchen. A big dinner rush.',
      'Grab ingredients, chop, grill, plate — and serve',
      'before the ticket’s patience runs out.',
      '',
      'WASD / arrows to move · E / Space / click to use a station',
      'Chop on the board · Grill the patty (don’t burn it!)',
      'Build the dish on a plate · Serve it at the window',
    ], game.best > 0 ? `Best score: ${game.best}  ·  Press ENTER to start` : 'Press ENTER to start');
  } else if (game.screen === 'over') {
    const b = game.board;
    overlay(ctx, 'SHIFT OVER!', [
      `Score: ${b.score}   ·   Dishes served: ${b.served}`,
      `Best combo: ×${b.bestCombo}   ·   Orders lost: ${b.expired}`,
      '',
      gradeFor(b.score, b.served),
      '',
      `Best score: ${game.best}`,
    ], 'Press R to run another shift');
  }
}

export { text, bar };
