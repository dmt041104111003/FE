import { cleanString } from "@/features/core/metadata/share/cleanString";

function ipfsCid(uri: string): string {
  const raw = cleanString(uri);
  if (!raw) return "";
  if (raw.startsWith("ipfs://")) return raw.slice("ipfs://".length).split("/")[0] || "";
  if (raw.startsWith("https://") || raw.startsWith("http://")) return "";
  return raw;
}

export function ipfsGatewayUrls(uri: string): string[] {
  const raw = cleanString(uri);
  if (!raw) return [];
  if (raw.startsWith("http://") || raw.startsWith("https://")) return [raw];
  const cid = ipfsCid(raw);
  if (!cid) return [];
  return [
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`,
  ];
}

export function ipfsToHttpUrl(uri: string): string {
  return ipfsGatewayUrls(uri)[0] || "";
}

function extractIpfsUri(item: unknown): string {
  if (typeof item === "string") return cleanString(item);
  if (item && typeof item === "object") {
    const row = item as Record<string, unknown>;
    return cleanString(row.src || row.url || row.ipfsUri);
  }
  return "";
}

export function normalizeEvidenceFilesForForm(input: unknown): Array<{ title: string; src: string }> {
  const uris = Array.from(
    new Set(
      (Array.isArray(input) ? input : [])
        .map(extractIpfsUri)
        .filter(Boolean),
    ),
  );
  return uris.map((uri, index) => ({
    title: `Ảnh ${index + 1}`,
    src: ipfsToHttpUrl(uri),
  }));
}
