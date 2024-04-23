const ZERO = "0";

const countZeros = (decimalDigits: string) => {
  // Count the leading zeros
  let zeroCount = 0;
  for (let i = 0; i < decimalDigits.length; i++) {
    if (decimalDigits[i] === ZERO) {
      zeroCount++;
    } else {
      break;
    }
  }

  return zeroCount;
};

export const compressZeros = (
  formattedValue: string,
  hasCurrencySymbol: boolean
) => {
  // Find the punctuation symbol marking the start of the decimal part
  const punctuationSymbol = formattedValue.match(/[.,]/g)?.pop();

  const significantDigitsSubStart = hasCurrencySymbol ? 1 : 0;
  const currencySign = hasCurrencySymbol ? formattedValue[0] : undefined;

  if (!punctuationSymbol) {
    return {
      currencySign,
      significantDigits: formattedValue.substring(significantDigitsSubStart),
    };
  }
  // Find the index of the punctuation symbol
  const punctIdx = formattedValue.lastIndexOf(punctuationSymbol);

  // If no punctuation symbol found or no zeros after it, return the original value
  if (
    !punctuationSymbol ||
    !formattedValue.includes(ZERO, formattedValue.indexOf(punctuationSymbol))
  ) {
    return {
      currencySign,
      significantDigits: formattedValue.substring(
        significantDigitsSubStart,
        punctIdx
      ),
      zeros: 0,
      decimalDigits: formattedValue.substring(punctIdx + 1),
    };
  }

  // Extract characters after the punctuation symbol
  const charsAfterPunct = formattedValue.slice(punctIdx + 1);

  // Count consecutive zeros
  const zerosCount = countZeros(charsAfterPunct);

  if (zerosCount < 4)
    return {
      currencySign,
      significantDigits: formattedValue.substring(
        significantDigitsSubStart,
        punctIdx
      ),
      zeros: 0,
      decimalDigits: charsAfterPunct,
    };

  const otherDigits = charsAfterPunct.substring(zerosCount);

  const canDisplayZeros = zerosCount !== 0 || otherDigits.length !== 0;

  return {
    currencySign,
    significantDigits: formattedValue.substring(
      significantDigitsSubStart,
      punctIdx
    ),
    zeros: canDisplayZeros ? zerosCount : 0,
    decimalDigits: otherDigits,
  };
};
