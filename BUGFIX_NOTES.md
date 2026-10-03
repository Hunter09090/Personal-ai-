# CRUD Bugfix Notes

The workspace uses `dashboard.js` as the single source of truth for the dynamic CRUD form. A temporary duplicate capture-phase handler introduced by the previous reliability layer could compete with the main form handler. The repair layer has been removed so Add/Edit writes are handled once by `dashboard.js`.

## Current CRUD path
- Add: `openForm()` -> `dynamicForm.onsubmit` -> `add()`
- Edit: `openForm(type, item)` -> `dynamicForm.onsubmit` -> `patch()`
- Delete: delegated click handler -> `del()`
- Task completion: delegated change handler -> `patch()`

## Validation
- Required fields are checked before writes.
- Study progress is clamped to 0–100.
- Result marks/total are validated.
- Finance amount is validated.

The PWA cache version is bumped when the repair is deployed so installed users do not keep the obsolete repair layer.
