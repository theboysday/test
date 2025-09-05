const DEFAULT_CODE = `flowchart TD
    A([Start]) --> B{Multiple beds down?}
    B -- No --> C[Single bed only → Troubleshoot motor/control card]
    B -- Yes --> D([Perform bypass relay test\n(midpoint bed)])
    D --> E{Upstream beds run?}
    E -- Yes --> F[Fault is downstream → Continue bed-to-bed]
    E -- No --> G[Fault is at or before this bed]
    F --> H{All tests pass but beds still down?}
    G --> H
    H -- Yes --> I[[Suspect CR-BP relay anomaly]]
    H -- No --> J[Swap with known-good relay]
    I --> J
    J --> K{System restored?}
    K -- Yes --> L([Replace faulty relay])
    K -- No --> Z((End))
    L --> Z

    style B fill:#42a5f5,stroke:#000,stroke-width:2px
    style E fill:#42a5f5,stroke:#000,stroke-width:2px
    style H fill:#42a5f5,stroke:#000,stroke-width:2px
    style K fill:#42a5f5,stroke:#000,stroke-width:2px
    style I fill:#ffeb3b,stroke:#000,stroke-width:2px
    style Z fill:#00c853,stroke:#000,stroke-width:2px`;

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('mermaid-code');
  const renderBtn = document.getElementById('render-btn');
  const copyBtn = document.getElementById('copy-btn');
  const clearBtn = document.getElementById('clear-btn');
  const svgBtn = document.getElementById('svg-btn');
  const pngBtn = document.getElementById('png-btn');
  const preview = document.getElementById('mermaid-preview');
  const errorMsg = document.getElementById('error-msg');
  const themeSelect = document.getElementById('theme-select');

  textarea.value = DEFAULT_CODE;
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: themeSelect.value });

  async function renderDiagram() {
    errorMsg.textContent = '';
    try {
      const { svg } = await mermaid.render('mmd-' + Math.random().toString(36).slice(2), textarea.value);
      preview.innerHTML = svg;
    } catch (err) {
      errorMsg.textContent = err.message || String(err);
      preview.innerHTML = '';
    }
  }

  renderBtn.addEventListener('click', renderDiagram);

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(textarea.value);
  });

  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    preview.innerHTML = '';
    errorMsg.textContent = '';
  });

  svgBtn.addEventListener('click', () => {
    const svgEl = preview.querySelector('svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  });

  pngBtn.addEventListener('click', () => {
    const svgEl = preview.querySelector('svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const img = new Image();
    const url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'diagram.png';
        a.click();
        URL.revokeObjectURL(blobUrl);
      }, 'image/png');
    };
    img.src = url;
  });

  themeSelect.addEventListener('change', () => {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: themeSelect.value });
    if (preview.querySelector('svg')) {
      renderDiagram();
    }
  });
});
