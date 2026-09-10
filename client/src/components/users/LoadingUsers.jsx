import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingUsers({ rows = 10, columns = 11 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} className="border-b border-border/60 last:border-0">
          <td className="px-4 py-3" colSpan={columns}>
            <Skeleton className="h-8 w-full" />
          </td>
        </tr>
      ))}
    </>
  )
}
