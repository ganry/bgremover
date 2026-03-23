import { removeBackground } from '@imgly/background-removal';

// DOM
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const processingArea = document.getElementById('processing-area');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const comparisonContainer = document.getElementById('comparison-container');
const imageWrapper = document.getElementById('image-wrapper');
const originalImage = document.getElementById('original-image');
const resultOverlay = document.getElementById('result-overlay');
const resultImage = document.getElementById('result-image');
const sliderHandle = document.getElementById('slider-handle');
const actionsContainer = document.getElementById('actions');
const downloadBtn = document.getElementById('download-btn');
const newImageBtn = document.getElementById('new-image-btn');
const errorContainer = document.getElementById('error-container');
const errorText = document.getElementById('error-text');
const retryBtn = document.getElementById('retry-btn');

// State
let originalFile = null;
let resultBlob = null;
let isProcessing = false;

// ── Upload ──────────────────────────────────────────────

// Prevent browser from opening dropped files
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
  document.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); });
});

uploadArea.addEventListener('dragenter', () => uploadArea.classList.add('drag-over'));
uploadArea.addEventListener('dragleave', (e) => {
  if (!uploadArea.contains(e.relatedTarget)) uploadArea.classList.remove('drag-over');
});
uploadArea.addEventListener('drop', (e) => {
  uploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleFile(file);
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) handleFile(file);
});

// ── Processing ──────────────────────────────────────────

async function handleFile(file) {
  if (isProcessing) return;
  isProcessing = true;
  originalFile = file;

  // Switch to processing view
  uploadArea.classList.add('hidden');
  processingArea.classList.remove('hidden');
  progressContainer.classList.remove('hidden');
  comparisonContainer.classList.add('hidden');
  actionsContainer.classList.add('hidden');
  errorContainer.classList.add('hidden');

  // Show original image
  const originalUrl = URL.createObjectURL(file);
  originalImage.src = originalUrl;
  await originalImage.decode();

  showProgress('Preparing...', 5);

  try {
    resultBlob = await removeBackground(file, {
      progress(key, current, total) {
        if (total <= 0) return;
        const pct = Math.round((current / total) * 100);
        if (key.includes('fetch')) {
          showProgress(`Downloading model... ${pct}%`, 5 + pct * 0.65);
        } else {
          showProgress('Processing image...', 70 + pct * 0.3);
        }
      },
    });

    const resultUrl = URL.createObjectURL(resultBlob);
    resultImage.src = resultUrl;
    await resultImage.decode();

    showProgress('Done!', 100);

    setTimeout(() => {
      progressContainer.classList.add('hidden');
      comparisonContainer.classList.remove('hidden');
      actionsContainer.classList.remove('hidden');
      initSlider();
    }, 400);
  } catch (err) {
    console.error('Background removal failed:', err);
    progressContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorText.textContent = `Error: ${err.message || 'Processing failed. Try a different image.'}`;
  }

  isProcessing = false;
}

function showProgress(text, percent) {
  progressBar.style.width = `${Math.min(percent, 100)}%`;
  progressText.textContent = text;
}

// ── Before/After Slider ─────────────────────────────────

function initSlider() {
  let isDragging = false;

  function updateSlider(clientX) {
    const rect = imageWrapper.getBoundingClientRect();
    let x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = (x / rect.width) * 100;
    resultOverlay.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    sliderHandle.style.left = `${pct}%`;
  }

  // Set initial 50%
  requestAnimationFrame(() => {
    const rect = imageWrapper.getBoundingClientRect();
    updateSlider(rect.left + rect.width / 2);
  });

  // Mouse
  imageWrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSlider(e.clientX);
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) updateSlider(e.clientX);
  });
  document.addEventListener('mouseup', () => isDragging = false);

  // Touch
  imageWrapper.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateSlider(e.touches[0].clientX);
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (isDragging) updateSlider(e.touches[0].clientX);
  });
  document.addEventListener('touchend', () => isDragging = false);
}

// ── Download ────────────────────────────────────────────

downloadBtn.addEventListener('click', () => {
  if (!resultBlob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(resultBlob);
  const baseName = originalFile.name.replace(/\.[^.]+$/, '');
  a.download = `${baseName}-nobg.png`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// ── Reset ───────────────────────────────────────────────

function reset() {
  if (originalImage.src) URL.revokeObjectURL(originalImage.src);
  if (resultImage.src) URL.revokeObjectURL(resultImage.src);
  originalFile = null;
  resultBlob = null;
  fileInput.value = '';

  processingArea.classList.add('hidden');
  comparisonContainer.classList.add('hidden');
  actionsContainer.classList.add('hidden');
  errorContainer.classList.add('hidden');
  progressContainer.classList.remove('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = 'Loading model...';
  uploadArea.classList.remove('hidden');
}

newImageBtn.addEventListener('click', reset);
retryBtn.addEventListener('click', reset);
