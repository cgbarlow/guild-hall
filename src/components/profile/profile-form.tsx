'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { profileSchema, type ProfileFormData } from '@/lib/schemas/profile.schema'
import { useUpdateProfile } from '@/lib/hooks/use-profile'

interface ProfileFormProps { initialData?: { display_name?: string | null; bio?: string | null; avatar_url?: string | null } }

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null)
  const updateProfile = useUpdateProfile()
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { display_name: initialData?.display_name || '', bio: initialData?.bio || '', avatar_url: initialData?.avatar_url || '' },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setError(null)
    try { await updateProfile.mutateAsync(data) } catch (err) { setError(err instanceof Error ? err.message : 'Failed to update profile') }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Profile Information</CardTitle><CardDescription>Update your profile details</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="display_name">Display Name</Label><Input id="display_name" placeholder="Your display name" {...register('display_name')} disabled={updateProfile.isPending} />{errors.display_name && <p className="text-sm text-destructive">{errors.display_name.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="bio">Bio</Label><textarea id="bio" placeholder="Tell us about yourself" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register('bio')} disabled={updateProfile.isPending} />{errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="avatar_url">Avatar URL</Label><Input id="avatar_url" type="url" placeholder="https://example.com/avatar.jpg" {...register('avatar_url')} disabled={updateProfile.isPending} />{errors.avatar_url && <p className="text-sm text-destructive">{errors.avatar_url.message}</p>}</div>
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>}
          {updateProfile.isSuccess && <div className="text-sm text-green-600 bg-green-50 p-3 rounded">Profile updated successfully!</div>}
          <Button type="submit" disabled={updateProfile.isPending || !isDirty}>{updateProfile.isPending ? 'Saving...' : 'Save Changes'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}
