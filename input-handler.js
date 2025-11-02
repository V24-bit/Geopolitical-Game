class InputHandler {
  constructor(canvas, cameraController) {
    this.canvas = canvas;
    this.camera = cameraController;

    this.mouse = { x: 0, y: 0, lastX: 0, lastY: 0 };
    this.isDragging = false;
    this.dragThreshold = 3;
    this.totalDragDistance = 0;

    this.touch = { active: false, distance: 0, lastTime: 0 };
    this.keys = new Set();

    this.inputThrottleMs = 8;
    this.lastInputTime = 0;

    this.setupMouseListeners();
    this.setupTouchListeners();
    this.setupKeyboardListeners();
    this.setupWheelListener();
  }

  setupMouseListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e), { passive: false });
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: false });
    this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e), { passive: false });
    this.canvas.addEventListener('mouseleave', () => this.onMouseLeave(), { passive: false });
  }

  setupTouchListeners() {
    this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e), { passive: false });
    window.addEventListener('keyup', (e) => this.onKeyUp(e), { passive: false });
    window.addEventListener('blur', () => this.onWindowBlur(), { passive: true });
  }

  setupWheelListener() {
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
  }

  onMouseDown(e) {
    e.preventDefault();
    this.isDragging = true;
    this.mouse.lastX = this.mouse.x = e.clientX;
    this.mouse.lastY = this.mouse.y = e.clientY;
    this.totalDragDistance = 0;
    this.camera.startDrag();
    this.canvas.style.cursor = 'grabbing';
  }

  onMouseMove(e) {
    e.preventDefault();
    const now = Date.now();
    if (now - this.lastInputTime < this.inputThrottleMs) return;
    this.lastInputTime = now;

    const newX = e.clientX;
    const newY = e.clientY;

    if (this.isDragging && this.camera) {
      const deltaX = newX - this.mouse.lastX;
      const deltaY = newY - this.mouse.lastY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      this.totalDragDistance += distance;

      if (distance > 0.5) {
        this.camera.moveByDelta(deltaX, deltaY, false);
      }
    }

    this.mouse.lastX = newX;
    this.mouse.lastY = newY;
  }

  onMouseUp(e) {
    e.preventDefault();
    if (this.totalDragDistance < this.dragThreshold) {
      this.handleClick(e.clientX, e.clientY);
    }
    this.isDragging = false;
    this.camera.stopDrag();
    this.canvas.style.cursor = 'grab';
  }

  onMouseLeave() {
    this.isDragging = false;
    this.camera.stopDrag();
    this.canvas.style.cursor = 'grab';
  }

  onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.mouse.lastX = this.mouse.x = e.touches[0].clientX;
      this.mouse.lastY = this.mouse.y = e.touches[0].clientY;
      this.totalDragDistance = 0;
      this.camera.startDrag();
    } else if (e.touches.length === 2) {
      this.isDragging = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      this.touch.distance = Math.hypot(
        t2.clientX - t1.clientX,
        t2.clientY - t1.clientY
      );
      this.touch.active = true;
    }
  }

  onTouchMove(e) {
    e.preventDefault();
    const now = Date.now();
    if (now - this.lastInputTime < this.inputThrottleMs) return;
    this.lastInputTime = now;

    if (e.touches.length === 1 && this.isDragging && this.camera) {
      const deltaX = e.touches[0].clientX - this.mouse.lastX;
      const deltaY = e.touches[0].clientY - this.mouse.lastY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      this.totalDragDistance += distance;

      if (distance > 1) {
        this.camera.moveByDelta(deltaX, deltaY, false);
      }

      this.mouse.lastX = e.touches[0].clientX;
      this.mouse.lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2 && this.touch.active && this.camera) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDistance = Math.hypot(
        t2.clientX - t1.clientX,
        t2.clientY - t1.clientY
      );

      if (this.touch.distance > 0) {
        const zoomFactor = currentDistance / this.touch.distance;
        this.camera.zoomBy(zoomFactor, false);
      }

      this.touch.distance = currentDistance;
    }
  }

  onTouchEnd(e) {
    e.preventDefault();
    if (e.changedTouches.length === 1 && this.totalDragDistance < this.dragThreshold) {
      const touch = e.changedTouches[0];
      this.handleClick(touch.clientX, touch.clientY);
    }
    this.isDragging = false;
    this.touch.active = false;
    this.camera.stopDrag();
  }

  onWheel(e) {
    e.preventDefault();
    const now = Date.now();
    if (now - this.lastInputTime < 30) return;
    this.lastInputTime = now;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    this.camera.zoomBy(zoomFactor, false);
  }

  onKeyDown(e) {
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    )) return;

    const validKeys = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (validKeys.includes(e.key)) {
      e.preventDefault();
      this.keys.add(e.key.toLowerCase());
    }
  }

  onKeyUp(e) {
    this.keys.delete(e.key.toLowerCase());
  }

  onWindowBlur() {
    this.keys.clear();
    this.isDragging = false;
    this.touch.active = false;
    this.camera.stopDrag();
  }

  handleClick(clientX, clientY) {
    if (window.onMapClick) {
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      window.onMapClick(x, y);
    }
  }

  processKeyboardInput(speed) {
    let deltaX = 0;
    let deltaY = 0;

    if (this.keys.has('w') || this.keys.has('arrowup')) deltaY += speed;
    if (this.keys.has('s') || this.keys.has('arrowdown')) deltaY -= speed;
    if (this.keys.has('a') || this.keys.has('arrowleft')) deltaX += speed;
    if (this.keys.has('d') || this.keys.has('arrowright')) deltaX -= speed;

    if (deltaX !== 0 || deltaY !== 0) {
      this.camera.moveByDelta(deltaX, deltaY, true);
      return true;
    }
    return false;
  }

  hasActiveInput() {
    return this.isDragging || this.keys.size > 0 || this.touch.active;
  }

  destroy() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}

if (typeof window !== 'undefined') {
  window.InputHandler = InputHandler;
}
