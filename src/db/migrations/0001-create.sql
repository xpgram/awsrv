-- Up
create table Migrations (name text);

create table WarGame (id integer primary key, MapName text);
insert into WarGame (id, name) values (1, 'Metro Island');

-- Down
drop table WarGame;

  -- What if I forget to write a comprehensive down method? Keep it simple stupid?