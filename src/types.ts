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
  created_at: string
}

