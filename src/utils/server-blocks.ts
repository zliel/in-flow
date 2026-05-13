import { createServerFn } from '@tanstack/react-start'
import { createServerSupabase } from './supabase-server'
import { z } from 'zod'
import { auth } from '@clerk/tanstack-react-start/server'
import { randomUUID } from 'node:crypto'
import {
  addDays,
  getDay,
  setHours,
  setMinutes,
} from 'date-fns'
import type { RecurrencePattern } from '@/types'

const MAX_RECURRING_INSTANCES = 30

function generateRecurringInstances(
  startTime: Date,
  endTime: Date,
  pattern: RecurrencePattern,
  userId: string,
  blockTypeId: string | null,
  title: string | null,
  recurrenceGroupId: string,
) {
  const instances: Array<{
    user_id: string
    block_type_id: string | null
    title: string | null
    start_time: string
    end_time: string
    is_recurring: boolean
    recurrence_group_id: string
  }> = []

  const duration = endTime.getTime() - startTime.getTime()
  const startHour = startTime.getHours()
  const startMin = startTime.getMinutes()
  const targetDayOfMonth = startTime.getDate()

  let count = 0
  let current = new Date(startTime)

  const shouldStop = (date: Date): boolean => {
    if (pattern.endType === 'after' && pattern.endCount && count >= pattern.endCount) return true
    if (pattern.endType === 'on' && pattern.endDate && date > new Date(pattern.endDate)) return true
    return false
  }

  while (count < MAX_RECURRING_INSTANCES) {
    if (count > 0 && shouldStop(current)) break

    const dayOfWeek = getDay(current)

    let include = false
    if (pattern.frequency === 'daily') {
      include = true
    } else if (pattern.frequency === 'weekdays') {
      include = dayOfWeek >= 1 && dayOfWeek <= 5
    } else if (pattern.frequency === 'weekly') {
      include = !pattern.days || pattern.days.length === 0 || pattern.days.includes(dayOfWeek)
    } else if (pattern.frequency === 'monthly') {
      include = current.getDate() === targetDayOfMonth
    }

    if (include) {
      const instanceStart = setMinutes(setHours(new Date(current), startHour), startMin)
      const instanceEnd = new Date(instanceStart.getTime() + duration)

      instances.push({
        user_id: userId,
        block_type_id: blockTypeId,
        title,
        start_time: instanceStart.toISOString(),
        end_time: instanceEnd.toISOString(),
        is_recurring: false,
        recurrence_group_id: recurrenceGroupId,
      })

      count++
    }

    current = addDays(current, 1)
  }

  return instances
}

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

export const createBlockType = createServerFn()
  .inputValidator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      color: z.string().min(1, 'Color is required'),
      defaultEnergyRequired: z.number().min(1).max(5),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = await createServerSupabase()
    const { userId } = await auth()

    const { data: blockType, error } = await supabase
      .from('block_types')
      .insert({
        user_id: userId,
        name: data.name,
        color: data.color,
        default_energy_required: data.defaultEnergyRequired,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return blockType
  })

export const updateBlockType = createServerFn()
  .inputValidator(
    z.object({
      blockTypeId: z.string(),
      name: z.string().min(1).optional(),
      color: z.string().min(1).optional(),
      defaultEnergyRequired: z.number().min(1).max(5).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = await createServerSupabase()

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.color !== undefined) updateData.color = data.color
    if (data.defaultEnergyRequired !== undefined)
      updateData.default_energy_required = data.defaultEnergyRequired

    const { data: blockType, error } = await supabase
      .from('block_types')
      .update(updateData)
      .eq('id', data.blockTypeId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return blockType
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

const recurrencePatternSchema = z.object({
  frequency: z.enum(['daily', 'weekdays', 'weekly', 'monthly']),
  interval: z.number().min(1),
  days: z.array(z.number().min(0).max(6)).optional(),
  endType: z.enum(['never', 'after', 'on']).optional(),
  endCount: z.number().optional(),
  endDate: z.string().optional(),
})

export const createRecurringBlock = createServerFn()
  .inputValidator(
    z.object({
      title: z.string().optional(),
      blockTypeId: z.string().optional(),
      startTime: z.string(),
      endTime: z.string(),
      recurrencePattern: recurrencePatternSchema,
    }),
  )
  .handler(async ({ data }) => {
    const supabase = await createServerSupabase()
    const { userId } = await auth()
    const recurrenceGroupId = randomUUID()

    const { data: parent, error: parentError } = await supabase
      .from('blocks')
      .insert({
        user_id: userId,
        title: data.title,
        block_type_id: data.blockTypeId,
        start_time: data.startTime,
        end_time: data.endTime,
        is_recurring: true,
        recurrence_pattern: data.recurrencePattern,
        recurrence_group_id: recurrenceGroupId,
      })
      .select()
      .single()

    if (parentError) throw new Error(parentError.message)

    const instances = generateRecurringInstances(
      new Date(data.startTime),
      new Date(data.endTime),
      data.recurrencePattern as RecurrencePattern,
      userId!,
      data.blockTypeId ?? null,
      data.title ?? null,
      recurrenceGroupId,
    )

    if (instances.length > 0) {
      const { error: instancesError } = await supabase
        .from('blocks')
        .insert(instances)

      if (instancesError) throw new Error(instancesError.message)
    }

    return parent
  })

export const deleteRecurrenceGroup = createServerFn()
  .inputValidator(z.object({ recurrenceGroupId: z.string() }))
  .handler(async ({ data }) => {
    const supabase = await createServerSupabase()

    const { count, error } = await supabase
      .from('blocks')
      .delete()
      .eq('recurrence_group_id', data.recurrenceGroupId)

    if (error) throw new Error(error.message)
    return { success: true, count }
  })

export const updateRecurrenceGroup = createServerFn()
  .inputValidator(
    z.object({
      recurrenceGroupId: z.string(),
      title: z.string().optional(),
      blockTypeId: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      recurrencePattern: recurrencePatternSchema.optional(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = await createServerSupabase()
    const { userId } = await auth()

    const { data: parent, error: parentError } = await supabase
      .from('blocks')
      .update({
        title: data.title,
        block_type_id: data.blockTypeId,
        start_time: data.startTime,
        end_time: data.endTime,
        recurrence_pattern: data.recurrencePattern,
      })
      .eq('recurrence_group_id', data.recurrenceGroupId)
      .eq('is_recurring', true)
      .select()
      .single()

    if (parentError) throw new Error(parentError.message)

    const { error: deleteError } = await supabase
      .from('blocks')
      .delete()
      .eq('recurrence_group_id', data.recurrenceGroupId)
      .eq('is_recurring', false)

    if (deleteError) throw new Error(deleteError.message)

    if (data.recurrencePattern) {
      const instances = generateRecurringInstances(
        new Date(data.startTime || parent.start_time),
        new Date(data.endTime || parent.end_time),
        data.recurrencePattern as RecurrencePattern,
        userId!,
        data.blockTypeId ?? parent.block_type_id,
        data.title ?? parent.title,
        data.recurrenceGroupId,
      )

      if (instances.length > 0) {
        const { error: instancesError } = await supabase
          .from('blocks')
          .insert(instances)

        if (instancesError) throw new Error(instancesError.message)
      }
    }

    return parent
  })

export const deleteSingleRecurringInstance = createServerFn()
  .inputValidator(z.object({ blockId: z.string() }))
  .handler(async ({ data }) => {
    const supabase = await createServerSupabase()

    const { count, error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', data.blockId)

    if (error) throw new Error(error.message)
    return { success: true, count }
  })
