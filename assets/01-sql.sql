-- 查询数据库表
SELECT table_name
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name

-- 查询列名注释

SELECT --*
       --column_name, udt_name, is_nullable
       cols.column_name,
       cols.udt_name,
       cols.is_nullable,
       pgd.description as column_comment
FROM information_schema.columns cols
         LEFT JOIN
     pg_catalog.pg_description pgd ON pgd.objsubid = cols.ordinal_position
         AND pgd.objoid = (SELECT c.oid
                           FROM pg_catalog.pg_class c
                           WHERE c.relname = cols.table_name)
WHERE table_name = 'fdm_card'
  and table_schema = 'public'


-- 查询表名注释

SELECT c.relname AS table_name, d.description AS table_comment
FROM pg_description d
         JOIN pg_class c ON d.objoid = c.oid
WHERE c.relkind = 'r'
  AND d.objsubid = 0;

-- 查询列名注释
SELECT cols.table_name,
       cols.column_name,
       cols.data_type,
       cols.column_default,
       cols.is_nullable,
       cols.character_maximum_length,
       cols.numeric_precision,
       cols.numeric_scale,
       cols.ordinal_position,
       pgd.description as column_comment
FROM information_schema.columns cols
         LEFT JOIN
     pg_catalog.pg_description pgd ON pgd.objsubid = cols.ordinal_position
         AND pgd.objoid = (SELECT c.oid
                           FROM pg_catalog.pg_class c
                           WHERE c.relname = cols.table_name)
WHERE cols.table_name = 'fdm_card';
