//
//  amount-words.test.ts
//  ascend-kit
//
//  Created by Venumadhav on 12/11/26.
//

import { test } from "node:test";
import assert from "node:assert/strict";
import { numberInWords, rupeesInWords } from "../src/words/amount.ts";

/** F-20: amounts in words the Indian way, for receipts. */
test("whole numbers, Indian grouping", () => {
  for (const [n, w] of [[0, "Zero"], [7, "Seven"], [15, "Fifteen"], [40, "Forty"], [99, "Ninety Nine"], [100, "One Hundred"], [105, "One Hundred Five"],
    [2500, "Two Thousand Five Hundred"], [10000, "Ten Thousand"], [100000, "One Lakh"], [1234500, "Twelve Lakh Thirty Four Thousand Five Hundred"],
    [10000000, "One Crore"], [250000001, "Twenty Five Crore One"]] as const) assert.equal(numberInWords(n), w, String(n));
});

test("rupees and paise, as a receipt writes them", () => {
  assert.equal(rupeesInWords(250000), "Rupees Two Thousand Five Hundred Only");
  assert.equal(rupeesInWords(150050), "Rupees One Thousand Five Hundred and Fifty Paise Only");
  assert.equal(rupeesInWords(1), "Rupees Zero and One Paise Only");
});
