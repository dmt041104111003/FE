export type ProductionStatus = "CREATED" | "UPDATED" | "CLOSED";
export type Option = { id: string; name: string };

export const CERTIFICATIONS: Option[] = [
  { id: "vietgap", name: "VietGAP" },
  { id: "globalgap", name: "GlobalGAP" },
  { id: "organic", name: "Hữu cơ" },
  { id: "ocop", name: "OCOP" },
  { id: "other", name: "Khác" },
];
