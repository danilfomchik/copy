// Route registry: one line per screen module. Later tickets add their routes
// here (and replace the placeholder export of their tab).
import type { Route } from './router';
import { cardRoutes } from './screens/card';
import { servicesRoutes } from './screens/services';
import { listingsRoutes } from './screens/listings';
import { menuRoutes } from './screens/menu';

export const routes: Route[] = [
  ...cardRoutes,
  ...servicesRoutes,
  ...listingsRoutes,
  ...menuRoutes,
];
