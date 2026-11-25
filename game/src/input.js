// Keyboard and mouse input. One clear job: turn browser events into a
// small state the game loop reads (held keys, fresh presses, clicks).

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  let mouse = { x: 0, y: 0, clicked: false, down: false };

  function keyName(event) {
    const k = event.key.toLowerCase();
    if (k === ' ') return 'space';
    return k;
  }

  window.addEventListener('keydown', (event) => {
    const k = keyName(event);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
      event.preventDefault();
    }
    if (!keys.has(k)) pressed.add(k);
    keys.add(k);
  });
  window.addEventListener('keyup', (event) => keys.delete(keyName(event)));
  window.addEventListener('blur', () => keys.clear());

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }
  canvas.addEventListener('pointerdown', (event) => {
    mouse = { ...canvasPoint(event), clicked: true, down: true };
  });
  canvas.addEventListener('pointerup', () => { mouse.down = false; });
  canvas.addEventListener('pointermove', (event) => {
    const p = canvasPoint(event);
    mouse.x = p.x;
    mouse.y = p.y;
  });

  return {
    held(name) { return keys.has(name); },
    axis() {
      let x = 0;
      let y = 0;
      if (keys.has('a') || keys.has('arrowleft')) x -= 1;
      if (keys.has('d') || keys.has('arrowright')) x += 1;
      if (keys.has('w') || keys.has('arrowup')) y -= 1;
      if (keys.has('s') || keys.has('arrowdown')) y += 1;
      return { x, y };
    },
    interactHeld() {
      return keys.has('e') || keys.has('space') || mouse.down;
    },
    consumePress(name) {
      if (!pressed.has(name)) return false;
      pressed.delete(name);
      return true;
    },
    consumeClick() {
      if (!mouse.clicked) return null;
      mouse.clicked = false;
      return { x: mouse.x, y: mouse.y };
    },
    mousePosition() { return { x: mouse.x, y: mouse.y }; },
    endFrame() { pressed.clear(); },
  };
}
