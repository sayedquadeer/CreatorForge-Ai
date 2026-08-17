/**
 * Core Canvas Engine Module wrapping Fabric.js API
 */
class CanvasEngine {
    constructor(canvasId) {
        this.canvas = new fabric.Canvas(canvasId, {
            width: 1280,
            height: 720,
            backgroundColor: '#0f172a',
            preserveObjectStacking: true
        });

        this.targetWidth = 1280;
        this.targetHeight = 720;
        this.zoomLevel = 1.0;
        
        this.initAutoScaling();
        this.bindEvents();
    }

    // Adapt viewport display scale to match container dimensions while preserving 1280x720 aspect
    initAutoScaling() {
        const stage = document.getElementById('canvasStage');
        if (!stage) return;

        const resize = () => {
            const containerWidth = stage.clientWidth - 32;
            const containerHeight = stage.clientHeight - 32;
            
            const scaleX = containerWidth / this.targetWidth;
            const scaleY = containerHeight / this.targetHeight;
            const scale = Math.min(scaleX, scaleY, 1.0) * this.zoomLevel;

            this.canvas.setDimensions({
                width: this.targetWidth * scale,
                height: this.targetHeight * scale
            });

            this.canvas.setZoom(scale);
            this.canvas.renderAll();
        };

        window.addEventListener('resize', resize);
        setTimeout(resize, 100);
    }

    setZoom(val) {
        this.zoomLevel = Math.max(0.2, Math.min(val, 2.5));
        window.dispatchEvent(new Event('resize'));
    }

    bindEvents() {
        this.canvas.on('selection:created', (e) => this.handleSelection(e));
        this.canvas.on('selection:updated', (e) => this.handleSelection(e));
        this.canvas.on('selection:cleared', () => this.handleClearSelection());
    }

    handleSelection(e) {
        const obj = e.selected[0];
        if (!obj) return;

        const statusEl = document.getElementById('activeSelectionStatus');
        if (statusEl) statusEl.textContent = `Selected: ${obj.type.toUpperCase()}`;

        window.dispatchEvent(new CustomEvent('objectSelected', { detail: obj }));
    }

    handleClearSelection() {
        const statusEl = document.getElementById('activeSelectionStatus');
        if (statusEl) statusEl.textContent = 'Selected: None';

        window.dispatchEvent(new CustomEvent('objectCleared'));
    }

    // Text Methods
    addText(textStr, options = {}) {
        const text = new fabric.IText(textStr, {
            left: 640,
            top: 360,
            originX: 'center',
            originY: 'center',
            fontFamily: options.fontFamily || 'Inter',
            fontSize: options.fontSize || 50,
            fill: options.fill || '#ffffff',
            fontWeight: options.fontWeight || 'normal',
            fontStyle: options.fontStyle || 'normal',
            textAlign: options.textAlign || 'center',
            stroke: options.stroke || '',
            strokeWidth: options.strokeWidth || 0,
            cornerColor: '#6366f1',
            cornerSize: 10,
            transparentCorners: false
        });
        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        this.canvas.renderAll();
    }

    // Vector Shapes
    addShape(type) {
        let shape;
        const baseOpts = {
            left: 640,
            top: 360,
            originX: 'center',
            originY: 'center',
            fill: '#6366f1',
            stroke: '#ffffff',
            strokeWidth: 0,
            cornerColor: '#6366f1',
            cornerSize: 10,
            transparentCorners: false
        };

        switch(type) {
            case 'rect':
                shape = new fabric.Rect({ ...baseOpts, width: 250, height: 150 });
                break;
            case 'circle':
                shape = new fabric.Circle({ ...baseOpts, radius: 100 });
                break;
            case 'roundRect':
                shape = new fabric.Rect({ ...baseOpts, width: 250, height: 150, rx: 20, ry: 20 });
                break;
            case 'triangle':
                shape = new fabric.Triangle({ ...baseOpts, width: 200, height: 180 });
                break;
            case 'arrow':
                shape = new fabric.Path('M 0 0 L 100 0 L 100 -20 L 150 20 L 100 60 L 100 40 L 0 40 Z', {
                    ...baseOpts,
                    scaleX: 1.5,
                    scaleY: 1.5
                });
                break;
        }
        if (shape) {
            this.canvas.add(shape);
            this.canvas.setActiveObject(shape);
            this.canvas.renderAll();
        }
    }

    // Image Upload Handler
    addImageFromURL(url) {
        fabric.Image.fromURL(url, (img) => {
            // Scale large upload down proportionally if wider than stage width
            if (img.width > 800) {
                img.scaleToWidth(800);
            }
            img.set({
                left: 640,
                top: 360,
                originX: 'center',
                originY: 'center',
                cornerColor: '#6366f1',
                cornerSize: 10,
                transparentCorners: false
            });
            this.canvas.add(img);
            this.canvas.setActiveObject(img);
            this.canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    }

    // Layers & Transform Actions
    bringForward() {
        const obj = this.canvas.getActiveObject();
        if (obj) { this.canvas.bringForward(obj); this.canvas.renderAll(); }
    }
    sendBackward() {
        const obj = this.canvas.getActiveObject();
        if (obj) { this.canvas.sendBackwards(obj); this.canvas.renderAll(); }
    }
    bringToFront() {
        const obj = this.canvas.getActiveObject();
        if (obj) { this.canvas.bringToFront(obj); this.canvas.renderAll(); }
    }
    sendToBack() {
        const obj = this.canvas.getActiveObject();
        if (obj) { this.canvas.sendToBack(obj); this.canvas.renderAll(); }
    }

    duplicateActive() {
        const obj = this.canvas.getActiveObject();
        if (!obj) return;
        obj.clone((cloned) => {
            this.canvas.discardActiveObject();
            cloned.set({
                left: cloned.left + 20,
                top: cloned.top + 20,
                evented: true
            });
            if (cloned.type === 'activeSelection') {
                cloned.canvas = this.canvas;
                cloned.forEachObject((o) => this.canvas.add(o));
                cloned.setCoordinates();
            } else {
                this.canvas.add(cloned);
            }
            this.canvas.setActiveObject(cloned);
            this.canvas.renderAll();
        });
    }

    deleteActive() {
        const active = this.canvas.getActiveObjects();
        if (active.length) {
            this.canvas.discardActiveObject();
            active.forEach((obj) => this.canvas.remove(obj));
            this.canvas.renderAll();
        }
    }

    // Image Export (Strict 1280x720 output bypasses dynamic zoom scaling)
    exportImage(format = 'png', quality = 0.92) {
        return this.canvas.toDataURL({
            format: format,
            quality: quality,
            multiplier: 1 / this.canvas.getZoom()
        });
    }
        }
