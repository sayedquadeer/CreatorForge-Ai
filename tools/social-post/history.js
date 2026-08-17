/**
 * Undo / Redo History Manager for Fabric Canvas
 */
class CanvasHistoryManager {
  constructor(canvas, onStateChangeCallback) {
    this.canvas = canvas;
    this.history = [];
    this.currentIndex = -1;
    this.locked = false;
    this.onStateChange = onStateChangeCallback;
  }

  saveState() {
    if (this.locked) return;
    const json = JSON.stringify(this.canvas.toJSON(['id', 'selectable']));
    
    // Truncate future states if we performed an action after undo
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(json);
    this.currentIndex = this.history.length - 1;
    this.notify();
  }

  undo() {
    if (this.currentIndex > 0) {
      this.locked = true;
      this.currentIndex--;
      this.canvas.loadFromJSON(this.history[this.currentIndex], () => {
        this.canvas.renderAll();
        this.locked = false;
        this.notify();
      });
    }
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.locked = true;
      this.currentIndex++;
      this.canvas.loadFromJSON(this.history[this.currentIndex], () => {
        this.canvas.renderAll();
        this.locked = false;
        this.notify();
      });
    }
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.saveState();
  }

  notify() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({
        canUndo: this.currentIndex > 0,
        canRedo: this.currentIndex < this.history.length - 1
      });
    }
  }
}
