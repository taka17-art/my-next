import React, { ComponentProps } from 'react'

type Props = ComponentProps<'input'>

export const Input: React.FC<Props> = ({ className, ...props }) => {
  return (
    <input
      {...props}
      className={['border border-gray-300 rounded-lg p-4 w-full', className].filter(Boolean).join(' ')}
    />
  )
}