/**
 * Editor History Manager handling Stack-based Undo & Redo
 */
class HistoryEngine {
    constructor(canvasEngine) {
        this.engine = canvasEngine;
        this.canvas = canvasEngine.canvas;
        this.undoStack = [];
        this.redoStack = [];
        this.isProcessing = false;
        this.maxStackSize = 30;

        this.initListeners();
    }

    initListeners() {
        // Save initial blank state after render completes
        setTimeout(() => this.saveState(), 200);

        const events = ['object:added', 'object:modified', 'object:removed'];
        events.forEach(evt => {
            this.canvas.on(evt, () => {
                if (!this.isProcessing) {
                    this.saveState();
                }
            });
        });
    }

    saveState() {
        if (this.isProcessing) return;
        const json = JSON.stringify(this.canvas.toJSON(['selectable', 'name']));
        
        // Prevent storing duplicate identical states
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === json) {
            return;
        }

        this.undoStack.push(json);
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        this.redoStack = []; // Clear redo chain on new user action
        this.updateButtons();
    }

    undo() {
        if (this.undoStack.length <= 1) return;
        this.isProcessing = true;

        const currentState = this.undoStack.pop();
        this.redoStack.push(currentState);

        const previousState = this.undoStack[this.undoStack.length - 1];
        this.canvas.loadFromJSON(previousState, () => {
            this.canvas.renderAll();
            this.isProcessing = false;
            this.updateButtons();
        });
    }

    redo() {
        if (this.redoStack.length === 0) return;
        this.isProcessing = true;

        const nextState = this.redoStack.pop();
        this.undoStack.push(nextState);

        this.canvas.loadFromJSON(nextState, () => {
            this.canvas.renderAll();
            this.isProcessing = false;
            this.updateButtons();
        });
    }

    updateButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) undoBtn.disabled = this.undoStack.length <= 1;
        if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
    }
}
