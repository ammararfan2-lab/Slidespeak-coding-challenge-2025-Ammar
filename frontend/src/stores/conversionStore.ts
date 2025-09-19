import { create } from "zustand";

type Status = "idle" | "selected" | "uploading" | "converting" | "done" | "error";

interface ConversionState {
  status: Status;
  file: File | null;
  progress: number;
  downloadUrl: string | null;
  errorMessage: string | null;
  setStatus: (status: Status) => void;
  setFile: (file: File | null) => void;
  setProgress: (progress: number) => void;
  setDownloadUrl: (url: string | null) => void;
  setErrorMessage: (msg: string | null) => void;
  reset: () => void;
}

export const useConversionStore = create<ConversionState>((set) => ({
  status: "idle",
  file: null,
  progress: 0,
  downloadUrl: null,
  errorMessage: null,
  setStatus: (status) => set({ status }),
  setFile: (file) => set({ file }),
  setProgress: (progress) => set({ progress }),
  setDownloadUrl: (downloadUrl) => set({ downloadUrl }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  reset: () =>
    set({
      status: "idle",
      file: null,
      progress: 0,
      downloadUrl: null,
      errorMessage: null,
    }),
}));
