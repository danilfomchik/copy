// The Content file schema. Later tickets extend it by adding a section here
// (and to content.json): services, listings, notifications, privacy, ...
// Keep each feature's fields in its own const to avoid merge conflicts.
import { arr, obj, str, type Infer } from './validate.ts';

const ui = obj({
  appName: str(),
  tabs: obj({ card: str(), services: str(), listings: str(), menu: str() }),
  tabBarLabel: str(),
  placeholder: str(),
  back: str(),
  card: obj({
    label: str(),
    avatarAlt: str(),
    birthDateLabel: str(),
    tierLabel: str(),
    numberLabel: str(),
    ribbonUpdated: str(),
  }),
});

const member = obj({
  fullName: str(),
  birthDate: str(),
  tier: str(),
  membershipNumber: str(),
});

const ribbon = obj({ updatedAt: str() });

// Shared shape of an entry that opens a static detail page (Services; reused
// by Listings). `id` becomes the URL segment.
export const detailItem = obj({
  id: str(),
  title: str(),
  description: str(),
  paragraphs: arr(str()),
});

const services = arr(detailItem);
const listings = arr(detailItem);

export const contentSchema = obj({ ui, member, ribbon, services, listings });
export type Content = Infer<typeof contentSchema>;
