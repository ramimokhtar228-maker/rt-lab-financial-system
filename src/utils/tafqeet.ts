/**
 * Arabic Number to Words Converter (Tafqeet) for Egyptian Pounds (EGP)
 * تحويل الأرقام إلى كلمات باللغة العربية للعملة المصرية (جنيه مصري)
 */

const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

function convertHundreds(n: number): string {
  let str = '';
  const h = Math.floor(n / 100);
  const rem = n % 100;

  if (h > 0) {
    str += hundreds[h];
  }

  if (rem > 0) {
    if (str.length > 0) str += ' و';
    if (rem < 20) {
      str += ones[rem];
    } else {
      const o = rem % 10;
      const t = Math.floor(rem / 10);
      if (o > 0) {
        str += ones[o] + ' و' + tens[t];
      } else {
        str += tens[t];
      }
    }
  }

  return str;
}

export function tafqeetEGP(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'صفر جنيه مصري';
  }

  const rounded = Math.round(amount * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  let result = '';

  if (integerPart === 0) {
    result = '';
  } else if (integerPart < 1000) {
    result = convertHundreds(integerPart);
  } else if (integerPart < 1000000) {
    const thousands = Math.floor(integerPart / 1000);
    const rem = integerPart % 1000;

    let thStr = '';
    if (thousands === 1) thStr = 'ألف';
    else if (thousands === 2) thStr = 'ألفان';
    else if (thousands >= 3 && thousands <= 10) thStr = convertHundreds(thousands) + ' آلاف';
    else thStr = convertHundreds(thousands) + ' ألفاً';

    result = thStr;
    if (rem > 0) {
      result += ' و' + convertHundreds(rem);
    }
  } else {
    // For large numbers
    const millions = Math.floor(integerPart / 1000000);
    const remMill = integerPart % 1000000;
    let mStr = millions === 1 ? 'مليون' : millions === 2 ? 'مليونان' : convertHundreds(millions) + ' ملايين';
    result = mStr;
    if (remMill > 0) {
      result += ' و' + tafqeetEGP(remMill).replace(' جنيهاً مصرياً لا غير', '').replace(' فقط ', '');
    }
  }

  let finalPhrase = 'فقط ' + result;
  if (integerPart === 1) finalPhrase += ' جنيه مصري';
  else if (integerPart === 2) finalPhrase += ' جنيهاً مصرياً';
  else if (integerPart >= 3 && integerPart <= 10) finalPhrase += ' جنيهات مصرية';
  else finalPhrase += ' جنيهاً مصرياً';

  if (decimalPart > 0) {
    finalPhrase += ' و' + convertHundreds(decimalPart) + ' قرشاً';
  }

  finalPhrase += ' لا غير';
  return finalPhrase;
}
