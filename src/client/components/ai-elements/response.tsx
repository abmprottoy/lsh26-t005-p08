import { Streamdown } from "streamdown";
import "streamdown/styles.css";

export function MessageResponse({ children, streaming = false }: { children: string; streaming?: boolean }) {
  return (
    <Streamdown
      animated
      isAnimating={streaming}
      tableMaxHeight={280}
      controls={{
        table: false,
        code: { copy: true, download: false },
        mermaid: false,
        image: false,
      }}
      className="ai-response min-w-0 max-w-full [&_a]:text-emerald-700 [&_a]:underline dark:[&_a]:text-emerald-300 [&_li]:my-1 [&_ol]:my-2 [&_p]:my-0 [&_p+p]:mt-2 [&_table]:w-full [&_th]:bg-slate-50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left dark:[&_th]:bg-zinc-700 [&_td]:border-t [&_td]:border-slate-200 [&_td]:px-2 [&_td]:py-1.5 dark:[&_td]:border-zinc-700"
    >
      {children}
    </Streamdown>
  );
}
