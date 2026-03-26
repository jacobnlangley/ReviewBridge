import Link from "next/link";

export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="border-b border-slate-200 bg-slate-100/80">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs">
          <p className="font-semibold uppercase tracking-[0.14em] text-slate-600">Demo Area</p>
          <nav className="flex items-center gap-4 text-sm text-slate-700">
            <Link href="/demo/feedback" className="hover:text-slate-900">
              Feedback Inbox
            </Link>
            <Link href="/demo/qr" className="hover:text-slate-900">
              QR
            </Link>
            <Link href="/demo/settings" className="hover:text-slate-900">
              Alerts
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </>
  );
}
