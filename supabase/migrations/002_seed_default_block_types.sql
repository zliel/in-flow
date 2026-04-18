-- seed_default_block_types: Creates default block types for new users
-- This function is called when a user first signs up to populate default block categories

create or replace function public.seed_default_block_types(p_user_id text)
returns void
language plpgsql
security definer
as $$
begin
  -- Only seed if user has no block types yet
  if not exists (
    select 1 from public.block_types where user_id = p_user_id
  ) then
    insert into public.block_types (user_id, name, color, default_energy_required) values
      (p_user_id, 'Deep Work', '#8b5cf6', 4),
      (p_user_id, 'Meetings', '#10b981', 2),
      (p_user_id, 'Admin', '#6366f1', 2),
      (p_user_id, 'Exercise', '#f59e0b', 3),
      (p_user_id, 'Breaks', '#ef4444', 1);
  end if;
end;
$$;

-- Grant execute permission to authenticated role
grant execute on function public.seed_default_block_types(text) to authenticated;