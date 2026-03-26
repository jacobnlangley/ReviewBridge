import { BusinessSignupForm } from "@/components/forms/business-signup-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
      <section className="grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-start">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Business Signup</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Start your free 30-day trial</h1>
          <p className="text-sm text-slate-700">
            Setup takes about a minute. We will create your business account, your first feedback link,
            and your printable QR code.
          </p>
          <BusinessSignupForm />
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">What happens after signup</h2>
          <ol className="space-y-2 text-sm text-slate-700">
            <li>1. Your trial starts immediately.</li>
            <li>2. You get a feedback URL and printable QR code.</li>
            <li>3. You can collect private feedback right away.</li>
          </ol>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-900">
              There is no automatic renewal at the end of trial.
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}
