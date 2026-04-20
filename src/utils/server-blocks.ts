import { createServerFn } from '@tanstack/react-start'
import { createServerSupabase } from './supabase-server'
import { z } from 'zod'
import { auth } from '@clerk/tanstack-react-start/server'

export const getBlocksAndBlockTypes = createServerFn().handler(async () => {
  const supabase = await createServerSupabase()

  const [blockTypes, blocks] = await Promise.all([
    supabase.from('block_types').select('*').order('created_at'),
    supabase.from('blocks').select('*').order('start_time'),
  ])

  return {
    blockTypes: blockTypes.data ?? [],
    blocks: blocks.data ?? [],
  }
})

export const deleteBlockType = createServerFn()
  .inputValidator(z.object({ blockTypeId: z.string() }))
  .handler(async ({ data }) => {
    const supabase = await createServerSupabase()

    const { count, error } = await supabase
      .from('block_types')
      .delete()
      .eq('id', data.blockTypeId)

    if (error) throw new Error(error.message)
    return { success: true, count: count }
  })

export const createBlock = createServerFn()
  .inputValidator(
    z.object({
      title: z.string().optional(),
      blockTypeId: z.string().optional(),
      startTime: z.string(),
      endTime: z.string(),
      isRecurring: z.boolean().default(false),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = await createServerSupabase()
    const { userId } = await auth()

    const { data: block, error } = await supabase
      .from('blocks')
      .insert({
        user_id: userId,
        title: data.title,
        block_type_id: data.blockTypeId,
        start_time: data.startTime,
        end_time: data.endTime,
        is_recurring: data.isRecurring,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return block
  })

export const deleteBlock = createServerFn()
  .inputValidator(z.object({ blockId: z.string() }))
  .handler(async ({ data }) => {
    const supabase = await createServerSupabase()

    const { count, error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', data.blockId)

    if (error) throw new Error(error.message)
    return { success: true, count: count }
  })

export const updateBlock = createServerFn()
  .inputValidator(
    z.object({
      blockId: z.string(),
      title: z.string().optional(),
      blockTypeId: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      isRecurring: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = await createServerSupabase()

    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.blockTypeId !== undefined)
      updateData.block_type_id = data.blockTypeId
    if (data.startTime !== undefined) updateData.start_time = data.startTime
    if (data.endTime !== undefined) updateData.end_time = data.endTime
    if (data.isRecurring !== undefined)
      updateData.is_recurring = data.isRecurring

    const { data: block, error } = await supabase
      .from('blocks')
      .update(updateData)
      .eq('id', data.blockId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return block
  })
