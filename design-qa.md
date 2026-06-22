# Design QA

final result: passed

## Scope

- Removed manual database read/write buttons from the top bar.
- Added automatic Netlify Database load on page entry and debounced autosave after edits.
- Rebuilt Fiscal Calendar as FY2627, from 2026-04-01 to 2027-03-31.
- Added 12-month calendar card view with working day, weekend, public holiday, and weekend workday states.

## Checks

- Production build passes in a clean `/tmp` workspace.
- Calendar module shows FY2627 and the correct date range.
- Manual database buttons are not visible.
- User-facing database status labels and the month "Active" marker are not visible.
- Workspace changes are saved through a silent background POST to the Netlify Function.
- Clicking a weekday marks it as a public holiday.
- Clicking a weekend marks it as a weekend workday.
- Monthly working day totals update from calendar state.
- Desktop viewport matches the supplied resource-planner reference structure: fiscal summary, legend, and four-column month cards.
