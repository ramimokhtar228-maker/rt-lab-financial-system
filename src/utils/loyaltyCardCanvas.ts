import { BRANCH_MAIN_ADDRESS, LAB_NAME_AR } from './whatsappBooking';

export function generateAndDownloadLoyaltyCard(params: {
  cardNumber: string;
  patientName: string;
  patientPhone: string;
  tier: string;
  discountPercentage: number;
  points: number;
}): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // 1. Background
    const gradient = ctx.createLinearGradient(0, 0, 1000, 600);
    if (params.tier.includes('VIP') || params.tier.includes('Platinum')) {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e293b');
      gradient.addColorStop(1, '#090d16');
    } else {
      gradient.addColorStop(0, '#1c1917');
      gradient.addColorStop(0.5, '#292524');
      gradient.addColorStop(1, '#0c0a09');
    }

    const radius = 32;
    ctx.beginPath();
    ctx.roundRect(0, 0, 1000, 600, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 2. Decorative borders
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // 3. Brand Logo
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(880, 50, 65, 65, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RT', 912, 82);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(LAB_NAME_AR, 860, 70);

    ctx.font = '500 16px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('RT Medical Laboratories & Diagnostics', 860, 100);

    // Chip
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(70, 60, 70, 52, 8);
    ctx.fill();

    // Badge
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.beginPath();
    ctx.roundRect(650, 150, 290, 48, 24);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`كارت الولاء الطبي • ${params.tier}`, 795, 182);

    // Discount
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 64px sans-serif';
    ctx.fillText(`${params.discountPercentage}%`, 70, 205);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('خصم معملي دائم', 210, 185);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px sans-serif';
    ctx.fillText('على جميع الفحوصات والتحاليل في معامل RT', 210, 212);

    // Card number
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(params.cardNumber, 500, 310);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, 350);
    ctx.lineTo(930, 350);
    ctx.stroke();

    // Patient Name
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px sans-serif';
    ctx.fillText('اسم العضو / المريض', 930, 390);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(params.patientName, 930, 430);

    // Phone
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px sans-serif';
    ctx.fillText('رقم الهاتف المسجل', 930, 480);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(params.patientPhone, 930, 515);

    // Points
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px sans-serif';
    ctx.fillText('رصيد النقاط', 70, 390);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`${params.points} نقطة`, 70, 430);

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '13px sans-serif';
    ctx.fillText(`الفرع الرئيسي: ${BRANCH_MAIN_ADDRESS}`, 500, 570);

    const dataUrl = canvas.toDataURL('image/png');

    // Trigger download
    const link = document.createElement('a');
    link.download = `RT-Loyalty-Card-${params.cardNumber}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    resolve(dataUrl);
  });
}
