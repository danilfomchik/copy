// The Content file schema. Later tickets extend it by adding a section here
// (and to content.json): services, listings, notifications, privacy, ...
// Keep each feature's fields in its own const to avoid merge conflicts.
import { arr, obj, str, type Infer } from './validate.ts';

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
  }),
});

const member = obj({
  fullName: str(),
  birthDate: str(),
  tier: str(),
  membershipNumber: str(),
});

const ribbon = obj({ updatedAt: str() });

// Menu tab (Settings, About, Privacy, Help). The About demo notice and the
// Privacy statements are fixed in code, deliberately not editable here.
const menu = obj({
  items: obj({ settings: str(), about: str(), privacy: str(), help: str() }),
  back: str(),
  settings: obj({ themeLabel: str(), light: str(), dark: str(), system: str() }),
  about: obj({ versionLabel: str() }),
  help: obj({ sections: arr(obj({ title: str(), body: str() })) }),
});

export const contentSchema = obj({ ui, member, ribbon, menu });
export type Content = Infer<typeof contentSchema>;
