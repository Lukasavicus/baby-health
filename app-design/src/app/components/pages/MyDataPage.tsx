import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Database,
  FileDown,
  ShieldAlert,
} from "lucide-react";
import { TrackerDrawer } from "../TrackerDrawer";

export function MyDataPage() {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [exportDone, setExportDone] = useState(false);
  const [deleteDone, setDeleteDone] = useState(false);

  const handleExport = () => {
    // Simulate generating a JSON export
    const data = {
      exportedAt: new Date().toISOString(),
      baby: { name: "Liam", birthDate: "2025-08-05" },
      feedings: [],
      hydration: [],
      sleep: [],
      diapers: [],
      activities: [],
      baths: [],
      health: [],
      milestones: [],
      growth: [],
      vaccines: [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `baby-health-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  };

  const handleDeleteAll = () => {
    // Simulate deletion
    setDeleteOpen(false);
    setDeleteConfirmText("");
    setDeleteDone(true);
    setTimeout(() => setDeleteDone(false), 3000);
  };

  const canDelete = deleteConfirmText.toLowerCase() === "apagar";

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/my-baby")}
          className="p-1 -ml-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1>Meus Dados</h1>
      </div>

      {/* Info banner */}
      <div className="px-4 mb-6">
        <div className="bg-baby-blue/10 border border-baby-blue/20 rounded-2xl p-4 flex items-start gap-3">
          <Database className="w-5 h-5 text-baby-blue shrink-0 mt-0.5" />
          <div>
            <p className="text-sm mb-1">Seus dados são seus</p>
            <p className="text-xs text-muted-foreground">
              Todos os registros ficam armazenados localmente no seu dispositivo.
              Você pode exportar uma cópia completa ou apagar tudo a qualquer momento.
            </p>
          </div>
        </div>
      </div>

      {/* Export Card */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-baby-mint/30 flex items-center justify-center shrink-0">
              <FileDown className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm">Exportar dados</p>
              <p className="text-xs text-muted-foreground">
                Baixe todos os registros em formato JSON
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Inclui alimentação, hidratação, sono, fraldas, atividades, banho,
            saúde, marcos de desenvolvimento, crescimento e vacinas.
          </p>
          <button
            onClick={handleExport}
            className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Download className="w-4 h-4" />
            Baixar todos os dados
          </button>
          {exportDone && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-primary">
              <CheckCircle2 className="w-4 h-4" />
              Arquivo exportado com sucesso!
            </div>
          )}
        </div>
      </div>

      {/* Delete Card */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-destructive/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm">Apagar todos os dados</p>
              <p className="text-xs text-muted-foreground">
                Ação irreversível
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Todos os registros do app serão permanentemente removidos.
            Recomendamos exportar seus dados antes de prosseguir.
          </p>
          <button
            onClick={() => setDeleteOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-destructive/10 text-destructive text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform border border-destructive/20"
          >
            <Trash2 className="w-4 h-4" />
            Apagar tudo
          </button>
          {deleteDone && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-primary">
              <CheckCircle2 className="w-4 h-4" />
              Todos os dados foram apagados.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Drawer */}
      <TrackerDrawer open={deleteOpen} onOpenChange={setDeleteOpen} title="Confirmar exclusão">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </div>

              <p className="text-sm text-center mb-2">
                Tem certeza que deseja apagar todos os dados?
              </p>
              <p className="text-xs text-muted-foreground text-center mb-6">
                Esta ação não pode ser desfeita. Todos os registros de alimentação,
                sono, fraldas, crescimento, marcos e demais dados serão
                permanentemente removidos.
              </p>

              <div className="mb-6">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Digite <span className="text-destructive">APAGAR</span> para confirmar
                </label>
                <input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="APAGAR"
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                />
              </div>

              <button
                onClick={handleDeleteAll}
                disabled={!canDelete}
                className={`w-full py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all ${
                  canDelete
                    ? "bg-destructive text-white active:scale-[0.98]"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Apagar permanentemente
              </button>
      </TrackerDrawer>
    </div>
  );
}
