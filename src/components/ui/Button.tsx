import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const color =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'

  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-default disabled:opacity-50 ${color} ${className}`}
      {...props}
    />
  )
}
