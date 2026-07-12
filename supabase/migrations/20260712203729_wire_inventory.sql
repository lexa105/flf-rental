-- Wires the inventory UI to live equipment data: backfills null status,
-- defaults new rows to 'available', renames plural categories to their
-- singular canonical ids, and adds serial/checked_out_at columns the UI
-- needs for check-out tracking.

update public.equipment set status = 'available' where status is null;
alter table public.equipment alter column status set default 'available';

update public.equipment set category = 'camera' where category = 'cameras';
update public.equipment set category = 'lens' where category = 'lenses';
update public.equipment set category = 'accessory' where category = 'accessories';

alter table public.equipment add column serial text;
alter table public.equipment add column checked_out_at timestamptz;
