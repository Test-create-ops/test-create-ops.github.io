export function Mi({ n, className = '' }: { n: string; className?: string }) {
  return <span className={'mi' + (className ? ' ' + className : '')}>{n}</span>
}
