export function MonsterSkeleton({ size = 280 }: { size?: number }) {
  return (
    <div
      className="bg-surface rounded-xl animate-pulse"
      style={{ width: size, height: size }}
    />
  )
}
