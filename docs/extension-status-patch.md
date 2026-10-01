# Reusable extension-status patch

This fork preserves the two existing stats/project lines and adds an optional
third line for plugins using `ctx.ui.setStatus()`, including
`@calesennett/pi-codex-usage`. No quota is fetched by the footer itself.
No third line appears when there are no nonempty statuses. Statuses are sorted
by extension ID, kept single-line, and clipped with the existing CJK-safe width
helper; very narrow panes may not show the entire quota text. ANSI colors are
preserved. Pi schedules a render when a plugin changes its status.

## Use the fork

After reviewing it, replace the upstream footer package with this fork (do not
load both footers):

```sh
pi remove npm:pi-status-footer
pi install git:github.com/dracossan/pi-status-footer@extension-status-support
```

Install the separate quota provider if wanted:

```sh
pi install npm:@calesennett/pi-codex-usage
```

Then run `/reload` and `/codex-usage-mode left`. The quota provider needs its
supported Codex subscription authentication; this patch does not supply auth.
These installation instructions have not been executed as part of this change.

## Reapply after updating the upstream npm package

`patches/extension-status.patch` contains only the `stats-footer.ts` changes,
based on upstream commit `b97f0567ca8fcaab8d6c88833bb8c4ec43a3a80b`
(package version 1.0.5). Keep a clone of this fork outside `node_modules`, since
npm updates can replace installed package contents.

After updating, stop or leave idle affected Pi sessions before editing the
installed package. From the updated package directory, first check the patch:

```sh
cd ~/.pi/agent/npm/node_modules/pi-status-footer
git apply --check "$HOME/pi-status-footer/patches/extension-status.patch"
git apply "$HOME/pi-status-footer/patches/extension-status.patch"
```

Use your actual clone location instead of `$HOME/pi-status-footer` if
necessary. Do not run the second command if the check fails. Upstream changes
may require rebasing the patch; do not force it. If already applied, a reverse
check identifies that state without modifying anything:

```sh
git apply --reverse --check "$HOME/pi-status-footer/patches/extension-status.patch"
```

Reload Pi after applying. No automatic update hook is installed. When updating
this fork itself, preserve/rebase the status-support commit rather than
reapplying an already present patch. Validate with `npm test` using installed
Pi runtime peers; tests cover existing layout/TPS and synthetic extension
status updates/removal. They are not a live quota/network or TUI certification.
