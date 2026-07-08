// Standalone Multi-Language Text Extractor Engine
// Built for free tools lovers. Runs fully client-side.

// Application States
let queue = [];
let activeItemId = null;
let languageHint = 'Auto';
let keepLayout = false;
let imageZoom = 100;

// Elements references
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const selectFilesBtn = document.getElementById('select-files-btn');
const queueList = document.getElementById('queue-list');
const bulkActionsPanel = document.getElementById('bulk-actions-panel');
const queueTotalCount = document.getElementById('queue-total-count');
const badgePending = document.getElementById('badge-pending');
const badgePendingText = document.getElementById('badge-pending-text');
const badgeCompleted = document.getElementById('badge-completed');
const badgeCompletedText = document.getElementById('badge-completed-text');
const badgeFailed = document.getElementById('badge-failed');
const badgeFailedText = document.getElementById('badge-failed-text');
const clearQueueBtn = document.getElementById('clear-queue-btn');
const processAllBtn = document.getElementById('process-all-btn');
const processAllBtnText = document.getElementById('process-all-btn-text');
const downloadAllBtn = document.getElementById('download-all-btn');

// Viewport Elements
const activeSourceImg = document.getElementById('active-source-img');
const noImagePlaceholder = document.getElementById('no-image-placeholder');
const imageContainer = document.getElementById('image-container');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomResetBtn = document.getElementById('zoom-reset-btn');
const zoomPercentageLabel = document.getElementById('zoom-percentage-label');

// Extracted Workspace Elements
const metaLangBadge = document.getElementById('meta-lang-badge');
const metaConfidenceBadge = document.getElementById('meta-confidence-badge');
const metaNotesPanel = document.getElementById('meta-notes-panel');
const metaNotesText = document.getElementById('meta-notes-text');
const searchInput = document.getElementById('search-input');
const extractedTextarea = document.getElementById('extracted-textarea');
const alignLtrBtn = document.getElementById('align-ltr-btn');
const alignRtlBtn = document.getElementById('align-rtl-btn');
const ttsSpeakBtn = document.getElementById('tts-speak-btn');
const ttsIcon = document.getElementById('tts-icon');
const ttsBtnText = document.getElementById('tts-btn-text');
const copyTextBtn = document.getElementById('copy-text-btn');
const copyBtnText = document.getElementById('copy-btn-text');
const copyIcon = document.getElementById('copy-icon');
const downloadSingleBtn = document.getElementById('download-single-btn');
const resultsWorkspace = document.getElementById('results-workspace');
const emptyWorkspacePanel = document.getElementById('empty-workspace-panel');

// Modals Elements
const settingsModal = document.getElementById('settings-modal');
const settingsTrigger = document.getElementById('settings-trigger');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
const saveKeyBtn = document.getElementById('save-key-btn');
const clearKeyBtn = document.getElementById('clear-key-btn');
const clearKeySpacer = document.getElementById('clear-key-spacer');
const apiKeyInput = document.getElementById('api-key-input');
const toggleKeyVisibilityBtn = document.getElementById('toggle-key-visibility-btn');
const apiStatusBadge = document.getElementById('api-status-badge');
const apiStatusText = document.getElementById('api-status-text');
const apiStatusIcon = document.getElementById('api-status-icon');

const downloadModal = document.getElementById('download-modal');
const closeDownloadBtn = document.getElementById('close-download-btn');
const cancelDownloadBtn = document.getElementById('cancel-download-btn');
const executeDownloadBtn = document.getElementById('execute-download-btn');
const executeDownloadText = document.getElementById('execute-download-text');
const downloadPagesList = document.getElementById('download-pages-list');
const selectAllDownloadsBtn = document.getElementById('select-all-downloads-btn');
const downloadCopyAllBtn = document.getElementById('download-copy-all-btn');

// --- INITIALIZE & CREDENTIALS ---

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();
  
  // Check API Key
  updateApiKeyBadge();
  
  // Bind preferences hints
  document.querySelectorAll('.pref-hint-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.pref-hint-btn').forEach(b => {
        b.className = 'pref-hint-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white/40 border border-white/30 text-indigo-950 hover:bg-white/60';
      });
      btn.className = 'pref-hint-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-indigo-600 text-white shadow-sm';
      languageHint = btn.getAttribute('data-hint');
    });
  });

  // Bind layout toggle
  const keepLayoutToggle = document.getElementById('keep-layout-toggle');
  const keepLayoutToggleDot = document.getElementById('keep-layout-toggle-dot');
  keepLayoutToggle.addEventListener('click', () => {
    keepLayout = !keepLayout;
    if (keepLayout) {
      keepLayoutToggle.className = 'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-indigo-600 border border-indigo-500';
      keepLayoutToggleDot.className = 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-5';
    } else {
      keepLayoutToggle.className = 'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-white/30 border border-white/20';
      keepLayoutToggleDot.className = 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-0';
    }
  });

  // Zoom control triggers
  zoomInBtn.addEventListener('click', () => adjustZoom(10));
  zoomOutBtn.addEventListener('click', () => adjustZoom(-10));
  zoomResetBtn.addEventListener('click', () => {
    imageZoom = 100;
    updateZoom();
  });

  // Sample Documents templates
  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleLang = btn.getAttribute('data-sample');
      loadSampleDocument(sampleLang);
    });
  });

  // Sync textarea updates to state
  extractedTextarea.addEventListener('input', (e) => {
    if (!activeItemId) return;
    const item = queue.find(q => q.id === activeItemId);
    if (item && item.result) {
      item.result.extractedText = e.target.value;
    }
  });

  // Alignment triggers
  alignLtrBtn.addEventListener('click', () => setAlignment('ltr'));
  alignRtlBtn.addEventListener('click', () => setAlignment('rtl'));

  // TTS speak trigger
  ttsSpeakBtn.addEventListener('click', handleTts);

  // Copy trigger
  copyTextBtn.addEventListener('click', handleCopyText);

  // Single download trigger
  downloadSingleBtn.addEventListener('click', handleDownloadSingle);
});

// --- API KEY MODAL LOGIC ---

let showKey = false;

settingsTrigger.addEventListener('click', () => {
  const savedKey = localStorage.getItem('gemini_api_key') || '';
  apiKeyInput.value = savedKey;
  showKey = false;
  apiKeyInput.type = 'password';
  updateEyeIcon();
  
  if (savedKey) {
    clearKeyBtn.classList.remove('hidden');
    clearKeySpacer.classList.add('hidden');
  } else {
    clearKeyBtn.classList.add('hidden');
    clearKeySpacer.classList.remove('hidden');
  }
  
  settingsModal.classList.remove('hidden');
});

const closeSettings = () => {
  settingsModal.classList.add('hidden');
};

closeSettingsBtn.addEventListener('click', closeSettings);
cancelSettingsBtn.addEventListener('click', closeSettings);

toggleKeyVisibilityBtn.addEventListener('click', () => {
  showKey = !showKey;
  apiKeyInput.type = showKey ? 'text' : 'password';
  updateEyeIcon();
});

function updateEyeIcon() {
  const iconName = showKey ? 'eye-off' : 'eye';
  toggleKeyVisibilityBtn.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4 text-indigo-950/60"></i>`;
  lucide.createIcons();
}

saveKeyBtn.addEventListener('click', () => {
  const value = apiKeyInput.value.trim();
  if (value) {
    localStorage.setItem('gemini_api_key', value);
  } else {
    localStorage.removeItem('gemini_api_key');
  }
  updateApiKeyBadge();
  closeSettings();
});

clearKeyBtn.addEventListener('click', () => {
  localStorage.removeItem('gemini_api_key');
  apiKeyInput.value = '';
  updateApiKeyBadge();
  closeSettings();
});

function updateApiKeyBadge() {
  const savedKey = localStorage.getItem('gemini_api_key') || '';
  if (savedKey) {
    apiStatusBadge.className = 'flex items-center gap-2 px-3.5 py-2 bg-emerald-50/60 border border-emerald-200/60 rounded-xl shadow-xs';
    apiStatusText.innerText = 'Gemini Key Active';
    apiStatusText.className = 'text-xs font-bold text-emerald-800';
    apiStatusIcon.outerHTML = '<i data-lucide="check-circle-2" id="api-status-icon" class="w-4 h-4 text-emerald-600"></i>';
  } else {
    apiStatusBadge.className = 'flex items-center gap-2 px-3.5 py-2 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl shadow-xs';
    apiStatusText.innerText = 'Gemini Key Missing';
    apiStatusText.className = 'text-xs font-bold text-rose-600';
    apiStatusIcon.outerHTML = '<i data-lucide="x-circle" id="api-status-icon" class="w-4 h-4 text-rose-600"></i>';
  }
  lucide.createIcons();
}

// --- FILE DRAG & DROP LOGIC ---

selectFilesBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFilesSelected(e.target.files);
    fileInput.value = ''; // Reset
  }
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-indigo-500', 'bg-white/30');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('border-indigo-500', 'bg-white/30');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-indigo-500', 'bg-white/30');
  if (e.dataTransfer.files.length > 0) {
    handleFilesSelected(e.dataTransfer.files);
  }
});

async function handleFilesSelected(files) {
  const validImages = Array.from(files).filter(file => file.type.startsWith('image/'));
  if (validImages.length === 0) {
    alert('Please select valid image files (PNG, JPG, WebP).');
    return;
  }

  const prevLength = queue.length;

  for (const file of validImages) {
    try {
      const base64Data = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      
      const queueItem = {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: file.size,
        previewUrl,
        base64Data,
        mimeType: file.type,
        status: 'pending',
        progress: 0,
        result: null,
        error: null
      };
      
      queue.push(queueItem);
    } catch (err) {
      console.error("Error reading file:", err);
    }
  }

  // Select the first uploaded item if nothing was active
  if (queue.length > 0 && activeItemId === null) {
    activeItemId = queue[prevLength].id;
  }

  renderQueue();
  updateWorkspace();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const resultString = reader.result;
      const base64 = resultString.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// --- LOAD SAMPLES ---

function loadSampleDocument(lang) {
  let name = "sample_urdu_text.png";
  let base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  let mime = "image/png";

  if (lang === "urdu") {
    name = "sample_urdu_nastaliq.png";
    languageHint = "Urdu";
  } else if (lang === "arabic") {
    name = "sample_arabic_naskh.png";
    languageHint = "Arabic";
  } else {
    name = "sample_english_invoice.png";
    languageHint = "English";
  }

  // Update hints buttons to sync UI
  document.querySelectorAll('.pref-hint-btn').forEach(btn => {
    const btnHint = btn.getAttribute('data-hint');
    if (btnHint === languageHint) {
      btn.className = 'pref-hint-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-indigo-600 text-white shadow-sm';
    } else {
      btn.className = 'pref-hint-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white/40 border border-white/30 text-indigo-950 hover:bg-white/60';
    }
  });

  const previewUrl = `data:${mime};base64,${base64}`;
  const sampleId = `sample-${lang}-${Date.now()}`;

  const sampleItem = {
    id: sampleId,
    name,
    size: 15420,
    previewUrl,
    base64Data: base64,
    mimeType: mime,
    status: 'pending',
    progress: 0,
    result: null,
    error: null
  };

  queue.push(sampleItem);
  activeItemId = sampleId;

  renderQueue();
  updateWorkspace();
}

// --- RENDER QUEUE LIST ---

function renderQueue() {
  if (queue.length === 0) {
    bulkActionsPanel.classList.add('hidden');
    queueList.innerHTML = `
      <div class="text-center py-10 bg-white/10 rounded-2xl border border-white/20">
        <p class="text-xs font-bold text-indigo-950/40">Queue is empty</p>
      </div>
    `;
    return;
  }

  bulkActionsPanel.classList.remove('hidden');
  queueTotalCount.innerText = queue.length;

  const pending = queue.filter(q => q.status === 'pending').length;
  const completed = queue.filter(q => q.status === 'completed').length;
  const failed = queue.filter(q => q.status === 'failed').length;

  // Render stats badges
  if (pending > 0) {
    badgePending.classList.remove('hidden');
    badgePendingText.innerText = `${pending} Pending`;
  } else {
    badgePending.classList.add('hidden');
  }

  if (completed > 0) {
    badgeCompleted.classList.remove('hidden');
    badgeCompletedText.innerText = `${completed} Done`;
  } else {
    badgeCompleted.classList.add('hidden');
  }

  if (failed > 0) {
    badgeFailed.classList.remove('hidden');
    badgeFailedText.innerText = `${failed} Failed`;
  } else {
    badgeFailed.classList.add('hidden');
  }

  // Update process all pending buttons
  if (pending > 0 || failed > 0) {
    processAllBtn.classList.remove('hidden');
    processAllBtnText.innerText = `Process All (${pending + failed})`;
  } else {
    processAllBtn.classList.add('hidden');
  }

  if (completed > 0) {
    downloadAllBtn.classList.remove('hidden');
  } else {
    downloadAllBtn.classList.add('hidden');
  }

  queueList.innerHTML = queue.map(item => {
    const isActive = item.id === activeItemId;
    let statusBadge = '';
    let playBtnDisabled = false;
    let progressBg = 'bg-slate-200';
    let progressFillBg = 'bg-indigo-600';

    if (item.status === 'processing') {
      statusBadge = `
        <span class="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
          Processing ${item.progress}%
        </span>
      `;
      playBtnDisabled = true;
      progressFillBg = 'bg-indigo-600';
    } else if (item.status === 'completed') {
      statusBadge = `
        <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Ready
        </span>
      `;
      progressFillBg = 'bg-emerald-500';
    } else if (item.status === 'failed') {
      statusBadge = `
        <span class="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200" title="${item.error || 'Extraction failed'}">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          Failed
        </span>
      `;
      progressFillBg = 'bg-rose-500';
    } else {
      statusBadge = `
        <span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-white/40 px-2 py-0.5 rounded-full border border-white/40">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Pending
        </span>
      `;
    }

    const itemSizeKB = (item.size / 1024).toFixed(1);

    return `
      <div
        data-id="${item.id}"
        class="queue-item-element p-3 rounded-2xl flex items-center justify-between gap-4 transition-all duration-200 shadow-sm border cursor-pointer ${
          isActive 
            ? 'glass-card-active border-indigo-400/40' 
            : 'glass-panel hover:bg-white/50 border-white/40'
        }"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <!-- Thumbnail -->
          <div class="w-12 h-12 rounded-xl overflow-hidden bg-white/40 border border-white/50 shrink-0 flex items-center justify-center relative shadow-inner">
            <img src="${item.previewUrl}" alt="Thumbnail" class="w-full h-full object-cover" />
            ${item.status === 'processing' ? `
              <div class="absolute inset-0 bg-indigo-950/20 flex items-center justify-center">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ` : ''}
          </div>

          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-xs font-bold text-indigo-950 truncate max-w-[150px] sm:max-w-xs" title="${item.name}">
                ${item.name}
              </h4>
              <span class="text-[10px] font-medium text-slate-500 font-mono shrink-0">${itemSizeKB} KB</span>
            </div>

            <!-- Progress Bar / Status Row -->
            <div class="flex items-center justify-between gap-3">
              ${statusBadge}
            </div>

            ${item.status === 'processing' ? `
              <div class="w-full h-1 bg-white/40 rounded-full overflow-hidden border border-white/20 mt-1">
                <div class="h-full ${progressFillBg} transition-all duration-300" style="width: ${item.progress}%"></div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Action Items Buttons -->
        <div class="flex items-center gap-1 shrink-0">
          ${item.status !== 'completed' ? `
            <button
              type="button"
              data-action="process"
              data-id="${item.id}"
              ${playBtnDisabled ? 'disabled' : ''}
              class="process-single-btn p-2 rounded-xl text-indigo-950 hover:bg-indigo-600 hover:text-white border border-transparent hover:border-indigo-200 hover:shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-indigo-950"
              title="Extract Text"
            >
              <i data-lucide="play" class="w-3.5 h-3.5"></i>
            </button>
          ` : `
            <button
              type="button"
              data-action="view"
              data-id="${item.id}"
              class="view-single-btn p-2 rounded-xl text-indigo-950 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent transition-all cursor-pointer"
              title="View OCR Results"
            >
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            </button>
          `}

          <button
            type="button"
            data-action="delete"
            data-id="${item.id}"
            class="delete-single-btn p-2 rounded-xl text-indigo-950 hover:bg-rose-500/10 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
            title="Remove File"
          >
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();

  // Bind queue single click selecting
  document.querySelectorAll('.queue-item-element').forEach(el => {
    el.addEventListener('click', (e) => {
      // Check if clicked button actions
      if (e.target.closest('button')) return;
      
      const id = el.getAttribute('data-id');
      activeItemId = id;
      renderQueue();
      updateWorkspace();
    });
  });

  // Bind individual queue triggers
  document.querySelectorAll('.process-single-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      handleProcess(id);
    });
  });

  document.querySelectorAll('.view-single-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      activeItemId = id;
      renderQueue();
      updateWorkspace();
    });
  });

  document.querySelectorAll('.delete-single-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      handleDeleteSingle(id);
    });
  });
}

// --- QUEUE ACTIONS ---

function handleDeleteSingle(id) {
  queue = queue.filter(q => q.id !== id);
  if (activeItemId === id) {
    activeItemId = queue.length > 0 ? queue[0].id : null;
  }
  renderQueue();
  updateWorkspace();
}

clearQueueBtn.addEventListener('click', () => {
  queue = [];
  activeItemId = null;
  renderQueue();
  updateWorkspace();
});

processAllBtn.addEventListener('click', async () => {
  const pendings = queue.filter(q => q.status === 'pending' || q.status === 'failed');
  if (pendings.length === 0) return;
  
  // Process all in parallel
  await Promise.all(pendings.map(item => handleProcess(item.id)));
});

// --- GOOGLE GEMINI CLIENT-SIDE OCR ENGINE ---

async function handleProcess(id) {
  const item = queue.find(q => q.id === id);
  if (!item) return;

  // Set processing state
  item.status = 'processing';
  item.progress = 10;
  item.error = null;
  renderQueue();

  // Progress simulation interval
  const interval = setInterval(() => {
    if (item.status === 'processing' && item.progress < 90) {
      item.progress += Math.floor(Math.random() * 12) + 4;
      renderQueue();
    }
  }, 400);

  try {
    const apiKey = localStorage.getItem('gemini_api_key') || '';
    if (!apiKey) {
      throw new Error("Google AI Studio API Key is required. Please add it via the settings gear button above.");
    }

    // Standard Gemini 2.5 Flash Endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Prepare languages rules
    let langInstruction = "Ensure high accuracy for English, Urdu, and Arabic text.";
    if (languageHint === "Urdu") {
      langInstruction = "The text is primarily in Urdu. Pay close attention to the Urdu Nastaliq calligraphy script, ensuring correct reading order from right to left, preserving Urdu-specific diacritics, ligatures, and punctuation.";
    } else if (languageHint === "Arabic") {
      langInstruction = "The text is primarily in Arabic. Pay close attention to standard Arabic Naskh script, ensuring correct reading order from right to left, preserving Arabic vocalization marks (harakat) and standard ligatures.";
    } else if (languageHint === "English") {
      langInstruction = "The text is primarily in English (Left-to-Right). Ensure correct spacing, characters, and formatting.";
    }

    const layoutInstruction = keepLayout
      ? "Preserve the physical layout, structural columns, line alignments, and relative positioning of the text block as closely as possible."
      : "Extract the text in a natural continuous reading flow, combining lines into legible, coherent paragraphs.";

    const promptText = `Perform high-fidelity Optical Character Recognition (OCR) on the attached image.
Linguistic focus: ${langInstruction}
Layout rule: ${layoutInstruction}

Extract ALL text without translating it. Maintain original spellings, characters, and sentence boundaries.
Return response strictly in JSON schema format containing fields: extractedText (string), primaryLanguage (string), direction (string: ltr or rtl), confidence (string: High, Medium, Low), and notes (string).`;

    // Package Payload for Gemini Multi-modal API
    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: item.mimeType,
                data: item.base64Data
              }
            },
            {
              text: promptText
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            extractedText: { type: "STRING" },
            primaryLanguage: { type: "STRING" },
            direction: { type: "STRING" },
            confidence: { type: "STRING" },
            notes: { type: "STRING" }
          },
          required: ["extractedText", "primaryLanguage", "direction", "confidence"]
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    clearInterval(interval);

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("API returned empty candidates content.");
    }

    const ocrResult = JSON.parse(candidateText.trim());
    
    item.status = 'completed';
    item.progress = 100;
    item.result = ocrResult;
    item.error = null;
  } catch (error) {
    clearInterval(interval);
    console.error("Client OCR Extraction failure:", error);
    item.status = 'failed';
    item.progress = 0;
    item.error = error.message || "Failed to parse API request.";
  }

  renderQueue();
  updateWorkspace();
}

// --- DETAILED WORKSPACE UPDATES ---

function updateWorkspace() {
  const item = queue.find(q => q.id === activeItemId);
  
  if (!item) {
    resultsWorkspace.classList.add('hidden');
    emptyWorkspacePanel.classList.remove('hidden');
    return;
  }

  resultsWorkspace.classList.remove('hidden');
  emptyWorkspacePanel.classList.add('hidden');

  // Load image preview in reference panel
  activeSourceImg.src = item.previewUrl;
  activeSourceImg.classList.remove('hidden');
  noImagePlaceholder.classList.add('hidden');

  // Reset viewport state
  imageZoom = 100;
  updateZoom();

  // Reset speak speech Synthesis
  window.speechSynthesis.cancel();
  updateSpeakButton(false);

  // Load OCR results
  if (item.status === 'completed' && item.result) {
    extractedTextarea.value = item.result.extractedText;
    extractedTextarea.disabled = false;

    // Show meta descriptors
    metaLangBadge.innerText = item.result.primaryLanguage || "Detected";
    metaConfidenceBadge.innerText = `${item.result.confidence || "High"} Confidence`;
    
    if (item.result.confidence === 'Low') {
      metaConfidenceBadge.className = 'inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-800 border border-rose-500/25 shadow-xs';
    } else if (item.result.confidence === 'Medium') {
      metaConfidenceBadge.className = 'inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/25 shadow-xs';
    } else {
      metaConfidenceBadge.className = 'inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/25 shadow-xs';
    }

    if (item.result.notes) {
      metaNotesText.innerText = item.result.notes;
      metaNotesPanel.classList.remove('hidden');
    } else {
      metaNotesPanel.classList.add('hidden');
    }

    setAlignment(item.result.direction === 'rtl' ? 'rtl' : 'ltr');
  } else {
    // Empty state or processing
    metaNotesPanel.classList.add('hidden');
    metaLangBadge.innerText = "Processing...";
    metaConfidenceBadge.className = 'inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-slate-500/15 text-slate-700 border border-slate-500/25 shadow-xs';
    metaConfidenceBadge.innerText = "Awaiting OCR";
    
    if (item.status === 'processing') {
      extractedTextarea.value = `Document processing: Gemini is running Optical Character Recognition and structural layout analysis on ${item.name}...`;
    } else if (item.status === 'failed') {
      extractedTextarea.value = `❌ OCR TRANSCRIPTION FAILED\n\nReason:\n${item.error || 'An unexpected API failure occurred.'}\n\nTroubleshooting tips:\n1. Verify your Google AI Studio API key in settings.\n2. Ensure your device is connected to the internet.\n3. Make sure the file format is supported and readable.`;
    } else {
      extractedTextarea.value = `Double click 'Play' next to ${item.name} to start processing.`;
    }
    extractedTextarea.disabled = true;
    setAlignment('ltr');
  }
}

// --- IMAGE VIEWPORT CONTROLS ---

function adjustZoom(amount) {
  imageZoom = Math.max(40, Math.min(300, imageZoom + amount));
  updateZoom();
}

function updateZoom() {
  imageContainer.style.transform = `scale(${imageZoom / 100})`;
  zoomPercentageLabel.innerText = `${imageZoom}%`;
  
  zoomOutBtn.disabled = imageZoom <= 40;
  zoomInBtn.disabled = imageZoom >= 300;
}

// --- TEXT ALIGNMENT SETTINGS ---

function setAlignment(dir) {
  if (dir === 'rtl') {
    extractedTextarea.style.direction = 'rtl';
    extractedTextarea.style.textAlign = 'right';
    
    alignRtlBtn.className = 'p-2 rounded-xl transition-all cursor-pointer bg-indigo-600 text-white shadow-md font-bold';
    alignLtrBtn.className = 'p-2 rounded-xl transition-all cursor-pointer hover:bg-white/50 text-indigo-950 border border-white/20';
  } else {
    extractedTextarea.style.direction = 'ltr';
    extractedTextarea.style.textAlign = 'left';
    
    alignLtrBtn.className = 'p-2 rounded-xl transition-all cursor-pointer bg-indigo-600 text-white shadow-md font-bold';
    alignRtlBtn.className = 'p-2 rounded-xl transition-all cursor-pointer hover:bg-white/50 text-indigo-950 border border-white/20';
  }
}

// --- KEYWORD SEARCH FILTER ---

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const text = extractedTextarea.value;
  if (!query) {
    // Clear styles
    extractedTextarea.style.background = 'transparent';
    return;
  }

  // Visual cues: count matching terms
  const index = text.toLowerCase().indexOf(query);
  if (index !== -1) {
    // Soft indicator highlight background
    extractedTextarea.style.background = 'rgba(99, 102, 241, 0.05)';
  } else {
    extractedTextarea.style.background = 'rgba(239, 68, 68, 0.03)';
  }
});

// --- TEXT TO SPEECH (TTS) ENGINE ---

let isSpeaking = false;

function handleTts() {
  const text = extractedTextarea.value.trim();
  if (!text) return;

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    updateSpeakButton(false);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Detect voice language hints
  const activeItem = queue.find(q => q.id === activeItemId);
  if (activeItem?.result?.primaryLanguage) {
    const lang = activeItem.result.primaryLanguage.toLowerCase();
    if (lang.includes('urdu')) {
      utterance.lang = 'ur-PK';
    } else if (lang.includes('arabic')) {
      utterance.lang = 'ar-SA';
    } else {
      utterance.lang = 'en-US';
    }
  }

  utterance.onstart = () => {
    updateSpeakButton(true);
  };

  utterance.onend = () => {
    updateSpeakButton(false);
  };

  utterance.onerror = () => {
    updateSpeakButton(false);
  };

  window.speechSynthesis.speak(utterance);
}

function updateSpeakButton(speaking) {
  isSpeaking = speaking;
  if (speaking) {
    ttsBtnText.innerText = 'Pause Listening';
    ttsSpeakBtn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-xs transition-all cursor-pointer';
    ttsIcon.outerHTML = `<i data-lucide="square" id="tts-icon" class="w-4 h-4 text-rose-600"></i>`;
  } else {
    ttsBtnText.innerText = 'Listen (TTS)';
    ttsSpeakBtn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer bg-white/50 text-indigo-950 border-white/40 hover:bg-white/70 shadow-xs';
    ttsIcon.outerHTML = `<i data-lucide="volume-2" id="tts-icon" class="w-4 h-4 text-indigo-600"></i>`;
  }
  lucide.createIcons();
}

// --- SINGLE DOWNLOADING ---

function handleDownloadSingle() {
  const text = extractedTextarea.value.trim();
  if (!text) return;

  const item = queue.find(q => q.id === activeItemId);
  const baseName = item ? item.name.split('.')[0] : 'transcribed';
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${baseName}_extracted.txt`;
  link.click();
  
  URL.revokeObjectURL(url);
}

// --- COPY TO CLIPBOARD ---

function handleCopyText() {
  const text = extractedTextarea.value.trim();
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    copyBtnText.innerText = 'Copied!';
    copyTextBtn.className = 'px-4 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer';
    copyIcon.outerHTML = `<i data-lucide="check" id="copy-icon" class="w-3.5 h-3.5 text-emerald-600"></i>`;
    lucide.createIcons();
    
    setTimeout(() => {
      copyBtnText.innerText = 'Copy to Clipboard';
      copyTextBtn.className = 'px-4 py-2.5 bg-white/50 hover:bg-white/70 text-indigo-950 border border-white/40 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer';
      copyIcon.outerHTML = `<i data-lucide="copy" id="copy-icon" class="w-3.5 h-3.5 text-indigo-600"></i>`;
      lucide.createIcons();
    }, 1500);
  }).catch(err => {
    console.error('Copy failed:', err);
  });
}

// --- DOWNLOAD MODAL TRIGGERS ---

let selectedDownloadIds = [];
let currentDownloadFormat = 'combined';

downloadAllBtn.addEventListener('click', () => {
  const completedItems = queue.filter(q => q.status === 'completed');
  if (completedItems.length === 0) return;

  selectedDownloadIds = completedItems.map(q => q.id);
  renderDownloadModalPages(completedItems);
  
  downloadModal.classList.remove('hidden');
});

const closeDownload = () => {
  downloadModal.classList.add('hidden');
};

closeDownloadBtn.addEventListener('click', closeDownload);
cancelDownloadBtn.addEventListener('click', closeDownload);

function renderDownloadModalPages(completedItems) {
  downloadPagesList.innerHTML = completedItems.map(item => {
    const isChecked = selectedDownloadIds.includes(item.id);
    return `
      <label class="flex items-center gap-3 p-2 hover:bg-indigo-50/50 rounded-xl transition-colors cursor-pointer text-xs font-semibold text-indigo-950">
        <input
          type="checkbox"
          class="download-page-checkbox rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500/20"
          value="${item.id}"
          ${isChecked ? 'checked' : ''}
        />
        <div class="truncate flex-1">
          <span class="font-bold font-mono text-[10px] text-indigo-600 bg-white/50 border border-indigo-100 px-1.5 py-0.5 rounded mr-1">${item.result?.primaryLanguage || 'OCR'}</span>
          <span>${item.name}</span>
        </div>
      </label>
    `;
  }).join('');

  // Bind checkbox changes
  document.querySelectorAll('.download-page-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const id = e.target.value;
      if (e.target.checked) {
        if (!selectedDownloadIds.includes(id)) {
          selectedDownloadIds.push(id);
        }
      } else {
        selectedDownloadIds = selectedDownloadIds.filter(x => x !== id);
      }
      
      updateSelectAllText();
    });
  });

  updateSelectAllText();
}

function updateSelectAllText() {
  const completedItems = queue.filter(q => q.status === 'completed');
  if (selectedDownloadIds.length === completedItems.length) {
    selectAllDownloadsBtn.innerText = 'Deselect All';
  } else {
    selectAllDownloadsBtn.innerText = 'Select All';
  }

  // Update button enabled state
  executeDownloadBtn.disabled = selectedDownloadIds.length === 0;
  executeDownloadBtn.className = selectedDownloadIds.length === 0
    ? 'px-5 py-2.5 bg-slate-200 border border-slate-300 text-slate-400 font-bold text-xs rounded-xl shadow-none cursor-not-allowed flex items-center gap-1.5'
    : 'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer';
}

selectAllDownloadsBtn.addEventListener('click', () => {
  const completedItems = queue.filter(q => q.status === 'completed');
  if (selectedDownloadIds.length === completedItems.length) {
    // Deselect all
    selectedDownloadIds = [];
  } else {
    // Select all
    selectedDownloadIds = completedItems.map(q => q.id);
  }
  
  // Re-sync UI checkboxes
  document.querySelectorAll('.download-page-checkbox').forEach(chk => {
    chk.checked = selectedDownloadIds.includes(chk.value);
  });

  updateSelectAllText();
});

// Bind Format selection cards
document.querySelectorAll('.download-format-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.download-format-card').forEach(c => {
      c.className = 'download-format-card p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 bg-white/20 border-white/30 hover:bg-white/40';
      c.querySelector('.format-radio').className = 'format-radio w-3.5 h-3.5 rounded-full border border-indigo-900/30 flex items-center justify-center';
      c.querySelector('.format-radio div').classList.add('hidden');
    });

    card.className = 'download-format-card p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 bg-white/80 border-indigo-600 shadow-md ring-1 ring-indigo-500/30';
    card.querySelector('.format-radio').className = 'format-radio w-3.5 h-3.5 rounded-full border border-indigo-600 bg-indigo-600 flex items-center justify-center';
    card.querySelector('.format-radio div').classList.remove('hidden');

    currentDownloadFormat = card.getAttribute('data-format');
  });
});

// Download button triggers execution
executeDownloadBtn.addEventListener('click', () => {
  if (selectedDownloadIds.length === 0) return;

  const selectedItems = queue.filter(q => selectedDownloadIds.includes(q.id));
  
  if (currentDownloadFormat === 'combined') {
    const combinedText = selectedItems.map((item, i) => {
      return `=========================================\nPAGE ${i + 1}: ${item.name}\n=========================================\n\n${item.result?.extractedText || ''}\n\n`;
    }).join('\n');

    const blob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `combined_transcriptions_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    closeDownload();
  } else if (currentDownloadFormat === 'json') {
    const jsonSchema = selectedItems.map(item => ({
      fileName: item.name,
      fileSize: item.size,
      primaryLanguage: item.result?.primaryLanguage || 'Unknown',
      confidence: item.result?.confidence || 'High',
      extractedText: item.result?.extractedText || '',
      notes: item.result?.notes || ''
    }));

    const blob = new Blob([JSON.stringify(jsonSchema, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr_structured_metadata_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    closeDownload();
  } else if (currentDownloadFormat === 'zip') {
    executeDownloadText.innerText = 'Creating ZIP...';
    executeDownloadBtn.disabled = true;

    try {
      const zip = new JSZip();
      selectedItems.forEach(item => {
        const text = item.result?.extractedText || '';
        const baseName = item.name.split('.')[0];
        zip.file(`${baseName}_extracted.txt`, text);
      });

      zip.generateAsync({ type: 'blob' }).then((content) => {
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `extracted_documents_${Date.now()}.zip`;
        link.click();
        URL.revokeObjectURL(url);
        
        executeDownloadText.innerText = 'Download Pages';
        executeDownloadBtn.disabled = false;
        closeDownload();
      });
    } catch (e) {
      console.error("ZIP Generation failure:", e);
      alert("ZIP compression failed. Please download as Combined Text instead.");
      executeDownloadText.innerText = 'Download Pages';
      executeDownloadBtn.disabled = false;
    }
  }
});

// Copy consolidated text in modal trigger
downloadCopyAllBtn.addEventListener('click', () => {
  if (selectedDownloadIds.length === 0) return;

  const selectedItems = queue.filter(q => selectedDownloadIds.includes(q.id));
  const combinedText = selectedItems.map((item, i) => {
    return `=========================================\nPAGE ${i + 1}: ${item.name}\n=========================================\n\n${item.result?.extractedText || ''}\n\n`;
  }).join('\n');

  navigator.clipboard.writeText(combinedText).then(() => {
    const prevText = downloadCopyAllBtn.innerHTML;
    downloadCopyAllBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i> <span>Copied All!</span>`;
    lucide.createIcons();
    
    setTimeout(() => {
      downloadCopyAllBtn.innerHTML = prevText;
      lucide.createIcons();
    }, 1500);
  });
});
