import { MAX_ROWS } from "@helpers/csvConstants";
import { SubmissionInvalidEntry } from "@helpers/csvTypes";
import { canUploadLargeAllowlist } from "lib/vip";
import { getAddress } from "viem";

const processRowData = (row: any[]): { address: string; error: boolean } => {
  const address = row[0];
  let error = false;

  try {
    getAddress(address);
  } catch (e) {
    error = true;
  }

  return { address, error };
};

self.onmessage = async (event: MessageEvent) => {
  const { data, userAddress } = event.data;
  const addressData: string[] = [];
  const invalidEntries: SubmissionInvalidEntry[] = [];
  const addresses: Set<string> = new Set();
  const unexpectedHeaders = ["address"];

  if (data.length > MAX_ROWS) {
    if (userAddress) {
      const hasLargeUploadPermission = await canUploadLargeAllowlist(userAddress, data.length);
      if (!hasLargeUploadPermission) {
        self.postMessage({ data: {}, invalidEntries, error: { kind: "limitExceeded" } });
        return;
      }
    } else {
      self.postMessage({ data: {}, invalidEntries, error: { kind: "limitExceeded" } });
      return;
    }
  }

  if (data[0].some((value: any) => unexpectedHeaders.includes(value.toString().toLowerCase()))) {
    self.postMessage({
      data: {},
      invalidEntries,
      error: {
        kind: "unexpectedHeaders",
      },
    });
    return;
  }

  const expectedColumns = 1;
  if (data[0].length !== expectedColumns) {
    self.postMessage({
      data: [],
      invalidEntries,
      error: { kind: "missingColumns" },
    });
    return;
  }

  for (const row of data) {
    const { address, error } = processRowData(row);

    if (addresses.has(address)) {
      self.postMessage({
        data: [],
        invalidEntries,
        error: { kind: "duplicates" },
      });
      return;
    } else {
      addresses.add(address);
    }

    if (error) {
      invalidEntries.push({ address, error });
    } else {
      addressData.push(address);
    }
  }

  self.postMessage({
    data: addressData,
    invalidEntries,
  });
};
