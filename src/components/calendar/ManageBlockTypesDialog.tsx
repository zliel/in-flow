import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createBlockType,
  updateBlockType,
  deleteBlockType,
} from '@/utils/server-blocks'
import type { BlockType } from '@/types'

type ViewMode = 'list' | 'form'

interface ManageBlockTypesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blockTypes: BlockType[]
}

const blockTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().min(1, 'Color is required'),
  defaultEnergyRequired: z.coerce.number().min(1).max(5),
})

const energyLabels = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High']
const energyColors = [
  '',
  'bg-(--energy-low)',
  'bg-(--energy-low)',
  'bg-(--energy-medium)',
  'bg-(--energy-high)',
  'bg-(--energy-high)',
]

const colorPresets = [
  '#6b8bc4',
  '#4a6fa8',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#ef4444',
]

function EnergyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`size-2.5 rounded-full ${
            i < level ? energyColors[level] : 'bg-(--border)'
          }`}
        />
      ))}
    </div>
  )
}

function BlockTypeForm({
  editingBlockType,
  onSuccess,
  onCancel,
}: {
  editingBlockType: BlockType | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const queryClient = useQueryClient()
  const isEdit = !!editingBlockType

  const [name, setName] = useState(editingBlockType?.name ?? '')
  const [color, setColor] = useState(editingBlockType?.color ?? '#6b8bc4')
  const [energy, setEnergy] = useState(
    String(editingBlockType?.default_energy_required ?? 3),
  )
  const [error, setError] = useState('')

  const createBlockTypeFn = useServerFn(createBlockType)
  const updateBlockTypeFn = useServerFn(updateBlockType)

  const createMutation = useMutation({
    mutationFn: async () =>
      await createBlockTypeFn({
        data: {
          name,
          color,
          defaultEnergyRequired: parseInt(energy),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockTypes'] })
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      onSuccess()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingBlockType) return null
      return await updateBlockTypeFn({
        data: {
          blockTypeId: editingBlockType.id,
          name,
          color,
          defaultEnergyRequired: parseInt(energy),
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockTypes'] })
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      onSuccess()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = blockTypeSchema.safeParse({
      name,
      color,
      defaultEnergyRequired: energy,
    })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    if (isEdit) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="bt-name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="bt-name"
          placeholder="e.g. Deep Work"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="size-9 cursor-pointer rounded-lg border border-(--border) bg-transparent p-0.5"
          />
          <div className="flex gap-1.5">
            {colorPresets.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`size-7 rounded-full border-2 transition-all ${
                  color === c
                    ? 'border-(--text) scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="bt-energy" className="text-sm font-medium">
          Default Energy Required
        </label>
        <Select value={energy} onValueChange={setEnergy}>
          <SelectTrigger className="w-full" id="bt-energy">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Very Low</SelectItem>
            <SelectItem value="2">2 - Low</SelectItem>
            <SelectItem value="3">3 - Medium</SelectItem>
            <SelectItem value="4">4 - High</SelectItem>
            <SelectItem value="5">5 - Very High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Saving...'
            : isEdit
              ? 'Save Changes'
              : 'Create'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function ManageBlockTypesDialog({
  open,
  onOpenChange,
  blockTypes,
}: ManageBlockTypesDialogProps) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<ViewMode>('list')
  const [editingBlockType, setEditingBlockType] = useState<BlockType | null>(
    null,
  )
  const [deletingBlockType, setDeletingBlockType] = useState<BlockType | null>(
    null,
  )
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const deleteBlockTypeFn = useServerFn(deleteBlockType)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deletingBlockType) return null
      return await deleteBlockTypeFn({
        data: { blockTypeId: deletingBlockType.id },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockTypes'] })
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
      setDeleteConfirmOpen(false)
      setDeletingBlockType(null)
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setMode('list')
      setEditingBlockType(null)
      setDeletingBlockType(null)
      setDeleteConfirmOpen(false)
    }
    onOpenChange(open)
  }

  const handleEdit = (bt: BlockType) => {
    setEditingBlockType(bt)
    setMode('form')
  }

  const handleDeleteClick = (bt: BlockType) => {
    setDeletingBlockType(bt)
    setDeleteConfirmOpen(true)
  }

  const handleCreateNew = () => {
    setEditingBlockType(null)
    setMode('form')
  }

  const handleFormSuccess = () => {
    setMode('list')
    setEditingBlockType(null)
  }

  const handleFormCancel = () => {
    setMode('list')
    setEditingBlockType(null)
  }

  const dialogTitle =
    mode === 'form'
      ? editingBlockType
        ? 'Edit Block Type'
        : 'Create Block Type'
      : 'Manage Block Types'

  const dialogDescription =
    mode === 'form'
      ? editingBlockType
        ? 'Update the block type details.'
        : 'Add a new category for your calendar events.'
      : 'Edit, add, or remove block type categories.'

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-w-[calc(100%-2rem)] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          {mode === 'list' ? (
            <>
              <div className="mb-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNew}
                  className="w-full"
                >
                  + New Block Type
                </Button>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 py-2 -mx-6 px-6">
                {blockTypes.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <p className="text-sm text-(--text-muted)">
                      No block types yet.
                    </p>
                    <Button variant="ghost" size="sm" onClick={handleCreateNew}>
                      Create your first one
                    </Button>
                  </div>
                ) : (
                  blockTypes.map((bt) => (
                    <Card key={bt.id} size="sm" className="overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div
                          className="size-4 shrink-0 rounded-full ring-1 ring-foreground/10"
                          style={{ backgroundColor: bt.color }}
                        />
                        <span className="flex-1 text-sm font-medium truncate">
                          {bt.name}
                        </span>
                        <div className="hidden sm:flex items-center gap-2 mr-2">
                          <span className="text-xs text-(--text-muted)">
                            Energy:
                          </span>
                          <EnergyDots level={bt.default_energy_required} />
                          <span className="text-xs text-(--text-subtle) ml-1">
                            {energyLabels[bt.default_energy_required]}
                          </span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEdit(bt)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => handleDeleteClick(bt)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      {/* Mobile-only energy row */}
                      <div className="flex sm:hidden items-center gap-2 px-4 pb-3 pt-0">
                        <span className="text-xs text-(--text-muted)">
                          Energy:
                        </span>
                        <EnergyDots level={bt.default_energy_required} />
                        <span className="text-xs text-(--text-subtle)">
                          {energyLabels[bt.default_energy_required]}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="overflow-y-auto flex-1">
              <BlockTypeForm
                editingBlockType={editingBlockType}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Delete Block Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium text-(--text)">
                {deletingBlockType?.name}
              </span>
              ? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
