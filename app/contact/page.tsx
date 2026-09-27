'use client'

import { FormGroup } from '../_components/FormGroup'
import { Label } from '../_components/Label'
import { Input } from '../_components/Input'
import { ErrorMessage } from '../_components/ErrorMessage'
import { Textarea } from '../_components/Textarea'
import { API_BASE_URL } from '../constants'
import { useForm } from 'react-hook-form'
import type { ContactForm } from '../_types/contactForm'

export default function Page() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactForm) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if(!res.ok) {
        throw new Error('送信に失敗しました。');
      }
      alert('送信しました。')
      reset();
    } catch {
      alert('送信に失敗しました。')
    }
  }

  return (
    <div>
      <div className="max-w-200 mx-auto py-10">
        <h1 className="text-xl font-bold mb-10">問合わせフォーム</h1>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormGroup>
            <Label text="お名前" htmlFor="name" />
            <Input
              type="text"
              id="name"
              {...register('name', { required: 'お名前は必須です。' })}
              disabled={isSubmitting}
            />
            <ErrorMessage message={errors.name?.message} />
          </FormGroup>
          <FormGroup>
            <Label text="メールアドレス" htmlFor="email" />
            <Input
              type="email"
              id="email"
              {...register('email', { required: 'メールアドレスは必須です。', pattern: { value: /^\S+@\S+$/i, message: '有効なメールアドレスを入力してください。' } })}
              disabled={isSubmitting}
            />
            <ErrorMessage message={errors.email?.message} />
          </FormGroup>
          <FormGroup>
            <Label text="本文" htmlFor="message" />
            <Textarea
              id="message"
              {...register('message', { required: '本文は必須です。' })}
              disabled={isSubmitting}
              rows={8}
            />
            <ErrorMessage message={errors.message?.message} />
          </FormGroup>
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg mr-4"
              disabled={isSubmitting}
            >
              送信
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="bg-gray-200 font-bold py-2 px-4 rounded-lg"
              disabled={isSubmitting}
            >
              クリア
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}