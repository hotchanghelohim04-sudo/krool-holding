import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";

/**
 * Transmet au navigateur uniquement les traductions nécessaires aux composants
 * client qu'il enveloppe (allège la page : les autres textes restent côté serveur).
 */
export async function ClientMessages({ namespaces, children }: { namespaces: string[]; children: ReactNode }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={Object.fromEntries(namespaces.map((ns) => [ns, messages[ns]]))}>
      {children}
    </NextIntlClientProvider>
  );
}
