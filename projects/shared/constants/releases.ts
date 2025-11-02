import {WtfQuery} from '@shared/interfaces';
import {ReleaseEntry} from '@shared/enums';

export const RELEASES: WtfQuery = {
  path: 'releases',
  limit: 500,
  where: {field: 'date', operator: '!=', value: ''},
  orderBy: {field: 'date', direction: 'desc'},
};

export const RELEASE_ENTRIES = ["Feature", "Improvement", "Bug Fix", "Operation"];

export const RELEASE_ENTRIES_SELECT = [
  {name: RELEASE_ENTRIES[ReleaseEntry.Feature], value: ReleaseEntry.Feature},
  {name: RELEASE_ENTRIES[ReleaseEntry.Improvement], value: ReleaseEntry.Improvement},
  {name: RELEASE_ENTRIES[ReleaseEntry.Fix], value: ReleaseEntry.Fix},
  {name: RELEASE_ENTRIES[ReleaseEntry.Operation], value: ReleaseEntry.Operation},
];

export const RELEASE_ENTRIES_ICONS = ['code', 'integration_instructions', 'bug_report', 'cloud_done'];
