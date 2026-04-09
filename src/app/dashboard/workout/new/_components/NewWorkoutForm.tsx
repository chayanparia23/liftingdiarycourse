'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createWorkoutAction } from '../actions'

const schema = z.object({
  title: z.string().max(120).optional(),
  startedAt: z.string().min(1, 'Date is required'),
  bodyweightKg: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number (e.g. 75.5)')
    .optional()
    .or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export function NewWorkoutForm() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      startedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      bodyweightKg: '',
    },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      await createWorkoutAction({
        title: values.title || undefined,
        startedAt: new Date(values.startedAt),
        bodyweightKg: values.bodyweightKg || undefined,
      })
      router.push('/dashboard')
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Push Day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bodyweightKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bodyweight (kg) <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. 75.5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? 'Creating…' : 'Create Workout'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
