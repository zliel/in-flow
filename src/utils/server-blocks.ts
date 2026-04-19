import { createServerFn } from '@tanstack/react-start'
import { createServerSupabase } from './supabase-server'
import { z } from 'zod'

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
