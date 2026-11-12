//
//  amount.ts
//  ascend-kit
//
//  Created by Venumadhav on 12/11/26.
//

/**
 * F-20: an amount in words, as Indian receipts write it: "Rupees Twelve Lakh Thirty Four Thousand Five Hundred Only",
 * with "and Fifty Paise" when there are paise. Indian grouping: thousand, lakh (1,00,000), crore (1,00,00,000).
 */
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

/** 0 to 99. */
const two = (n: number) => (n < 20 ? ONES[n]! : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`);
/** 0 to 999. */
const three = (n: number) => [n >= 100 ? `${ONES[Math.floor(n / 100)]} Hundred` : "", two(n % 100)].filter(Boolean).join(" ");

/** A whole number of rupees in words (Indian grouping); "Zero" for 0. */
export function numberInWords(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n === 0) return "Zero";
  const crore = Math.floor(n / 1e7), lakh = Math.floor((n % 1e7) / 1e5), thousand = Math.floor((n % 1e5) / 1e3), rest = n % 1e3;
  return [crore ? `${crore >= 100 ? numberInWords(crore) : two(crore)} Crore` : "", lakh ? `${two(lakh)} Lakh` : "", thousand ? `${two(thousand)} Thousand` : "", three(rest)]
    .filter(Boolean).join(" ");
}

/** Paise to "Rupees … Only", with "and … Paise" when there are any. */
export function rupeesInWords(paise: number): string {
  const r = Math.floor(Math.abs(paise) / 100), p = Math.round(Math.abs(paise) % 100);
  return `Rupees ${numberInWords(r)}${p ? ` and ${two(p)} Paise` : ""} Only`;
}
