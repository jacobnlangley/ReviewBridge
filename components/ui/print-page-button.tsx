"use client";

type PrintPageButtonProps = {
  label?: string;
};

export function PrintPageButton({ label = "Print QR code" }: PrintPageButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 print:hidden"
    >
      {label}
    </button>
  );
}
