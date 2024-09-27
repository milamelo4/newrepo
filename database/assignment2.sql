-- 1-The Tony Stark insert SQL statement works.
insert into public.account 
values(DEFAULT,'Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2-Modify the Tony Stark record to change the account_type to `Admin`
Update public.account
set account_type = 'Admin'
where account_id = '1';

-- 3-Delete the Tony Stark record from the database
delete from public.account
where account_id = '1';

-- 4-The description update SQL statement works.
Update public.inventory
set inv_description = replace(inv_description, 'small interiors', 'a huge interior')
where inv_make = 'GM' and inv_model = 'Hummer';

-- 5-The select query using a JOIN SQL statement works
select inv_model, inv_make, cla.classification_name
from public.inventory as inv
inner join public.classification as cla 
on inv.classification_id = cla.classification_id
where cla.classification_name = 'Sport';

-- 6-The inv_image and inv_thumbnail update query works
update public.inventory
set inv_image = replace(inv_image, '/images/', '/images/vehicles/'),
inv_thumbnail = replace(inv_thumbnail, '/images/', '/images/vehicles/')
where inv_image like '/images/%' or inv_thumbnail like '/images/%';
