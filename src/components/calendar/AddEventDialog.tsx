import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { format, getDay } from 'date-fns'
import { Plus, Repeat, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { useCalendar } from './CalendarContext'
import {
  createBlock,
  updateBlock,
  deleteBlock,
  createRecurringBlock,
  deleteRecurrenceGroup,
  updateRecurrenceGroup,
  deleteSingleRecurringInstance,
} from '@/utils/server-blocks'
import type { BlockType, Block, RecurrencePattern } from '@/types'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface AddEventDialogProps {
  blockTypes: BlockType[]
  onAddBlockType?: () => void
}

export default function AddEventDialog({
  blockTypes,
  onAddBlockType = () => {},
}: AddEventDialogProps) {
  const {
    isAddEventOpen,
    setIsAddEventOpen,
    currentDate,
    selectedBlock,
    setSelectedBlock,
  } = useCalendar()
  const queryClient = useQueryClient()
  const isEditMode = !!selectedBlock
  const isRecurringInstance =
    selectedBlock?.recurrence_group_id != null && !selectedBlock.is_recurring

  const [title, setTitle] = useState('')
  const [blockTypeId, setBlockTypeId] = useState<string>('')
  const [error, setError] = useState('')
  const [startTime, setStartTime] = useState(() => {
    const date = new Date(currentDate)
    date.setHours(9, 0, 0, 0)
    return format(date, "yyyy-MM-dd'T'HH:mm")
  })
  const [endTime, setEndTime] = useState(() => {
    const date = new Date(currentDate)
    date.setHours(10, 0, 0, 0)
    return format(date, "yyyy-MM-dd'T'HH:mm")
  })

  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<
    'daily' | 'weekdays' | 'weekly' | 'monthly'
  >('weekly')
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(() => {
    const dayOfWeek = getDay(new Date(currentDate))
    return [dayOfWeek]
  })
  const [recurrenceEndType, setRecurrenceEndType] = useState<
    'never' | 'after' | 'on'
  >('never')
  const [recurrenceEndCount, setRecurrenceEndCount] = useState(10)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')

  const [editScope, setEditScope] = useState<'this' | 'all'>('this')

  const createBlockFn = useServerFn(createBlock)
  const updateBlockFn = useServerFn(updateBlock)
  const deleteBlockFn = useServerFn(deleteBlock)
  const createRecurringBlockFn = useServerFn(createRecurringBlock)
  const deleteRecurrenceGroupFn = useServerFn(deleteRecurrenceGroup)
  const updateRecurrenceGroupFn = useServerFn(updateRecurrenceGroup)
  const deleteSingleRecurringInstanceFn = useServerFn(
    deleteSingleRecurringInstance,
  )

  useEffect(() => {
    if (selectedBlock && isAddEventOpen) {
      setTitle(selectedBlock.title || '')
      setBlockTypeId(selectedBlock.block_type_id || '')
      const start = new Date(selectedBlock.start_time)
      const end = new Date(selectedBlock.end_time)
      setStartTime(format(start, "yyyy-MM-dd'T'HH:mm"))
      setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"))

      if (selectedBlock.is_recurring && selectedBlock.recurrence_pattern) {
        setIsRecurring(true)
        setRecurrenceFrequency(selectedBlock.recurrence_pattern.frequency)
        setRecurrenceDays(
          selectedBlock.recurrence_pattern.days || [getDay(start)],
        )
        setRecurrenceEndType(
          selectedBlock.recurrence_pattern.endType || 'never',
        )
        setRecurrenceEndCount(selectedBlock.recurrence_pattern.endCount || 10)
        setRecurrenceEndDate(selectedBlock.recurrence_pattern.endDate || '')
      } else {
        setIsRecurring(false)
        setRecurrenceDays([getDay(start)])
      }
      setEditScope('this')
    } else if (!isAddEventOpen) {
      resetForm()
    }
  }, [selectedBlock, isAddEventOpen, currentDate])

  const resetForm = () => {
    setTitle('')
    setBlockTypeId('')
    setError('')
    setIsRecurring(false)
    setRecurrenceFrequency('weekly')
    setRecurrenceEndType('never')
    setRecurrenceEndCount(10)
    setRecurrenceEndDate('')
    setEditScope('this')
    const date = new Date(currentDate)
    date.setHours(9, 0, 0, 0)
    setStartTime(format(date, "yyyy-MM-dd'T'HH:mm"))
    date.setHours(10, 0, 0, 0)
    setEndTime(format(date, "yyyy-MM-dd'T'HH:mm"))
    setRecurrenceDays([getDay(date)])
  }

  const eventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    blockTypeId: z.string().min(1, 'Type is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
  })

  const toUTC = (localDateTime: string) => {
    const [datePart, timePart] = localDateTime.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes] = timePart.split(':').map(Number)
    const date = new Date(year, month - 1, day, hours, minutes)
    return date.toISOString()
  }

  const buildRecurrencePattern = (): RecurrencePattern => ({
    frequency: recurrenceFrequency,
    interval: 1,
    days: recurrenceFrequency === 'weekly' ? recurrenceDays : undefined,
    endType: recurrenceEndType,
    endCount: recurrenceEndType === 'after' ? recurrenceEndCount : undefined,
    endDate: recurrenceEndType === 'on' ? recurrenceEndDate : undefined,
  })

  const toggleDay = (day: number) => {
    setRecurrenceDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort(),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = eventSchema.safeParse({
      title,
      blockTypeId,
      startTime,
      endTime,
    })
    if (!result.success) {
      const firstError = result.error.issues[0]
      setError(firstError.message)
      return
    }

    if (isEditMode) {
      if (isRecurringInstance && editScope === 'all') {
        updateAllMutation.mutate()
      } else {
        updateBlockMutation.mutate()
      }
    } else {
      if (isRecurring) {
        createRecurringMutation.mutate()
      } else {
        createBlockMutation.mutate()
      }
    }
  }

  const handleClose = () => {
    setIsAddEventOpen(false)
    setSelectedBlock(null)
    setError('')
  }

  const handleDelete = () => {
    if (!selectedBlock) return

    if (isRecurringInstance) {
      const scope = editScope === 'all' ? 'all occurrences' : 'this occurrence'
      if (confirm(`Delete ${scope}?`)) {
        deleteMutation.mutate()
      }
    } else {
      if (confirm('Are you sure you want to delete this event?')) {
        deleteMutation.mutate()
      }
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose()
  }

  const handleInvalid = (e: React.FormEvent) => {
    e.preventDefault()
    setError('Please fill in all required fields')
  }

  const handleBlockTypeChange = (value: string) => {
    if (value === 'add-new-block-type') {
      onAddBlockType()
      return
    }
    setBlockTypeId(value)
  }

  const createBlockMutation = useMutation({
    mutationFn: async () => {
      return await createBlockFn({
        data: {
          title,
          blockTypeId,
          startTime: toUTC(startTime),
          endTime: toUTC(endTime),
        },
      })
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['blocks'] })
      const previous = queryClient.getQueryData<{
        blockTypes: BlockType[]
        blocks: Block[]
      }>(['blocks'])
      const optimisticBlock: Block = {
        id: `temp-${Date.now()}`,
        user_id: '',
        block_type_id: blockTypeId || null,
        title: title || null,
        start_time: toUTC(startTime),
        end_time: toUTC(endTime),
        is_recurring: false,
        recurrence_pattern: null,
        recurrence_group_id: null,
        created_at: new Date().toISOString(),
      }
      queryClient.setQueryData<{ blockTypes: BlockType[]; blocks: Block[] }>(
        ['blocks'],
        {
          blockTypes: previous?.blockTypes ?? [],
          blocks: [...(previous?.blocks ?? []), optimisticBlock],
        },
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(['blocks'], context.previous)
    },
    onSuccess: () => handleClose(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['blocks'] }),
  })

  const createRecurringMutation = useMutation({
    mutationFn: async () => {
      return await createRecurringBlockFn({
        data: {
          title,
          blockTypeId,
          startTime: toUTC(startTime),
          endTime: toUTC(endTime),
          recurrencePattern: buildRecurrencePattern(),
        },
      })
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['blocks'] })
      const previous = queryClient.getQueryData<{
        blockTypes: BlockType[]
        blocks: Block[]
      }>(['blocks'])
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(['blocks'], context.previous)
    },
    onSuccess: () => handleClose(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['blocks'] }),
  })

  const updateBlockMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBlock) return null
      return await updateBlockFn({
        data: {
          blockId: selectedBlock.id,
          title,
          blockTypeId,
          startTime: toUTC(startTime),
          endTime: toUTC(endTime),
        },
      })
    },
    onMutate: async () => {
      if (!selectedBlock) return {}
      await queryClient.cancelQueries({ queryKey: ['blocks'] })
      const previous = queryClient.getQueryData<{
        blockTypes: BlockType[]
        blocks: Block[]
      }>(['blocks'])
      if (previous) {
        queryClient.setQueryData<{ blockTypes: BlockType[]; blocks: Block[] }>(
          ['blocks'],
          {
            ...previous,
            blocks: previous.blocks.map((block) =>
              block.id === selectedBlock.id
                ? {
                    ...block,
                    block_type_id: blockTypeId || null,
                    title: title || null,
                    start_time: toUTC(startTime),
                    end_time: toUTC(endTime),
                  }
                : block,
            ),
          },
        )
      }
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(['blocks'], context.previous)
    },
    onSuccess: () => handleClose(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['blocks'] }),
  })

  const updateAllMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBlock?.recurrence_group_id) return null
      return await updateRecurrenceGroupFn({
        data: {
          recurrenceGroupId: selectedBlock.recurrence_group_id,
          title,
          blockTypeId,
          startTime: toUTC(startTime),
          endTime: toUTC(endTime),
          recurrencePattern: isRecurring ? buildRecurrencePattern() : undefined,
        },
      })
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['blocks'] })
      const previous = queryClient.getQueryData<{
        blockTypes: BlockType[]
        blocks: Block[]
      }>(['blocks'])
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(['blocks'], context.previous)
    },
    onSuccess: () => handleClose(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['blocks'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBlock) return null
      if (
        isRecurringInstance &&
        editScope === 'all' &&
        selectedBlock.recurrence_group_id
      ) {
        return await deleteRecurrenceGroupFn({
          data: { recurrenceGroupId: selectedBlock.recurrence_group_id },
        })
      } else if (isRecurringInstance) {
        return await deleteSingleRecurringInstanceFn({
          data: { blockId: selectedBlock.id },
        })
      }
      return await deleteBlockFn({ data: { blockId: selectedBlock.id } })
    },
    onMutate: async () => {
      if (!selectedBlock) return {}
      await queryClient.cancelQueries({ queryKey: ['blocks'] })
      const previous = queryClient.getQueryData<{
        blockTypes: BlockType[]
        blocks: Block[]
      }>(['blocks'])
      if (previous) {
        let updatedBlocks = previous.blocks
        if (isRecurringInstance && editScope === 'all') {
          updatedBlocks = updatedBlocks.filter(
            (b) => b.recurrence_group_id !== selectedBlock.recurrence_group_id,
          )
        } else {
          updatedBlocks = updatedBlocks.filter((b) => b.id !== selectedBlock.id)
        }
        queryClient.setQueryData<{ blockTypes: BlockType[]; blocks: Block[] }>(
          ['blocks'],
          {
            ...previous,
            blocks: updatedBlocks,
          },
        )
      }
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(['blocks'], context.previous)
    },
    onSuccess: () => handleClose(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['blocks'] }),
  })

  return (
    <Dialog open={isAddEventOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Edit the details of your event.'
              : 'Create a new block on your calendar.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          onInvalid={handleInvalid}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {isRecurringInstance && (
            <div className="flex gap-2 rounded-lg border border-border bg-(--primary)/5 p-2">
              <button
                type="button"
                onClick={() => setEditScope('this')}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  editScope === 'this'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-(--text-muted) hover:text-(--text)'
                }`}
              >
                This occurrence
              </button>
              <button
                type="button"
                onClick={() => setEditScope('all')}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  editScope === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-(--text-muted) hover:text-(--text)'
                }`}
              >
                All occurrences
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="blockType" className="text-sm font-medium">
              Type
            </label>
            <Select
              value={blockTypeId}
              required
              onValueChange={handleBlockTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="add-new-block-type"
                  className="text-primary font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="size-4" />
                    <span>Add new block type...</span>
                  </div>
                </SelectItem>
                <SelectSeparator />
                {blockTypes.map((bt) => (
                  <SelectItem key={bt.id} value={bt.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: bt.color }}
                      />
                      {bt.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateTimePicker
              id="startTime"
              label="Start"
              value={startTime}
              onChange={setStartTime}
            />
            <DateTimePicker
              id="endTime"
              label="End"
              value={endTime}
              onChange={setEndTime}
            />
          </div>

          {!isEditMode && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className="flex items-center gap-2 text-sm font-medium text-(--text-muted) hover:text-(--text) transition"
              >
                <div
                  className={`flex size-5 items-center justify-center rounded border transition ${
                    isRecurring
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border'
                  }`}
                >
                  {isRecurring && <Check className="size-3" />}
                </div>
                <Repeat className="size-4" />
                Repeat
              </button>

              {isRecurring && (
                <div className="space-y-3 rounded-lg border border-border bg-(--background-elevated)/50 p-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-(--text-muted)">
                      Frequency
                    </label>
                    <Select
                      value={recurrenceFrequency}
                      onValueChange={(v) =>
                        setRecurrenceFrequency(v as typeof recurrenceFrequency)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recurrenceFrequency === 'weekly' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-(--text-muted)">
                        Repeat on
                      </label>
                      <div className="flex gap-1">
                        {DAY_NAMES.map((name, i) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => toggleDay(i)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition ${
                              recurrenceDays.includes(i)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-input/30 text-(--text-muted) hover:bg-input/50'
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-(--text-muted)">
                      Ends
                    </label>
                    <Select
                      value={recurrenceEndType}
                      onValueChange={(v) =>
                        setRecurrenceEndType(v as typeof recurrenceEndType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="after">
                          After N occurrences
                        </SelectItem>
                        <SelectItem value="on">On date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recurrenceEndType === 'after' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-(--text-muted)">
                        Number of occurrences
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={recurrenceEndCount}
                        onChange={(e) =>
                          setRecurrenceEndCount(Number(e.target.value))
                        }
                      />
                    </div>
                  )}

                  {recurrenceEndType === 'on' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-(--text-muted)">
                        End date
                      </label>
                      <Input
                        type="date"
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {isEditMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createBlockMutation.isPending ||
                createRecurringMutation.isPending ||
                updateBlockMutation.isPending ||
                updateAllMutation.isPending
              }
            >
              {createBlockMutation.isPending ||
              createRecurringMutation.isPending
                ? 'Creating...'
                : updateBlockMutation.isPending || updateAllMutation.isPending
                  ? 'Saving...'
                  : isEditMode
                    ? 'Save Changes'
                    : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
