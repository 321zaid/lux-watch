export default function CheckoutLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center gap-6 px-6 py-28 text-center">
      <span className="h-10 w-px animate-pulse-soft bg-gradient-to-b from-transparent via-gold/70 to-transparent" aria-hidden />
      <p className="font-body text-[10px] uppercase tracking-[0.4em] text-smoke">
        Preparing the counter
      </p>
    </div>
  );
}