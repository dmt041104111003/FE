import { useEffect, useState } from "react";

const SETUP_PROFILE_KEY = "pending_profile_setup";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const NETWORKS = ["mainnet", "preprod", "preview"] as const;
type CardanoNetwork = (typeof NETWORKS)[number];

type WalletAPI = {
  getChangeAddress: () => Promise<string | { address: string }>;
  getRewardAddresses?: () => Promise<string[]>;
  signData?: (address: string, payload: string) => Promise<{ signature: string; key: string }>;
  experimental?: { signData?: WalletAPI["signData"] };
  enable?: () => Promise<WalletAPI>;
};

type SetupProfileState = {
  walletAddress: string;
  roles: Array<{ id: number; code: string; name?: string | null }>;
};

type WalletOption = { id: string; label: string };

export function readSetupProfileState(): SetupProfileState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SETUP_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SetupProfileState;
    if (!parsed?.walletAddress) return null;
    return parsed;
  } catch {
    return null;
  }
}

function homePathForRole(role: string | null | undefined) {
  const code = String(role || "").toUpperCase();
  if (code === "TRANSIT") return "/transit";
  if (code === "AGENT") return "/agent";
  return "/enterprise";
}

function getAddress(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && typeof value.address === "string") return value.address.trim();
  return String(value.paymentAddress || value.walletAddress || value.sub || "").trim();
}

function detectWallets(): WalletOption[] {
  if (typeof window === "undefined") return [];
  const cardano = (window as any).cardano;
  if (!cardano || typeof cardano !== "object") return [];
  return Object.keys(cardano)
    .filter((id) => typeof cardano[id]?.enable === "function")
    .map((id) => ({ id, label: String(cardano[id]?.name || id) }));
}

function normalizeNetwork(value: string | null): CardanoNetwork {
  const network = String(value || "").toLowerCase().trim();
  if (network === "mainnet" || network === "preview" || network === "preprod") return network;
  return "preprod";
}

async function loginByWallet(walletId: string, network: CardanoNetwork) {
  const cardano = (window as any).cardano;
  const wallet = cardano?.[walletId] as WalletAPI | undefined;
  if (!wallet?.enable) throw new Error("Wallet chưa sẵn sàng.");
  const api = await wallet.enable();
  const walletAddress = getAddress(await api.getChangeAddress());
  if (!walletAddress) throw new Error("Không lấy được địa chỉ ví.");

  const nonceRes = await fetch(`${BACKEND_URL}/auth/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ stakeAddress: walletAddress }),
  });
  if (!nonceRes.ok) throw new Error(await nonceRes.text());
  const nonce = String((await nonceRes.json())?.nonce || "").trim();
  if (!nonce) throw new Error("Nonce rỗng.");

  const signer = api.signData || api.experimental?.signData;
  if (!signer) throw new Error("Ví không hỗ trợ signData.");
  const rewardAddresses = await api.getRewardAddresses?.().catch(() => []);
  const signAddress = rewardAddresses?.[0] || walletAddress;
  const signed = await signer(signAddress, nonce);

  const verifyRes = await fetch(`${BACKEND_URL}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      stakeAddress: walletAddress,
      nonce,
      signature: signed.signature,
      key: signed.key,
      network,
    }),
  });
  if (!verifyRes.ok) throw new Error("Verify thất bại.");
  return { walletAddress, data: await verifyRes.json() };
}

export function useWalletAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setup, setSetup] = useState<SetupProfileState | null>(null);
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [network, setNetwork] = useState<CardanoNetwork>("preprod");

  useEffect(() => {
    const detected = detectWallets();
    setWallets(detected);
    setSelectedWallet(String(localStorage.getItem("cardano_wallet_id") || detected[0]?.id || ""));
    setNetwork(normalizeNetwork(localStorage.getItem("cardano_network")));
    const pending = readSetupProfileState();
    if (pending) setSetup(pending);
  }, []);

  useEffect(() => {
    localStorage.setItem("cardano_wallet_id", selectedWallet || "");
  }, [selectedWallet]);

  useEffect(() => {
    localStorage.setItem("cardano_network", network);
  }, [network]);

  const loginWithWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!selectedWallet) throw new Error("Chọn ví trước.");
      const { walletAddress, data } = await loginByWallet(selectedWallet, network);
      if (data?.needProfile) {
        const roles = Array.isArray(data.roles) ? data.roles : [];
        window.sessionStorage.setItem(SETUP_PROFILE_KEY, JSON.stringify({ walletAddress, roles }));
        setSetup({ walletAddress, roles });
        return;
      }
      window.sessionStorage.removeItem(SETUP_PROFILE_KEY);
      window.location.assign(homePathForRole(data?.profile?.roleCode || data?.profile?.role));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi đăng nhập.");
    } finally {
      setIsLoading(false);
    }
  };

  const setupDefaults = {
    walletAddress: setup?.walletAddress || "",
    displayName: "",
    roleCode: String(setup?.roles?.[0]?.code || ""),
    phoneNumber: "",
  };

  return {
    isLoading,
    error,
    setup,
    setupDefaults,
    wallets,
    selectedWallet,
    setSelectedWallet,
    network,
    setNetwork,
    supportedNetworks: NETWORKS,
    loginWithWallet,
  };
}
