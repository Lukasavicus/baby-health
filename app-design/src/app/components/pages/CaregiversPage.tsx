import { useState, useEffect } from "react";
import { Timeline } from "../Timeline";
import { useUIBootstrap } from "../../UIBootstrapContext";

export function CaregiversPage() {
  const { data } = useUIBootstrap();
  const caregivers = (data?.caregivers_feed?.caregivers ?? []) as {
    id: string;
    name: string;
    emoji: string;
  }[];
  const seedFeed = (data?.caregivers_feed?.sharedFeed ?? []) as {
    type: string;
    subType?: string;
    time: string;
    caregiver: string;
    notes?: string;
  }[];

  const [filter, setFilter] = useState("all");
  const [sharedFeed, setSharedFeed] = useState(seedFeed);

  useEffect(() => {
    const f = data?.caregivers_feed?.sharedFeed;
    if (Array.isArray(f)) setSharedFeed(f);
  }, [data]);

  const filtered =
    filter === "all"
      ? sharedFeed
      : sharedFeed.filter((e) => e.caregiver === caregivers.find((c) => c.id === filter)?.name);

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4">
        <h1>Cuidadores</h1>
        <p className="text-sm text-muted-foreground">Atividades compartilhadas</p>
      </div>

      {/* Caregiver filter chips */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {caregivers.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
              filter === c.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <span>{c.emoji}</span>
            {c.name}
          </button>
        ))}
      </div>

      {/* Shared feed */}
      <div className="px-4">
        <div className="bg-card rounded-3xl p-4 shadow-sm border border-border/50">
          <Timeline entries={filtered} />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-4">
        <h3 className="mb-3">Registros por cuidador</h3>
        <div className="grid grid-cols-2 gap-3">
          {caregivers
            .filter((c) => c.id !== "all")
            .map((c) => {
              const count = sharedFeed.filter((e) => e.caregiver === c.name).length;
              return (
                <div
                  key={c.id}
                  className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 text-center"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <p className="text-sm mt-1">{c.name}</p>
                  <p className="text-2xl mt-1">{count}</p>
                  <p className="text-[10px] text-muted-foreground">registros hoje</p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
