import { cleanString } from "@/features/core/metadata/share/cleanString";

export const EMPTY_PARTICIPANT_ROW = {
  walletAddress: "",
  locationLabel: "",
};

export function splitLocationLabel(value: unknown) {
  return { locationLabel: cleanString(value) };
}

export function normalizeParticipantRow(row: any) {
  return {
    walletAddress: cleanString(row?.walletAddress),
    locationLabel: cleanString(row?.locationLabel),
  };
}

export function toLocationLabel(row: any) {
  return cleanString(row?.locationLabel);
}
