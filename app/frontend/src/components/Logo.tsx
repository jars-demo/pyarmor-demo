// The pyarmor-demo lockup: the shield mark (from the brand kit) and the wordmark as live text, so
// it stays sharp at any size and readable in dark mode.
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/brand/mark-128.png" alt="" width={size} height={size} className="shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-extrabold tracking-tight">
          <span className="text-text">Py</span>
          <span className="text-brand dark:text-accent">Armor</span>
        </span>
        <span className="mt-0.5 text-[9px] font-medium tracking-[0.55em] text-muted">DEMO</span>
      </span>
    </span>
  )
}
