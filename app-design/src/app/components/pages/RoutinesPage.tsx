import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
export function RoutinesPage() {
  const { data } = useUIBootstrap();
  const shell = data?.content_shell ?? {};
  const routines = (shell.routines ?? []) as {
    id: string;
    title: string;
    subtitle: string;
    duration: string;
    color: string;
    icon: string;
  }[];
  const articles = (shell.articles ?? []) as { title: string; tag: string; mins: number }[];
  const featured = shell.routinesFeatured as
    | { tag?: string; title?: string; description?: string; ctaLabel?: string }
    | undefined;

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4">
        <h1>Rotinas</h1>
        <p className="text-sm text-muted-foreground">Guias e rotinas para o bebê</p>
      </div>

      {/* Featured */}
      <div className="px-4 mb-5">
        <div className="bg-gradient-to-br from-primary/15 to-baby-lavender/20 rounded-3xl p-5 border border-primary/10">
          <p className="text-xs text-primary mb-1">{featured?.tag ?? "Destaque"}</p>
          <h3>{featured?.title ?? ""}</h3>
          <p className="text-sm text-muted-foreground mt-1">{featured?.description ?? ""}</p>
          <button className="mt-3 bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm">
            {featured?.ctaLabel ?? "Começar"}
          </button>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="px-4 mb-6">
        <h3 className="mb-3">Rotinas guiadas</h3>
        <div className="grid grid-cols-2 gap-3">
          {routines.map((r) => {
            const RIcon = getIcon(r.icon);
            return (
              <button
                key={r.id}
                className={`bg-gradient-to-br ${r.color} rounded-2xl p-4 text-left border border-border/30 active:scale-[0.97] transition-transform`}
              >
                <RIcon className="w-6 h-6 text-foreground/50 mb-2" />
                <p className="text-sm">{r.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{r.subtitle}</p>
                <p className="text-[10px] text-primary mt-2">{r.duration}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles */}
      <div className="px-4">
        <h3 className="mb-3">Conteúdos</h3>
        <div className="space-y-3">
          {articles.map((a, i) => {
            const BookOpen = getIcon("BookOpen");
            return (
              <div
                key={i}
                className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {a.tag} · {a.mins} min leitura
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
