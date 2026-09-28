import { cn } from '../../utils/format'

export default function Container({ children, className }) {
  return <div className={cn('container-mrz', className)}>{children}</div>
}
