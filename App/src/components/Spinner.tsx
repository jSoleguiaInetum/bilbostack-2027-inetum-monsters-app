export function Spinner({ size = 40 }: { size?: number }) {
  return (
    <div
      className="border-4 border-surface border-t-secondary rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  )
}
