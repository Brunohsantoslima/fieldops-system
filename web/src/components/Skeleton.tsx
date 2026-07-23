interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{
        backgroundColor: 'var(--bg-muted)',
        ...style,
      }}
    />
  )
}

export function TableRowSkeleton() {
  return (
    <tr>
      {[60, 200, 80, 90, 130, 50, 100, 70].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton style={{ height: 14, width: w }} />
        </td>
      ))}
    </tr>
  )
}

export function KPISkeleton() {
  return (
    <div
      className="p-5 rounded-xl border"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton style={{ height: 12, width: 100 }} />
        <Skeleton style={{ height: 32, width: 32, borderRadius: 8 }} />
      </div>
      <Skeleton style={{ height: 28, width: 60, marginBottom: 8 }} />
      <Skeleton style={{ height: 10, width: 80 }} />
    </div>
  )
}
