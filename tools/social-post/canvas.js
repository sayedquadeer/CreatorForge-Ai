/**
 * Main Canvas Logic Engine using Fabric.js
 */

class SocialCanvasEngine {
  constructor(canvasId, options = {}) {
    this.canvas = new fabric.Canvas(canvasId, {
      preserveObjectStacking: true,
      selection: true
    });

    this.currentPreset = SOCIAL_PRESETS.insta_square;
    this.zoomLevel = 1;
    
    this.initCanvasSize();
    this.bindEvents();
  }

  setPreset(presetKey) {
    if (SOCIAL_PRESETS[presetKey]) {
      this.currentPreset = SOCIAL_PRESETS[presetKey];
      this.initCanvasSize();
    }
  }

  initCanvasSize() {
    const { width, height } = this.currentPreset;
    this.canvas.setWidth(width);
    this.canvas.setHeight(height);
    this.fitToContainer();
  }

  fitToContainer() {
    const viewport = document.getElementById('canvasViewport');
    if (!viewport) return;

    const padding = 40;
    const availWidth = viewport.clientWidth - padding;
    const availHeight = viewport.clientHeight - padding;

    const scaleX = availWidth / this.currentPreset.width;
    const scaleY = availHeight / this.currentPreset.height;
    
    // Choose appropriate scale for fit
    let scale = Math.min(scaleX, scaleY, 1);
    if (scale <= 0) scale = 0.2;

    this.setZoom(scale);
  }

  setZoom(scale) {
    this.zoomLevel = Math.max(0.1, Math.min(scale, 3.0));
    const card = document.getElementById('canvasCard');
    if (card) {
      card.style.transform = `scale(${this.zoomLevel})`;
      card.style.transformOrigin = 'center center';
    }
    const zoomText = document.getElementById('zoomLevelText');
    if (zoomText) {
      zoomText.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }
  }

  setBackgroundColor(color) {
    this.canvas.setBackgroundColor(color, this.canvas.renderAll.bind(this.canvas));
  }

  addText(text, options = {}) {
    const iText = new fabric.IText(text, {
      left: this.currentPreset.width / 2,
      top: this.currentPreset.height / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: options.fontFamily || 'Inter',
      fontSize: options.fontSize || 48,
      fill: options.fill || '#ffffff',
      fontWeight: options.fontWeight || 'normal',
      fontStyle: options.fontStyle || 'normal',
      textAlign: options.textAlign || 'center',
      stroke: options.stroke || '',
      strokeWidth: options.strokeWidth || 0,
      opacity: options.opacity !== undefined ? options.opacity : 1
    });

    this.canvas.add(iText);
    this.canvas.setActiveObject(iText);
    this.canvas.renderAll();
    return iText;
  }

  addShape(shapeType) {
    let shape;
    const centerX = this.currentPreset.width / 2;
    const centerY = this.currentPreset.height / 2;

    switch (shapeType) {
      case 'rect':
        shape = new fabric.Rect({
          left: centerX, top: centerY, originX: 'center', originY: 'center',
          width: 200, height: 200, fill: '#3b82f6'
        });
        break;
      case 'rounded-rect':
        shape = new fabric.Rect({
          left: centerX, top: centerY, originX: 'center', originY: 'center',
          width: 200, height: 200, rx: 20, ry: 20, fill: '#3b82f6'
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: centerX, top: centerY, originX: 'center', originY: 'center',
          radius: 100, fill: '#3b82f6'
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          left: centerX, top: centerY, originX: 'center', originY: 'center',
          width: 200, height: 200, fill: '#3b82f6'
        });
        break;
      case 'arrow':
        shape = new fabric.Path('M 0 0 L 100 0 L 100 -20 L 150 25 L 100 70 L 100 50 L 0 50 Z', {
          left: centerX, top: centerY, originX: 'center', originY: 'center',
          fill: '#3b82f6', width: 150, height: 90
        });
        break;
    }

    if (shape) {
      this.canvas.add(shape);
      this.canvas.setActiveObject(shape);
      this.canvas.renderAll();
    }
    return shape;
  }

  addImage(imgElement) {
    const imgInstance = new fabric.Image(imgElement, {
      left: this.currentPreset.width / 2,
      top: this.currentPreset.height / 2,
      originX: 'center',
      originY: 'center'
    });

    // Scale image down if larger than canvas
    if (imgInstance.width > this.currentPreset.width * 0.8) {
      imgInstance.scaleToWidth(this.currentPreset.width * 0.8);
    }

    this.canvas.add(imgInstance);
    this.canvas.setActiveObject(imgInstance);
    this.canvas.renderAll();
    return imgInstance;
  }

  loadTemplate(template) {
    this.canvas.clear();
    this.setBackgroundColor(template.bg || '#0f172a');

    template.objects.forEach(obj => {
      if (obj.type === 'rect') {
        this.canvas.add(new fabric.Rect({
          left: obj.left, top: obj.top, width: obj.width, height: obj.height,
          fill: obj.fill, stroke: obj.stroke || '', strokeWidth: obj.strokeWidth || 0,
          rx: obj.rx || 0, ry: obj.ry || 0
        }));
      } else if (obj.type === 'circle') {
        this.canvas.add(new fabric.Circle({
          left: obj.left, top: obj.top, radius: obj.radius,
          fill: obj.fill, stroke: obj.stroke || '', strokeWidth: obj.strokeWidth || 0
        }));
      } else if (obj.type === 'triangle') {
        this.canvas.add(new fabric.Triangle({
          left: obj.left, top: obj.top, width: obj.width, height: obj.height, fill: obj.fill
        }));
      } else if (obj.type === 'text') {
        this.canvas.add(new fabric.IText(obj.text, {
          left: obj.left, top: obj.top, fontSize: obj.fontSize,
          fontFamily: obj.fontFamily, fill: obj.fill, textAlign: obj.align || 'left',
          originX: obj.align === 'center' ? 'center' : 'left'
        }));
      }
    });

    this.canvas.renderAll();
  }

  exportImage(format = 'png', quality = 0.92) {
    // Export at 1.0 multiplier based on actual underlying full canvas resolution
    return this.canvas.toDataURL({
      format: format,
      quality: quality,
      multiplier: 1
    });
  }

  bindEvents() {
    window.addEventListener('resize', () => this.fitToContainer());
  }
                            }
