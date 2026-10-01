import React, { ComponentProps } from 'react'

type Props = ComponentProps<'textarea'>

export const Textarea: React.FC<Props> = ({ className, ...props }) => {
  return (
    <textarea
      {...props}
      className={['w-full border border-gray-300 rounded-lg p-4', className].filter(Boolean).join(' ')}
    />
  )
}