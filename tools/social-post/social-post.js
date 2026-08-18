/**
 * Social Media Post Maker Orchestrator
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new SocialCanvasEngine('postCanvas');
  const history = new CanvasHistoryManager(engine.canvas, (state) => {
    document.getElementById('undoBtn').disabled = !state.canUndo;
    document.getElementById('redoBtn').disabled = !state.canRedo;
  });

  // INITIAL STATE
  history.saveState();
  renderTemplates('all');
  updateCanvasInfoBadge();

  // EVENT: CANVAS OBJECT ACTIONS (For History Tracking)
  engine.canvas.on('object:modified', () => history.saveState());
  engine.canvas.on('object:added', () => updateLayersList());
  engine.canvas.on('object:removed', () => {
    updateLayersList();
    history.saveState();
  });
  engine.canvas.on('selection:created', (e) => handleObjectSelection(e.selected[0]));
  engine.canvas.on('selection:updated', (e) => handleObjectSelection(e.selected[0]));
  engine.canvas.on('selection:cleared', () => handleObjectSelection(null));

  // TABS NAVIGATION
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel-section').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panelId = btn.getAttribute('data-panel');
      document.getElementById(panelId).classList.add('active');
    });
  });

  // FORMAT PRESET CHANGE
  const formatSelect = document.getElementById('formatPresetSelect');
  formatSelect.addEventListener('change', (e) => {
    const hasObjects = engine.canvas.getObjects().length > 0;
    if (hasObjects) {
      if (!confirm('Changing formats will adjust the canvas resolution. Keep existing objects?')) {
        engine.canvas.clear();
      }
    }
    engine.setPreset(e.target.value);
    updateCanvasInfoBadge();
    history.saveState();
  });

  // ZOOM CONTROLS
  document.getElementById('zoomInBtn').addEventListener('click', () => engine.setZoom(engine.zoomLevel + 0.1));
  document.getElementById('zoomOutBtn').addEventListener('click', () => engine.setZoom(engine.zoomLevel - 0.1));
  document.getElementById('zoomFitBtn').addEventListener('click', () => engine.fitToContainer());

  // UNDO / REDO
  document.getElementById('undoBtn').addEventListener('click', () => history.undo());
  document.getElementById('redoBtn').addEventListener('click', () => history.redo());

  // TEXT TOOL ADDITIONS
  document.getElementById('addHeadingBtn').addEventListener('click', () => {
    engine.addText('Heading Text', { fontSize: 64, fontWeight: 'bold' });
    history.saveState();
  });
  document.getElementById('addSubheadingBtn').addEventListener('click', () => {
    engine.addText('Subheading Text', { fontSize: 40, fontWeight: '500' });
    history.saveState();
  });
  document.getElementById('addBodyTextBtn').addEventListener('click', () => {
    engine.addText('Body text goes here...', { fontSize: 28 });
    history.saveState();
  });

  // SHAPES
  document.querySelectorAll('.shape-card').forEach(card => {
    card.addEventListener('click', () => {
      const shapeType = card.getAttribute('data-shape');
      engine.addShape(shapeType);
      history.saveState();
    });
  });

  // IMAGE UPLOAD
  const dropzone = document.getElementById('uploadDropzone');
  const imageInput = document.getElementById('imageFileInput');

  dropzone.addEventListener('click', () => imageInput.click());
  dropzone.addEventListener('dragover', (e) => e.preventDefault());
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  imageInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  });

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Unsupported file type. Please upload a PNG, JPG, or WEBP image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        engine.addImage(img);
        history.saveState();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // BACKGROUND COLOR
  const bgColorPicker = document.getElementById('bgColorPicker');
  bgColorPicker.addEventListener('input', (e) => {
    engine.setBackgroundColor(e.target.value);
  });
  bgColorPicker.addEventListener('change', () => history.saveState());

  document.querySelectorAll('.bg-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      bgColorPicker.value = color;
      engine.setBackgroundColor(color);
      history.saveState();
    });
  });

  // TEMPLATES
  document.getElementById('templateCategorySelect').addEventListener('change', (e) => {
    renderTemplates(e.target.value);
  });

  function renderTemplates(category) {
    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = '';
    const filtered = category === 'all' 
      ? SOCIAL_TEMPLATES 
      : SOCIAL_TEMPLATES.filter(t => t.category === category);

    filtered.forEach(tmpl => {
      const card = document.createElement('div');
      card.className = 'template-item';
      card.innerHTML = `
        <div class="template-thumb" style="background-color: ${tmpl.bg};"></div>
        <div class="template-label">${tmpl.name}</div>
      `;
      card.addEventListener('click', () => {
        if (confirm('Load template? This will replace current canvas content.')) {
          engine.loadTemplate(tmpl);
          history.saveState();
        }
      });
      grid.appendChild(card);
    });
  }

  // PROPERTIES SYNC & CONTROLS
  function handleObjectSelection(obj) {
    const noSel = document.getElementById('noSelectionProps');
    const textProps = document.getElementById('textProps');
    const imgProps = document.getElementById('imageProps');
    const shapeProps = document.getElementById('shapeProps');
    const commonProps = document.getElementById('commonProps');
    const propPanel = document.getElementById('propertiesPanel');

    // Hide all first
    [noSel, textProps, imgProps, shapeProps, commonProps].forEach(el => el.classList.add('hidden'));

    if (!obj) {
      noSel.classList.remove('hidden');
      document.getElementById('propPanelTitle').textContent = 'Canvas Settings';
      propPanel.classList.remove('active');
      return;
    }

    commonProps.classList.remove('hidden');
    propPanel.classList.add('active'); // For mobile drawer

    if (obj.type === 'i-text' || obj.type === 'text') {
      document.getElementById('propPanelTitle').textContent = 'Text Properties';
      textProps.classList.remove('hidden');
      
      document.getElementById('fontFamilySelect').value = obj.fontFamily || 'Inter';
      document.getElementById('fontSizeInput').value = obj.fontSize || 48;
      document.getElementById('textColorPicker').value = obj.fill || '#ffffff';
      document.getElementById('strokeColorPicker').value = obj.stroke || '#000000';
      document.getElementById('strokeWidthInput').value = obj.strokeWidth || 0;
      document.getElementById('opacityInputText').value = obj.opacity !== undefined ? obj.opacity : 1;
    } else if (obj.type === 'image') {
      document.getElementById('propPanelTitle').textContent = 'Image Properties';
      imgProps.classList.remove('hidden');
      document.getElementById('opacityInputImage').value = obj.opacity !== undefined ? obj.opacity : 1;
      document.getElementById('rotationInputImage').value = Math.round(obj.angle || 0);
    } else {
      document.getElementById('propPanelTitle').textContent = 'Shape Properties';
      shapeProps.classList.remove('hidden');
      document.getElementById('shapeFillPicker').value = obj.fill || '#3b82f6';
      document.getElementById('shapeBorderPicker').value = obj.stroke || '#ffffff';
      document.getElementById('shapeBorderWidthInput').value = obj.strokeWidth || 0;
      document.getElementById('opacityInputShape').value = obj.opacity !== undefined ? obj.opacity : 1;
    }
  }

  // PROPERTY BINDINGS - TEXT
  document.getElementById('fontFamilySelect').addEventListener('change', (e) => {
    const active = engine.canvas.getActiveObject();
    if (active) { active.set('fontFamily', e.target.value); engine.canvas.renderAll(); history.saveState(); }
  });
  document.getElementById('fontSizeInput').addEventListener('input', (e) => {
    const active = engine.canvas.getActiveObject();
    if (active) { active.set('fontSize', parseInt(e.target.value, 10)); engine.canvas.renderAll(); }
  });
  document.getElementById('textColorPicker').addEventListener('input', (e) => {
    const active = engine.canvas.getActiveObject();
    if (active) { active.set('fill', e.target.value); engine.canvas.renderAll(); }
  });

  // LAYER ACTIONS
  document.getElementById('btnBringForward').addEventListener('click', () => {
    const active = engine.canvas.getActiveObject();
    if (active) { engine.canvas.bringForward(active); history.saveState(); }
  });
  document.getElementById('btnSendBackward').addEventListener('click', () => {
    const active = engine.canvas.getActiveObject();
    if (active) { engine.canvas.sendBackwards(active); history.saveState(); }
  });
  document.getElementById('btnBringToFront').addEventListener('click', () => {
    const active = engine.canvas.getActiveObject();
    if (active) { engine.canvas.bringToFront(active); history.saveState(); }
  });
  document.getElementById('btnSendToBack').addEventListener('click', () => {
    const active = engine.canvas.getActiveObject();
    if (active) { engine.canvas.sendToBack(active); history.saveState(); }
  });

  document.getElementById('btnDuplicate').addEventListener('click', () => {
    const active = engine.canvas.getActiveObject();
    if (active) {
      active.clone((cloned) => {
        cloned.set({ left: active.left + 20, top: active.top + 20 });
        engine.canvas.add(cloned);
        engine.canvas.setActiveObject(cloned);
        history.saveState();
      });
    }
  });

  document.getElementById('btnDelete').addEventListener('click', () => {
    const active = engine.canvas.getActiveObject();
    if (active) {
      engine.canvas.remove(active);
      engine.canvas.discardActiveObject();
      history.saveState();
    }
  });

  // KEYBOARD SHORTCUTS
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.isContentEditable) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      const active = engine.canvas.getActiveObject();
      if (active) {
        engine.canvas.remove(active);
        engine.canvas.discardActiveObject();
        history.saveState();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) history.redo();
      else history.undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      history.redo();
    }
  });

  // LAYERS LIST PANEL
  function updateLayersList() {
    const list = document.getElementById('layersList');
    list.innerHTML = '';
    const objects = engine.canvas.getObjects().slice().reverse();

    if (objects.length === 0) {
      list.innerHTML = '<li class="empty-layers">No elements on canvas</li>';
      return;
    }

    objects.forEach((obj, idx) => {
      const li = document.createElement('li');
      li.className = 'layer-item';
      if (engine.canvas.getActiveObject() === obj) li.classList.add('selected');

      let name = obj.type.toUpperCase();
      if (obj.type === 'i-text' || obj.type === 'text') name = `Text: "${obj.text.substring(0, 12)}..."`;

      li.innerHTML = `<span>${name}</span><i class="fa-solid fa-eye"></i>`;
      li.addEventListener('click', () => {
        engine.canvas.setActiveObject(obj);
        engine.canvas.renderAll();
      });
      list.appendChild(li);
    });
  }

  // EXPORT DROPDOWN & PREVIEW
  const exportBtn = document.getElementById('exportDropdownBtn');
  const exportMenu = document.getElementById('exportMenu');

  exportBtn.addEventListener('click', () => exportMenu.classList.toggle('hidden'));

  document.getElementById('downloadPngBtn').addEventListener('click', () => downloadDesign('png'));
  document.getElementById('downloadJpgBtn').addEventListener('click', () => downloadDesign('jpeg'));

  function downloadDesign(format) {
    const dataUrl = engine.exportImage(format);
    const link = document.createElement('a');
    const presetKey = document.getElementById('formatPresetSelect').value;
    link.download = `creatorforge-${presetKey}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    link.href = dataUrl;
    link.click();
    exportMenu.classList.add('hidden');
  }

  // PREVIEW MODAL
  const previewBtn = document.getElementById('previewBtn');
  const previewModal = document.getElementById('previewModal');
  const previewImage = document.getElementById('previewImage');
  const closePreviewBtn = document.getElementById('closePreviewBtn');

  previewBtn.addEventListener('click', () => {
    previewImage.src = engine.exportImage('png');
    previewModal.classList.remove('hidden');
  });

  closePreviewBtn.addEventListener('click', () => previewModal.classList.add('hidden'));
  document.getElementById('previewDownloadPng').addEventListener('click', () => downloadDesign('png'));

  // MOBILE CLOSE PANEL
  document.getElementById('closeMobilePropBtn').addEventListener('click', () => {
    document.getElementById('propertiesPanel').classList.remove('active');
  });

  function updateCanvasInfoBadge() {
    const badge = document.getElementById('canvasDimInfo');
    if (badge) {
      badge.textContent = `Preset: ${engine.currentPreset.name} (${engine.currentPreset.width} × ${engine.currentPreset.height} px)`;
    }
  }
});
  
