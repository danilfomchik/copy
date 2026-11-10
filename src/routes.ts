// Route registry: one line per screen module. Later tickets add their routes
// here.
import type { Route } from './router';
import { cardRoutes } from './screens/card';
import { servicesRoutes } from './screens/services';
import { listingsRoutes } from './screens/listings';
import { menuRoutes } from './screens/menu';
import { notificationsRoutes } from './screens/card-notifications';
import { sessionsRoutes } from './screens/sessions';

export const routes: Route[] = [
  ...cardRoutes,
  ...servicesRoutes,
  ...listingsRoutes,
  ...menuRoutes,
  ...notificationsRoutes,
  ...sessionsRoutes,
];
