import { toPng } from 'html-to-image';

/**
 * exportElementAsPNG
 *
 * Captures a DOM element as a clean PNG and triggers a download.
 * Temporarily removes selection rings, scale transforms, and resets border
 * colors on the live DOM before capturing, then restores them immediately after.
 *
 * @param elementId  - The `id` of the DOM element to capture.
 * @param fileName   - Suggested download filename (without extension).
 * @param scale      - Pixel ratio for retina-quality output (default 2).
 */
export async function exportElementAsPNG(
  elementId: string,
  fileName: string,
  scale = 2,
): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`[exportElementAsPNG] Element #${elementId} not found.`);
    return;
  }

  // 1. Find the selected card/elements inside this container
  const selectedElements: HTMLElement[] = [];
  el.querySelectorAll('*').forEach((node) => {
    if (node instanceof HTMLElement) {
      const classList = node.classList;
      const hasSelectionClass = Array.from(classList).some(cls => 
        cls.startsWith('ring-indigo-500') || 
        cls === 'border-[#1a235a]' || 
        cls === 'border-indigo-600' ||
        cls === 'scale-[1.02]'
      );
      if (hasSelectionClass) {
        selectedElements.push(node);
      }
    }
  });

  // Find a non-selected sibling card to get the default/configured border color
  let defaultBorderColor = '#dee5f7';
  el.querySelectorAll('.rounded-xl.border-2').forEach((node) => {
    if (node instanceof HTMLElement && !node.classList.contains('ring-indigo-500')) {
      if (node.style.borderColor) {
        defaultBorderColor = node.style.borderColor;
      }
    }
  });

  // 2. Temporarily strip selection styles on the live DOM
  const originalStyles = new Map<HTMLElement, { className: string; borderColor: string }>();
  selectedElements.forEach((element) => {
    originalStyles.set(element, {
      className: element.className,
      borderColor: element.style.borderColor,
    });

    // Remove selection/highlight classes cleanly using classList
    element.classList.remove(
      'ring-2',
      'ring-offset-2',
      'ring-indigo-500',
      'ring-indigo-500/10',
      'ring-indigo-500/20',
      'shadow-lg',
      'shadow-md',
      'scale-[1.02]',
      'border-[#1a235a]',
      'border-indigo-600',
      'bg-slate-55/80'
    );

    // Reset the border color to the neutral sibling/default border color
    element.style.borderColor = defaultBorderColor;
  });

  // Inject a style tag to hide ignored elements, disable transitions, and strip highlight rings/scales during export
  const resetStyle = document.createElement('style');
  resetStyle.textContent = `
    #${elementId} [data-export-ignore="true"] {
      display: none !important;
    }
    /* Disable transitions and animations to prevent capturing intermediate/animated states */
    #${elementId}, #${elementId} * {
      transition: none !important;
      transition-property: none !important;
      animation: none !important;
    }
    /* Force remove ring highlight and scale effects */
    #${elementId} .ring-2,
    #${elementId} .ring-offset-2,
    #${elementId} .ring-indigo-500,
    #${elementId} .ring-indigo-500\\/10,
    #${elementId} .ring-indigo-500\\/20,
    #${elementId} .shadow-lg,
    #${elementId} .shadow-md,
    #${elementId} .scale-\\[1\\.02\\],
    #${elementId} .hover\\:scale-\\[1\\.01\\]:hover {
      box-shadow: none !important;
      transform: none !important;
      outline: none !important;
    }
    /* Capacity Canvas selection reset overrides */
    #${elementId} .border-\\[\\#1a235a\\] {
      border-color: transparent !important;
    }
    #${elementId} .bg-slate-55\\/80 {
      background-color: rgba(248, 250, 252, 0.3) !important;
    }
    /* Ticket Board Canvas selection reset overrides */
    #${elementId} .border-indigo-600 {
      border-color: #e2e8f0 !important;
    }
  `;
  document.head.appendChild(resetStyle);

  try {
    const dataUrl = await toPng(el, {
      pixelRatio: scale,
      backgroundColor: '#ffffff',
      filter: (node: HTMLElement) => {
        return !(node instanceof HTMLElement && node.dataset.exportIgnore === 'true');
      },
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // 3. Restore all original styles & classes
    originalStyles.forEach((orig, element) => {
      element.className = orig.className;
      element.style.borderColor = orig.borderColor;
    });
    document.head.removeChild(resetStyle);
  }
}
