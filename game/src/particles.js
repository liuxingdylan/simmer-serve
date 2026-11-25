// Particles and floating score text. One clear job: juice — steam, crumbs,
// sparkles and the "+120" popups that make a serve feel good.

export function createParticles() {
  const list = [];

  return {
    steam(x, y) {
      list.push({
        kind: 'steam', x: x + (Math.random() - 0.5) * 30, y,
        vx: (Math.random() - 0.5) * 8, vy: -22 - Math.random() * 14,
        life: 0.9, max: 0.9, size: 7 + Math.random() * 7,
      });
    },
    crumbs(x, y, color) {
      for (let i = 0; i < 8; i += 1) {
        list.push({
          kind: 'crumb', x, y,
          vx: (Math.random() - 0.5) * 160, vy: -40 - Math.random() * 90,
          life: 0.5, max: 0.5, size: 2 + Math.random() * 3, color,
        });
      }
    },
    sparkle(x, y) {
      for (let i = 0; i < 14; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 90;
        list.push({
          kind: 'spark', x, y,
          vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 30,
          life: 0.7, max: 0.7, size: 2 + Math.random() * 3, color: '#ffd94a',
        });
      }
    },
    confetti(x, y) {
      const colors = ['#e5484d', '#57b25e', '#f5b81e', '#5aa9e6', '#b07fd4'];
      for (let i = 0; i < 26; i += 1) {
        list.push({
          kind: 'crumb', x: x + (Math.random() - 0.5) * 60, y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 140, vy: -60 - Math.random() * 140,
          life: 1.1, max: 1.1, size: 3 + Math.random() * 4,
          color: colors[i % colors.length],
        });
      }
    },
    floatText(x, y, text, color = '#fff3d6') {
      list.push({ kind: 'text', x, y, vx: 0, vy: -46, life: 1.2, max: 1.2, text, color });
    },
    update(dt) {
      for (let i = list.length - 1; i >= 0; i -= 1) {
        const p = list[i];
        p.life -= dt;
        if (p.life <= 0) { list.splice(i, 1); continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.kind === 'crumb' || p.kind === 'spark') p.vy += 260 * dt;
        if (p.kind === 'steam') p.size += 14 * dt;
      }
    },
    draw(ctx) {
      for (const p of list) {
        const alpha = Math.max(0, p.life / p.max);
        if (p.kind === 'text') {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = 'bold 26px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(46,33,24,0.85)';
          ctx.strokeText(p.text, p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, p.x, p.y);
          ctx.restore();
        } else if (p.kind === 'steam') {
          ctx.save();
          ctx.globalAlpha = alpha * 0.45;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }
    },
    clear() { list.length = 0; },
  };
}
