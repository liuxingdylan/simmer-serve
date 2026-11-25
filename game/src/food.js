// Drawn food: every ingredient as vector art on the canvas, in each state.
// One clear job: make the food look worth serving.

import { INGREDIENTS } from './config.js';

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// Draw one ingredient centred at (x, y) with the given radius.
export function drawIngredient(ctx, id, state, x, y, r) {
  const def = INGREDIENTS[id];
  if (!def) return;
  ctx.save();
  if (state === 'burnt') {
    circle(ctx, x, y, r, '#241a12');
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
    ctx.arc(x + r * 0.35, y + r * 0.2, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  switch (id) {
    case 'tomato': {
      if (state === 'chopped') {
        for (let i = -1; i <= 1; i += 1) {
          ctx.save();
          ctx.translate(x + i * r * 0.7, y + (i % 2) * r * 0.3);
          ctx.rotate(i * 0.5);
          ctx.fillStyle = '#e5484d';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f27d7d';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else {
        circle(ctx, x, y, r, '#e5484d');
        circle(ctx, x - r * 0.3, y - r * 0.35, r * 0.35, '#ef6a6a');
        ctx.fillStyle = '#3f9e4d';
        ctx.beginPath();
        ctx.moveTo(x, y - r * 0.7);
        ctx.lineTo(x - r * 0.5, y - r * 1.15);
        ctx.lineTo(x - r * 0.1, y - r * 0.8);
        ctx.lineTo(x + r * 0.25, y - r * 1.2);
        ctx.lineTo(x + r * 0.45, y - r * 0.75);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'lettuce': {
      if (state === 'chopped') {
        ctx.fillStyle = '#57b25e';
        for (let i = 0; i < 5; i += 1) {
          const a = (i / 5) * Math.PI * 2;
          ctx.save();
          ctx.translate(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45);
          ctx.rotate(a);
          ctx.fillRect(-r * 0.45, -r * 0.16, r * 0.9, r * 0.32);
          ctx.restore();
        }
      } else {
        circle(ctx, x, y, r, '#57b25e');
        ctx.strokeStyle = '#2f7d38';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.arc(x, y, r * (0.35 + i * 0.28), Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();
        }
        circle(ctx, x - r * 0.3, y - r * 0.3, r * 0.3, '#7ed184');
      }
      break;
    }
    case 'onion': {
      if (state === 'chopped') {
        ctx.fillStyle = '#c9a0e0';
        for (let i = 0; i < 6; i += 1) {
          ctx.fillRect(x - r * 0.7 + (i % 3) * r * 0.5, y - r * 0.5 + Math.floor(i / 3) * r * 0.5, r * 0.36, r * 0.36);
        }
      } else {
        circle(ctx, x, y, r, '#b07fd4');
        ctx.strokeStyle = '#e8d5f2';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.arc(x, y, r * (0.35 + i * 0.25), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.strokeStyle = '#7d4fa3';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.quadraticCurveTo(x + r * 0.3, y - r * 1.4, x + r * 0.1, y - r * 1.5);
        ctx.stroke();
      }
      break;
    }
    case 'patty': {
      const color = state === 'grilled' ? '#6b4423' : '#8a5a3b';
      roundRect(ctx, x - r, y - r * 0.62, r * 2, r * 1.24, r * 0.5, color);
      ctx.strokeStyle = state === 'grilled' ? '#3d2412' : '#5f3a24';
      ctx.lineWidth = 2.5;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x + i * r * 0.55 - r * 0.25, y - r * 0.5);
        ctx.lineTo(x + i * r * 0.55 + r * 0.25, y + r * 0.5);
        ctx.stroke();
      }
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#f5b81e';
      ctx.beginPath();
      ctx.moveTo(x - r, y + r * 0.7);
      ctx.lineTo(x + r, y + r * 0.7);
      ctx.lineTo(x, y - r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d18f0a';
      circle(ctx, x - r * 0.3, y + r * 0.25, r * 0.14, '#d18f0a');
      circle(ctx, x + r * 0.35, y + r * 0.4, r * 0.11, '#d18f0a');
      break;
    }
    case 'bun': {
      ctx.fillStyle = '#e8b06a';
      ctx.beginPath();
      ctx.arc(x, y + r * 0.25, r, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c98a3e';
      ctx.fillRect(x - r, y + r * 0.25, r * 2, r * 0.28);
      ctx.fillStyle = '#fff3d6';
      circle(ctx, x - r * 0.45, y - r * 0.35, r * 0.09, '#fff3d6');
      circle(ctx, x + r * 0.1, y - r * 0.55, r * 0.09, '#fff3d6');
      circle(ctx, x + r * 0.5, y - r * 0.2, r * 0.09, '#fff3d6');
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// A white plate, optionally holding a stack of ingredient keys.
export function drawPlate(ctx, x, y, rx, items = []) {
  ctx.save();
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, rx * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.78, rx * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  let lift = 0;
  for (const key of items) {
    const [id, state] = key.split(':');
    drawIngredient(ctx, id, state || 'raw', x, y - lift - 4, Math.min(15, rx * 0.42));
    lift += 9;
  }
  ctx.restore();
}
