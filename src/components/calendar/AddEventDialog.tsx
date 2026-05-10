import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
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
import { createBlock, updateBlock, deleteBlock } from '@/utils/server-blocks'
import type { BlockType, Block } from '@/types'

interface AddEventDialogProps {
  blockTypes: BlockType[]
  onAddBlockType?: () => void
}

export default function AddEventDialog({ blockTypes, onAddBlockType = () => {} }: AddEventDialogProps) {
  const {
    isAddEventOpen,
    setIsAddEventOpen,
    currentDate,
    selectedBlock,
    setSelectedBlock,
  } = useCalendar()
  const queryClient = useQueryClient()
  const isEditMode = !!selectedBlock

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

  const createBlockFn = useServerFn(createBlock)
  const updateBlockFn = useServerFn(updateBlock)
  const deleteBlockFn = useServerFn(deleteBlock)

  useEffect(() => {
    if (selectedBlock && isAddEventOpen) {
      setTitle(selectedBlock.title || '')
      setBlockTypeId(selectedBlock.block_type_id || '')
      const start = new Date(selectedBlock.start_time)
      const end = new Date(selectedBlock.end_time)
      setStartTime(format(start, "yyyy-MM-dd'T'HH:mm"))
      setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"))
    } else if (!isAddEventOpen) {
      setTitle('')
      setBlockTypeId('')
      const date = new Date(currentDate)
      date.setHours(9, 0, 0, 0)
      setStartTime(format(date, "yyyy-MM-dd'T'HH:mm"))
      date.setHours(10, 0, 0, 0)
      setEndTime(format(date, "yyyy-MM-dd'T'HH:mm"))
    }
  }, [selectedBlock, isAddEventOpen, currentDate])

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
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData<{
        blockTypes: BlockType[]
        blocks: Block[]
      }>(['blocks'], {
        blockTypes: previous?.blockTypes ?? [],
        blocks: [...(previous?.blocks ?? []), optimisticBlock],
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['blocks'], context.previous)
      }
    },
    onSuccess: () => {
      handleClose()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
    },
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
        queryClient.setQueryData<{
          blockTypes: BlockType[]
          blocks: Block[]
        }>(['blocks'], {
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
        })
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['blocks'], context.previous)
      }
    },
    onSuccess: () => {
      handleClose()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
    },
  })

  const deleteBlockMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBlock) return null
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
        queryClient.setQueryData<{
          blockTypes: BlockType[]
          blocks: Block[]
        }>(['blocks'], {
          ...previous,
          blocks: previous.blocks.filter(
            (block) => block.id !== selectedBlock.id,
          ),
        })
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['blocks'], context.previous)
      }
    },
    onSuccess: () => {
      handleClose()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
    },
  })

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
      updateBlockMutation.mutate()
    } else {
      createBlockMutation.mutate()
    }
  }

  const handleClose = () => {
    setIsAddEventOpen(false)
    setSelectedBlock(null)
    setError('')
  }

  const handleDelete = () => {
    if (
      selectedBlock &&
      confirm('Are you sure you want to delete this event?')
    ) {
      deleteBlockMutation.mutate()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    }
  }

  const handleInvalid = (e: React.FormEvent) => {
    e.preventDefault()
    setError('Please fill in all required fields')
  }

  const handleBlockTypeChange = (value: string) => {
    if (value === 'add-new-block-type') {
      onAddBlockType()
      // Don't change the selected value — keep the previous one
      return
    }
    setBlockTypeId(value)
  }

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
            <Select value={blockTypeId} required onValueChange={handleBlockTypeChange}>
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

          <DialogFooter>
            {isEditMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteBlockMutation.isPending}
              >
                {deleteBlockMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createBlockMutation.isPending || updateBlockMutation.isPending
              }
            >
              {createBlockMutation.isPending || updateBlockMutation.isPending
                ? isEditMode
                  ? 'Saving...'
                  : 'Creating...'
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
