// Code 128 / Code 39 Barcode SVG Generator & Audio Scanner Helpers

export function generateBarcodeSVG(code: string, width = 240, height = 65, showText = true): string {
  // Generate high-contrast pattern based on characters
  const cleanCode = (code || '000000').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  
  // Standard Code 128 / 39 style bar patterns
  const patterns: Record<string, string> = {
    '0': '10100110110', '1': '11010010110', '2': '10110010110', '3': '11011001010',
    '4': '10100110011', '5': '11010011001', '6': '10110011001', '7': '10100101100',
    '8': '11010010100', '9': '10110010100', 'A': '11010100110', 'B': '10110100110',
    'C': '11011010010', 'D': '10101100110', 'E': '11010110010', 'F': '10110110010',
    'G': '10100101110', 'H': '11010010110', 'I': '10110010110', 'J': '10100110110',
    'K': '11010101001', 'L': '10110101001', 'M': '11011010100', 'N': '10101101001',
    'O': '11010110100', 'P': '10110110100', 'Q': '10101011001', 'R': '11010101100',
    'S': '10110101100', 'T': '10101101100', 'U': '11001010110', 'V': '10011010110',
    'W': '11001101010', 'X': '10010110110', 'Y': '11001011010', 'Z': '10011011010',
    '-': '10010101110'
  };

  const startPattern = '11010000100'; // Start code
  const stopPattern = '1100011101011'; // Stop code

  let fullBinary = startPattern;
  for (let i = 0; i < cleanCode.length; i++) {
    const char = cleanCode[i];
    fullBinary += patterns[char] || patterns['0'];
  }
  fullBinary += stopPattern;

  const barWidth = width / fullBinary.length;
  let rects = '';
  let x = 0;

  for (let i = 0; i < fullBinary.length; i++) {
    if (fullBinary[i] === '1') {
      rects += `<rect x="${x.toFixed(2)}" y="0" width="${(barWidth * 1.05).toFixed(2)}" height="${height - (showText ? 18 : 0)}" fill="#0f172a" />`;
    }
    x += barWidth;
  }

  const textElement = showText
    ? `<text x="${width / 2}" y="${height - 2}" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" fill="#1e293b" letter-spacing="2">${cleanCode}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="inline-block barcode-svg">${rects}${textElement}</svg>`;
}

// Audio feedback for barcode scanning
export function playScanSuccessSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch crisp beep A6
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // AudioContext not allowed without interaction
  }
}

export function playScanErrorSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime); // Low warning buzz
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // fallback
  }
}
