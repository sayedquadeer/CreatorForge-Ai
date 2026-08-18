document.addEventListener('DOMContentLoaded', () => {
  const conversionMode = document.getElementById('conversionMode');
  const jpgQuality = document.getElementById('jpgQuality');
  const qualityVal = document.getElementById('qualityVal');
  const qualityControlContainer = document.getElementById('qualityControlContainer');
  const transparencyWarning = document.getElementById('transparencyWarning');

  const dropZone = document.getElementById('dropZone');
  const imageInput = document.getElementById('imageInput');
  const conversionListCard = document.getElementById('conversionListCard');
  const conversionTableBody = document.getElementById('conversionTableBody');
  const queueCount = document.getElementById('queueCount');

  const convertAllBtn = document.getElementById('convertAllBtn');
  const downloadZipBtn = document.getElementById('downloadZipBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  let fileQueue = [];

  // Update slider display
  jpgQuality.addEventListener('input', (e) => {
    qualityVal.textContent = `${e.target.value}%`;
  });

  // Toggle Mode specific controls
  conversionMode.addEventListener('change', () => {
    if (conversionMode.value === 'PNG_TO_JPG') {
      qualityControlContainer.classList.remove('d-none');
      transparencyWarning.classList.remove('d-none');
    } else {
      qualityControlContainer.classList.add('d-none');
      transparencyWarning.classList.add('d-none');
    }
  });

  // Drag & drop handlers
  ['dragenter', 'dragover'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  });

  imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  });

  function handleFiles(files) {
    const validFiles = files.filter(f => f.type.match(/^image\/(png|jpeg|jpg|webp)$/i));
    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
      const fileId = 'f_' + Math.random().toString(36).substr(2, 9);
      const item = {
        id: fileId,
        file: file,
        originalName: file.name,
        originalSize: formatBytes(file.size),
        status: 'pending',
        convertedBlob: null,
        dimensions: 'Loading...'
      };
      fileQueue.push(item);
    });

    renderQueue();
  }

  function renderQueue() {
    if (fileQueue.length > 0) {
      conversionListCard.classList.remove('d-none');
    } else {
      conversionListCard.classList.add('d-none');
    }

    queueCount.textContent = fileQueue.length;
    conversionTableBody.innerHTML = '';

    fileQueue.forEach(item => {
      const tr = document.createElement('tr');
      
      const objectUrl = URL.createObjectURL(item.file);

      tr.innerHTML = `
        <td><img src="${objectUrl}" class="table-thumb" alt="thumb"></td>
        <td class="text-truncate" style="max-width: 150px;">${item.originalName}</td>
        <td>${item.originalSize}</td>
        <td id="dim_${item.id}">${item.dimensions}</td>
        <td id="size_${item.id}">${item.convertedBlob ? formatBytes(item.convertedBlob.size) : '-'}</td>
        <td id="action_${item.id}">
          <button class="btn btn-primary btn-sm convert-single-btn" data-id="${item.id}">Convert</button>
        </td>
      `;

      conversionTableBody.appendChild(tr);

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        item.dimensions = `${img.naturalWidth} × ${img.naturalHeight} px`;
        const dimEl = document.getElementById(`dim_${item.id}`);
        if (dimEl) dimEl.textContent = item.dimensions;
      };
      img.src = objectUrl;
    });

    // Attach row convert events
    document.querySelectorAll('.convert-single-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        convertItem(id);
      });
    });
  }

  async function convertItem(id) {
    const item = fileQueue.find(i => i.id === id);
    if (!item) return;

    const actionCell = document.getElementById(`action_${id}`);
    actionCell.innerHTML = `<span class="spinner-border spinner-border-sm text-primary"></span>`;

    try {
      const blob = await processImageConversion(item.file);
      item.convertedBlob = blob;
      item.status = 'done';

      document.getElementById(`size_${id}`).textContent = formatBytes(blob.size);

      const downloadUrl = URL.createObjectURL(blob);
      const targetExt = conversionMode.value === 'PNG_TO_JPG' ? 'jpg' : 'png';
      const downloadName = item.originalName.substring(0, item.originalName.lastIndexOf('.')) + `_converted.${targetExt}`;

      actionCell.innerHTML = `
        <a href="${downloadUrl}" download="${downloadName}" class="btn btn-success btn-sm">Download</a>
      `;

      checkAllConverted();
    } catch (err) {
      console.error(err);
      actionCell.innerHTML = `<span class="badge bg-danger">Error</span>`;
    }
  }

  function processImageConversion(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        const isPngToJpg = conversionMode.value === 'PNG_TO_JPG';

        if (isPngToJpg) {
          // Fill solid background for JPG export
          let fillColor = '#ffffff';
          const selectedRadio = document.querySelector('input[name="bgFill"]:checked');
          if (selectedRadio) {
            if (selectedRadio.value === 'custom') {
              fillColor = document.getElementById('bgCustomColor').value;
            } else {
              fillColor = selectedRadio.value;
            }
          }
          ctx.fillStyle = fillColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = isPngToJpg ? 'image/jpeg' : 'image/png';
        const quality = isPngToJpg ? (parseInt(jpgQuality.value, 10) / 100) : 1.0;

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("Canvas conversion failed"));
        }, mimeType, quality);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });
  }

  convertAllBtn.addEventListener('click', async () => {
    for (const item of fileQueue) {
      if (item.status !== 'done') {
        await convertItem(item.id);
      }
    }
  });

  clearAllBtn.addEventListener('click', () => {
    fileQueue = [];
    renderQueue();
    downloadZipBtn.classList.add('d-none');
  });

  function checkAllConverted() {
    const allDone = fileQueue.length > 0 && fileQueue.every(i => i.status === 'done');
    if (allDone && fileQueue.length > 1 && typeof JSZip !== 'undefined') {
      downloadZipBtn.classList.remove('d-none');
    }
  }

  // Batch ZIP Export
  downloadZipBtn.addEventListener('click', async () => {
    if (typeof JSZip === 'undefined') return;

    const zip = new JSZip();
    const targetExt = conversionMode.value === 'PNG_TO_JPG' ? 'jpg' : 'png';

    fileQueue.forEach(item => {
      if (item.convertedBlob) {
        const name = item.originalName.substring(0, item.originalName.lastIndexOf('.')) + `_converted.${targetExt}`;
        zip.file(name, item.convertedBlob);
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = "creatorforge_converted_images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
});
        
