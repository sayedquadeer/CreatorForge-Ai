/**
 * UI Application Orchestrator linking Canvas, Inspector & Handlers
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Core Engines
    const engine = new CanvasEngine('thumbnailCanvas');
    const history = new HistoryEngine(engine);

    // 2. Render Template Drawer Cards
    const templatesList = document.getElementById('templatesList');
    if (templatesList && typeof THUMBNAIL_TEMPLATES !== 'undefined') {
        THUMBNAIL_TEMPLATES.forEach(tpl => {
            const card = document.createElement('div');
            card.className = 'template-card-item';
            card.innerHTML = `
                <div class="template-preview-box" style="background: ${tpl.bg};">
                    ${tpl.name}
                </div>
                <span>${tpl.name}</span>
            `;
            card.addEventListener('click', () => {
                loadTemplateIntoCanvas(engine, tpl);
                showToast(`Loaded template: ${tpl.name}`);
            });
            templatesList.appendChild(card);
        });
    }

    // 3. Left Toolbar Navigation Panel Switching
    const toolTabs = document.querySelectorAll('.tool-tab');
    const drawerPanels = document.querySelectorAll('.drawer-panel');
    const toolDrawer = document.getElementById('toolDrawer');

    toolTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-panel');
            toolTabs.forEach(t => t.classList.remove('active'));
            drawerPanels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetPanel = document.getElementById(target);
            if (targetPanel) targetPanel.classList.add('active');

            // Mobile sliding drawer toggling
            if (window.innerWidth <= 992) {
                toolDrawer.classList.add('mobile-open');
            }
        });
    });

    // 4. Text Adders
    document.getElementById('addHeadingBtn')?.addEventListener('click', () => {
        engine.addText('ADD HEAVY HEADING', { fontSize: 60, fontFamily: 'Anton' });
    });
    document.getElementById('addSubheadingBtn')?.addEventListener('click', () => {
        engine.addText('Subheading Text Goes Here', { fontSize: 35, fontFamily: 'Poppins' });
    });
    document.getElementById('addBodyTextBtn')?.addEventListener('click', () => {
        engine.addText('Body caption content detail', { fontSize: 24, fontFamily: 'Inter' });
    });

    // 5. Image File Upload Processing
    const uploadInput = document.getElementById('imageUploadInput');
    uploadInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
            showToast('Unsupported format! Upload PNG, JPG, or WEBP.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (f) => {
            engine.addImageFromURL(f.target.result);
            showToast('Image added to canvas');
            uploadInput.value = ''; // Reset input element state
        };
        reader.readAsDataURL(file);
    });

    // 6. Shape Insert Handlers
    document.querySelectorAll('.shape-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const shapeType = btn.getAttribute('data-shape');
            engine.addShape(shapeType);
        });
    });

    // 7. Background Pickers
    document.getElementById('bgColorPicker')?.addEventListener('input', (e) => {
        engine.canvas.setBackgroundColor(e.target.value, engine.canvas.renderAll.bind(engine.canvas));
    });

    document.querySelectorAll('.grad-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const gradStr = btn.getAttribute('data-grad');
            engine.canvas.setBackgroundColor('#0f172a', engine.canvas.renderAll.bind(engine.canvas));
            showToast('Applied background preset');
        });
    });

    // 8. Dynamic Inspector Properties Sync
    const noSelectionMsg = document.getElementById('noSelectionMsg');
    const activeControlsWrapper = document.getElementById('activeControlsWrapper');
    const textControls = document.getElementById('textControls');
    const imageControls = document.getElementById('imageControls');
    const shapeControls = document.getElementById('shapeControls');
    const propsPanel = document.getElementById('propertiesPanel');

    window.addEventListener('objectSelected', (e) => {
        const obj = e.detail;
        noSelectionMsg?.classList.add('hidden');
        activeControlsWrapper?.classList.remove('hidden');

        textControls?.classList.add('hidden');
        imageControls?.classList.add('hidden');
        shapeControls?.classList.add('hidden');

        // Update Opacity & Generic Controls
        const opacityInput = document.getElementById('opacityInput');
        const opacityVal = document.getElementById('opacityVal');
        if (opacityInput && opacityVal) {
            opacityInput.value = obj.opacity || 1;
            opacityVal.textContent = `${Math.round((obj.opacity || 1) * 100)}%`;
        }

        // Type Specific Inputs Sync
        if (obj.type === 'i-text' || obj.type === 'text') {
            textControls?.classList.remove('hidden');
            document.getElementById('fontFamilySelect').value = obj.fontFamily || 'Inter';
            document.getElementById('fontSizeInput').value = obj.fontSize || 40;
            document.getElementById('textColorPicker').value = obj.fill || '#ffffff';
            document.getElementById('strokeWidthInput').value = obj.strokeWidth || 0;
            document.getElementById('strokeColorPicker').value = obj.stroke || '#000000';
        } else if (obj.type === 'image') {
            imageControls?.classList.remove('hidden');
            document.getElementById('rotationInput').value = Math.round(obj.angle || 0);
        } else if (['rect', 'circle', 'triangle', 'path'].includes(obj.type)) {
            shapeControls?.classList.remove('hidden');
            document.getElementById('shapeFillPicker').value = obj.fill || '#6366f1';
            document.getElementById('shapeBorderWidthInput').value = obj.strokeWidth || 0;
        }

        if (window.innerWidth <= 992) {
            propsPanel?.classList.add('mobile-open');
        }
    });

    window.addEventListener('objectCleared', () => {
        noSelectionMsg?.classList.remove('hidden');
        activeControlsWrapper?.classList.add('hidden');
        propsPanel?.classList.remove('mobile-open');
    });

    // 9. Active Object Mutation Listeners
    document.getElementById('opacityInput')?.addEventListener('input', (e) => {
        const obj = engine.canvas.getActiveObject();
        if (obj) {
            obj.set('opacity', parseFloat(e.target.value));
            document.getElementById('opacityVal').textContent = `${Math.round(e.target.value * 100)}%`;
            engine.canvas.renderAll();
        }
    });

    document.getElementById('fontFamilySelect')?.addEventListener('change', (e) => {
        const obj = engine.canvas.getActiveObject();
        if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
            obj.set('fontFamily', e.target.value);
            engine.canvas.renderAll();
        }
    });

    document.getElementById('fontSizeInput')?.addEventListener('input', (e) => {
        const obj = engine.canvas.getActiveObject();
        if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
            obj.set('fontSize', parseInt(e.target.value, 10));
            engine.canvas.renderAll();
        }
    });

    document.getElementById('textColorPicker')?.addEventListener('input', (e) => {
        const obj = engine.canvas.getActiveObject();
        if (obj) { obj.set('fill', e.target.value); engine.canvas.renderAll(); }
    });

    document.getElementById('strokeColorPicker')?.addEventListener('input', (e) => {
        const obj = engine.canvas.getActiveObject();
        if (obj) { obj.set('stroke', e.target.value); engine.canvas.renderAll(); }
    });

    document.getElementById('strokeWidthInput')?.addEventListener('input', (e) => {
        const obj = engine.canvas.getActiveObject();
        if (obj) { obj.set('strokeWidth', parseInt(e.target.value, 10)); engine.canvas.renderAll(); }
    });

    document.getElementById('shapeFillPicker')?.addEventListener('input', (e) => {
        const obj = engine.canvas.getActiveObject();
        if (obj) { obj.set('fill', e.target.value); engine.canvas.renderAll(); }
    });

    document.getElementById('rotationInput')?.addEventListener('input', (e) => {
        const obj = engine.canvas.getActiveObject();
        if (obj) { obj.set('angle', parseInt(e.target.value, 10)); engine.canvas.renderAll(); }
    });

    // 10. Undo, Redo, Zoom, Layer & Action Buttons
    document.getElementById('undoBtn')?.addEventListener('click', () => history.undo());
    document.getElementById('redoBtn')?.addEventListener('click', () => history.redo());
    
    document.getElementById('bringForwardBtn')?.addEventListener('click', () => engine.bringForward());
    document.getElementById('sendBackwardBtn')?.addEventListener('click', () => engine.sendBackward());
    document.getElementById('bringToFrontBtn')?.addEventListener('click', () => engine.bringToFront());
    document.getElementById('sendToBackBtn')?.addEventListener('click', () => engine.sendToBack());
    
    document.getElementById('duplicateElementBtn')?.addEventListener('click', () => engine.duplicateActive());
    document.getElementById('deleteElementBtn')?.addEventListener('click', () => engine.deleteActive());

    // Zoom Handlers
    let currentZoom = 1.0;
    document.getElementById('zoomInBtn')?.addEventListener('click', () => {
        currentZoom += 0.1;
        engine.setZoom(currentZoom);
        document.getElementById('zoomVal').textContent = `${Math.round(currentZoom * 100)}%`;
    });
    document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
        currentZoom = Math.max(0.3, currentZoom - 0.1);
        engine.setZoom(currentZoom);
        document.getElementById('zoomVal').textContent = `${Math.round(currentZoom * 100)}%`;
    });
    document.getElementById('zoomFitBtn')?.addEventListener('click', () => {
        currentZoom = 1.0;
        engine.setZoom(1.0);
        document.getElementById('zoomVal').textContent = `100%`;
    });

    // 11. Image Export Logic (PNG & JPG)
    const exportDropdownBtn = document.getElementById('exportDropdownBtn');
    const exportMenu = document.getElementById('exportMenu');

    exportDropdownBtn?.addEventListener('click', () => {
        exportMenu?.classList.toggle('hidden');
    });

    document.getElementById('downloadPngBtn')?.addEventListener('click', () => {
        exportMenu?.classList.add('hidden');
        triggerDownload(engine.exportImage('png'), 'creatorforge-youtube-thumbnail.png');
    });

    document.getElementById('downloadJpgBtn')?.addEventListener('click', () => {
        exportMenu?.classList.add('hidden');
        triggerDownload(engine.exportImage('jpeg', 0.9), 'creatorforge-youtube-thumbnail.jpg');
    });

    function triggerDownload(dataUrl, filename) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast(`Exported ${filename}`);
    }

    // 12. Modal Preview Functionality
    const previewBtn = document.getElementById('previewBtn');
    const previewModal = document.getElementById('previewModal');
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const previewImg = document.getElementById('previewImg');

    previewBtn?.addEventListener('click', () => {
        if (previewImg) previewImg.src = engine.exportImage('png');
        previewModal?.classList.remove('hidden');
    });
    closePreviewBtn?.addEventListener('click', () => {
        previewModal?.classList.add('hidden');
    });

    // 13. Global Hotkeys Handling
    window.addEventListener('keydown', (e) => {
        // Prevent hotkey interception during active text field typing
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            engine.deleteActive();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            if (e.shiftKey) { history.redo(); } else { history.undo(); }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
            history.redo();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            engine.duplicateActive();
        }
    });

    // Helper Toast Display Manager
    function showToast(msg) {
        const toast = document.getElementById('toastNotification');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2500);
    }
});
                            
