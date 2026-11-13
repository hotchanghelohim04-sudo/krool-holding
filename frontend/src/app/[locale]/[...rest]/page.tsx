import { notFound } from "next/navigation";

// Route qui ne rend jamais de contenu : on la sort de la validation « instant navigation ».
export const instant = false;

// Toute URL inconnue sous /fr ou /en affiche la page 404 traduite.
export default function CatchAllPage() {
  notFound();
}
