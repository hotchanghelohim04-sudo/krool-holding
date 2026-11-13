import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Liens et navigation qui conservent automatiquement la langue courante.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
