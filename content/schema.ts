// The Content file schema. Later tickets extend it by adding a section here
// (and to content.json): services, listings, notifications, privacy, ...
// Keep each feature's fields in its own const to avoid merge conflicts.
import { obj, str, type Infer } from './validate.ts';

const ui = obj({
  appName: str(),
  tabs: obj({ card: str(), services: str(), listings: str(), menu: str() }),
  tabBarLabel: str(),
  placeholder: str(),
  card: obj({
    label: str(),
    avatarAlt: str(),
    birthDateLabel: str(),
    tierLabel: str(),
    numberLabel: str(),
    ribbonUpdated: str(),
    actions: obj({
      openLabel: str(),
      sheetLabel: str(),
      closeLabel: str(),
      viewDetails: str(),
      downloadPdf: str(),
      refresh: str(),
      refreshing: str(),
    }),
  }),
  details: obj({ title: str(), back: str(), fullNameLabel: str() }),
});

const member = obj({
  fullName: str(),
  birthDate: str(),
  tier: str(),
  membershipNumber: str(),
});

const ribbon = obj({ updatedAt: str(), refreshedAt: str() });

export const contentSchema = obj({ ui, member, ribbon });
export type Content = Infer<typeof contentSchema>;
