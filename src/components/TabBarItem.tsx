import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'

interface TabBarItemProps {
  href: string
  label: string
  icon: string
  active: boolean
}

export const TabBarItem = ({ href, label, icon, active }: TabBarItemProps) => (
  <Link href={href} className="flex flex-col items-center text-xs">
    <Image src={icon} alt={label} width={24} height={24} className={clsx({ 'opacity-100': active, 'opacity-40': !active })} />
    <span className={clsx('mt-1', { 'text-black': active, 'text-gray-400': !active })}>{label}</span>
  </Link>
)