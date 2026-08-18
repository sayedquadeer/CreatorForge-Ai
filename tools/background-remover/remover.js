document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('dropZone');
  const imageInput = document.getElementById('imageInput');
  const uploadCard = document.getElementById('uploadCard');
  const progressCard = document.getElementById('progressCard');
  const progressBar = document.getElementById('progressBar');
  const progressStatus = document.getElementById('progressStatus');
  const errorCard = document.getElementById('errorCard');
  const errorMessage = document.getElementById('errorMessage');
  const errorRetryBtn = document.getElementById('errorRetryBtn');
  const resultCard = document.getElementById('resultCard');
  
  const originalPreview = document.getElementById('originalPreview');
  const resultPreview = document.getElementById('resultPreview');
  const resultWrapper = document.getElementById('resultWrapper');
  
  const bgOptions = document.querySelectorAll('.bg-option');
  const customColorPicker = document.getElementById('customColorPicker');
  const downloadBtn = document.getElementById('downloadBtn');
  const tryAnotherBtn = document.getElementById('tryAnotherBtn');

  let currentBlob = null;
  let originalFileUrl = null;
  let resultFileUrl = null;

  // Check WebAssembly support
  if (typeof WebAssembly !== "object") {
    showError("WebAssembly Unsupported", "Your browser does not support WebAssembly required for client-side AI processing.");
  }

  // Drag & Drop handlers
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  });

  imageInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  });

  function handleFileSelect(file) {
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      showError("Unsupported Format", "Please upload a valid image file (PNG, JPG, or WEBP).");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showError("File Too Large", "Please select an image smaller than 20MB for browser processing stability.");
      return;
    }

    resetUI();
    uploadCard.classList.add('d-none');
    progressCard.classList.remove('d-none');

    originalFileUrl = URL.createObjectURL(file);
    originalPreview.src = originalFileUrl;

    processBackgroundRemoval(file);
  }

  async function processBackgroundRemoval(file) {
    updateProgress(20, "Loading AI Background Removal Engine...");

    try {
      if (typeof imglyRemoveBackground !== 'function') {
        throw new Error("Background removal library failed to load from CDN.");
      }

      updateProgress(50, "Analyzing image & identifying subjects...");

      // Execute client-side WASM background removal
      const blob = await imglyRemoveBackground(file, {
        progress: (key, current, total) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            updateProgress(Math.min(50 + Math.round(pct / 2), 95), `Processing... ${pct}%`);
          }
        }
      });

      updateProgress(100, "Finalizing transparent image...");

      currentBlob = blob;
      if (resultFileUrl) URL.revokeObjectURL(resultFileUrl);
      resultFileUrl = URL.createObjectURL(blob);
      resultPreview.src = resultFileUrl;

      setTimeout(() => {
        progressCard.classList.add('d-none');
        resultCard.classList.remove('d-none');
      }, 400);

    } catch (err) {
      console.error("BG Remover Error:", err);
      progressCard.classList.add('d-none');
      showError("Processing Failed", err.message || "Could not process image in browser. Try another image or smaller resolution.");
    }
  }

  function updateProgress(percent, statusText) {
    progressBar.style.width = `${percent}%`;
    progressStatus.textContent = statusText;
  }

  function showError(title, msg) {
    document.getElementById('errorTitle').textContent = title;
    errorMessage.textContent = msg;
    errorCard.classList.remove('d-none');
  }

  function resetUI() {
    errorCard.classList.add('d-none');
    resultCard.classList.add('d-none');
    progressCard.classList.add('d-none');
    uploadCard.classList.remove('d-none');
    imageInput.value = '';
    
    // Default background styling back to transparent
    resultWrapper.className = 'preview-container border rounded p-2 checkerboard-bg';
    resultWrapper.style.backgroundColor = '';
    
    bgOptions.forEach(opt => opt.classList.remove('active'));
    document.querySelector('[data-bg="transparent"]').classList.add('active');
  }

  errorRetryBtn.addEventListener('click', resetUI);
  tryAnotherBtn.addEventListener('click', resetUI);

  // Background Options Switcher
  bgOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      bgOptions.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const bgType = btn.getAttribute('data-bg');
      if (bgType === 'transparent') {
        resultWrapper.className = 'preview-container border rounded p-2 checkerboard-bg';
        resultWrapper.style.backgroundColor = '';
      } else if (bgType === 'white') {
        resultWrapper.className = 'preview-container border rounded p-2';
        resultWrapper.style.backgroundColor = '#ffffff';
      } else if (bgType === 'black') {
        resultWrapper.className = 'preview-container border rounded p-2';
        resultWrapper.style.backgroundColor = '#000000';
      }
    });
  });

  customColorPicker.addEventListener('input', (e) => {
    bgOptions.forEach(b => b.classList.remove('active'));
    resultWrapper.className = 'preview-container border rounded p-2';
    resultWrapper.style.backgroundColor = e.target.value;
  });

  // Export Download
  downloadBtn.addEventListener('click', () => {
    if (!currentBlob) return;

    // If background is changed to custom color, draw on canvas before export
    const activeBgBtn = document.querySelector('.bg-option.active');
    const selectedBg = activeBgBtn ? activeBgBtn.getAttribute('data-bg') : 'custom';

    if (selectedBg === 'transparent') {
      triggerDownload(currentBlob, 'creatorforge-transparent.png');
    } else {
      // Export with background color on canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (selectedBg === 'white') ctx.fillStyle = '#ffffff';
        else if (selectedBg === 'black') ctx.fillStyle = '#000000';
        else ctx.fillStyle = customColorPicker.value;

        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((composedBlob) => {
          triggerDownload(composedBlob, `creatorforge-bg-custom.png`);
        }, 'image/png');
      };
      img.src = resultFileUrl;
    }
  });

  function triggerDownload(blob, fileName) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
});
              
