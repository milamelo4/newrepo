CREATE TYPE public.account_type AS ENUM
    ('Client', 'Employee', 'Adimn');

ALTER TYPE public.account_type
    OWNER TO cse340;