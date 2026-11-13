import type { Block } from "@/lib/content";

/**
 * Rendu des textes longs de content/ (articles, pages légales).
 * Aucun HTML n'est interprété : le texte est toujours échappé par React.
 */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5 text-[1.0625rem] leading-relaxed text-fg/85">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={index} className="pt-4 text-2xl text-fg">
                {block.text}
              </h2>
            );
          case "ul":
            return (
              <ul key={index} className="space-y-2 pl-1">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-gold-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          default:
            return <p key={index}>{block.text}</p>;
        }
      })}
    </div>
  );
}
