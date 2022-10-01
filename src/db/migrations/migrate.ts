
/*
The goal is to manage database schema so that version numbers are always brought up to latest.
Django does this for you, I'm trying to model that in the simplest way possible.

[ ] db has a version number field by default. this will be the latest applied migration.
[ ] the files in /migrations will be read and applied automatically
  [ ] start with the migration +1 from db.version
  [ ] end with the latest migration
[ ] this process returns a promise or is async. the server does not start properly until this
    is finished.

*/

/*

can I pull sqlite files from this folder and run them?
I would get syntax highlighting (I think) and I could easily build the migration manager
around that system. The version number would be tied directly to the sequence of files.
Undo would be... well. Undo would be.

[ ] In dev server mode this should always backup the db in case of breaking changes.
  [ ] Or maybe it just should regardless.



Okay, so, migrations up are easy. I can easily compare db.version(5) to latest(7) and apply
the two most recent.

What I'm not sure about is a down migration. If I want to undo the two most recent changes.
Hm...
I guess it always has to be forward, huh...
If there were multiple copies of the Db, and someone else was downloading your edits and
applies your migrations, they need theirs to undo as well.
I suppose that makes sense.

I want a convenient, low-risk place to fuck around, though.
I think the biggest problem is just visibility.
If migration 52 drops a table that was created in 3, that's... fine, but it's harder to keep
track of mentally.

Also, migration conflicts... I'm not worried about that now, but jesus I can't even imagine.
Two people working independently on the same database schema. Yuck.

What if we end up with two migration-52 through 68?
How do you decide which order to execute them in.
Absolutely nasty.

Anyway, if you backup the database,
then do your playground edits,
then finalize your up migration,
then apply that to the backup and git-push,
uhh... this is fine, I think.
Besides that I just want a neat gui tool.

*/