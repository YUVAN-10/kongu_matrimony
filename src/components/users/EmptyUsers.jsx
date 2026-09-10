import { UserX } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'

export default function EmptyUsers() {
  return (
    <EmptyState
      icon={UserX}
      title="No users found"
      description="Users will appear here once registrations begin."
    />
  )
}
