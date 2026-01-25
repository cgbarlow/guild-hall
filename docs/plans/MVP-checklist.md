# MVP checklist
1. GM Users page needs to work properly. Currently no users are displayed.
2. Review queue is not working. Currently when evidence is submitted, the notification appears for the GM but nothing shows up in the review queue.
3. Completion of a quest. Currently when all objectives of a quest are completed, nothing happens. We need to plan what should happen together and create a spec for this, then build it. You'll research what documentation we have around this and what scaffolding is in place already, then ask me questions to build the plan.
4. On the dashboard view, remove link to Dashboard on top right of header bar, it is unnecessary
5. Fix user profile 'Error loading profile: Could not find the table 'public.profiles' in the schema cache'
6. Create a new Role called Admin. the Admin has the ability to create Chapters. The Chapter is a user setting that is stored in the user profile, available chapters can be selected by the user within their Profile. Only the Admin has the ability to assign GM role to others, GMs cannot do this. 
8. If someone has Admin role, instead of seeing GM link in the top header, they see Admin. Admin has access to do everything. Their view looks like GMs, with addition of 'Guild' on nav bar on left. 
9. Beneath the Guild page there will be the settings for the Guild. This is where they add/modify chapters, and also set a Logo for the guild.
10. The Logo will be shown on the top header, to the right of the Guild Hall heading.
11. When GM role is assigned, the Admin must also select which Chapter the GM role is for. GM role is a per-chapter setting, that means the GM can only modify users, quests, receive notifications etc for things within their given chapter.
12. Quests are now per-chapter. users only see quests available for their chapter. When a new quest is created, there is a choice for the quest to be available to either all chapters (the default) or to be available for select chapters (a drop-down is given showing which chapters the GM has access to create quests in)
13. Add new role for Quest Master (QM). They have ability to create quests. Any new quest they create must go for approval to the GM.
14. Notifications for anything requiring review will be sent to all GMs in the given chapter based on who sent the notification.
15. add ability for users to un-check 'Complete' status for quest objectives.
16. Fix the issue where I click on a user on the Leaderboard and get this issue:

```
Runtime Error
Server


Attempted to call fetchPublicProfile() from the server but fetchPublicProfile is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.

src/app/users/[id]/page.tsx (52:42) @ PublicProfilePage


  50 |   const { id } = await params
  51 |   const supabase = await createClient()
> 52 |   const result = await fetchPublicProfile(supabase, id)
     |                                          ^
  53 |
  54 |   // Handle different result statuses
  55 |   switch (result.status) {
Call Stack
6

Show 5 ignore-listed frame(s)
PublicProfilePage
src/app/users/[id]/page.tsx (52:42)
```

## In summary
Based on all of the above, let's first figure out what changes are required to the current data model. Any new/modified ADRs and Specs must be outlined as well. We'll follow TDD, DRY, Spec-first development. Any new features/bug fixes will have their own branch, merged with no PRs. Production code no mocks.