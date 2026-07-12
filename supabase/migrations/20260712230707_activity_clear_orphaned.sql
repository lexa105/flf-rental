-- Allow owners to clear activity of deleted items only (equipment_id is null).
-- Rows still referencing live equipment remain immutable.
create policy "activity_delete_orphaned" on public.activity
  for delete using (auth.uid() = owner_id and equipment_id is null);
