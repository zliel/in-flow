export interface RecurrencePattern {
  frequency: 'daily' | 'weekdays' | 'weekly' | 'monthly'
  interval: number
  days?: number[]
  endType?: 'never' | 'after' | 'on'
  endCount?: number
  endDate?: string
}

export interface BlockType {
  id: string
  user_id: string
  name: string
  color: string
  default_energy_required: number
  created_at: string
}

export interface Block {
  id: string
  user_id: string
  block_type_id: string | null
  title: string | null
  start_time: string
  end_time: string
  is_recurring: boolean
  recurrence_pattern: RecurrencePattern | null
  recurrence_group_id: string | null
  created_at: string
}
