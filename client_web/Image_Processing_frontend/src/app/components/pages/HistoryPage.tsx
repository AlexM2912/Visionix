import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  History,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { api, BatchSummary } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

function formatExecutionTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "--";
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} s`;
  }

  return `${value.toFixed(0)} ms`;
}

export function HistoryPage() {
  const { session } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!session?.token) {
        return;
      }

      try {
        const response = await api.listBatches(session.token);
        if (!cancelled) {
          setBatches(response.data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  const filteredBatches = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const numericSearch = normalizedSearch.replace(/[^0-9]/g, "");

    return batches.filter((batch) => {
      const batchId = String(batch.id);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        batchId.includes(normalizedSearch) ||
        (numericSearch.length > 0 && batchId.includes(numericSearch)) ||
        `lote ${batchId}`.includes(normalizedSearch) ||
        `#${batchId}`.includes(normalizedSearch);

      const matchesStatus = statusFilter === "all" || batch.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [batches, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-cyan-400 glow-text-cyan">Historial de Procesamiento</h1>
        <p className="text-muted-foreground">Visualiza y gestiona tus lotes de procesamiento</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por id de lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">Todos los Estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="COMPLETADO">Completados</option>
              <option value="ERROR">Fallidos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Lotes", value: batches.length, icon: History, color: "cyan" },
          { label: "Completados", value: batches.filter((b) => b.estado === "COMPLETADO").length, icon: CheckCircle2, color: "green" },
          { label: "Fallidos", value: batches.filter((b) => b.estado === "ERROR").length, icon: XCircle, color: "red" },
          { label: "Total de Imágenes", value: batches.reduce((sum, b) => sum + Number(b.cantidadImagenes || 0), 0), icon: Clock, color: "purple" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <h3 className="text-2xl mt-1">{stat.value}</h3>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color === "green" ? "text-green-400" : stat.color === "cyan" ? "text-cyan-400" : stat.color === "red" ? "text-red-400" : "text-purple-400"}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Historial de Lotes ({filteredBatches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!loading && filteredBatches.length > 0 ? filteredBatches.map((batch, index) => (
              <motion.div
                key={batch.id}
                className="p-4 rounded-lg border border-border hover:border-cyan-500/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg">Lote #{batch.id}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        batch.estado === "COMPLETADO" ? "bg-green-500/20 text-green-400" :
                        batch.estado === "ERROR" ? "bg-red-500/20 text-red-400" :
                        "bg-cyan-500/20 text-cyan-400"
                      }`}>
                        {batch.estado}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(batch.fechaRecepcion).toLocaleString()}
                      </span>
                      <span>{batch.cantidadImagenes} imágenes</span>
                      <span>{Number(batch.porcentajeProgreso || 0)}% progreso</span>
                      <span>Promedio: {formatExecutionTime(Number(batch.tiempoPromedioEjecucion || 0))}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/app/processing/${batch.id}`}>
                      <Button size="sm" className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50">
                        <Eye className="w-4 h-4 mr-1" />
                        Seguimiento
                      </Button>
                    </Link>
                    <Link to={`/app/results/${batch.id}`}>
                      <Button size="sm" className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50">
                        <Eye className="w-4 h-4 mr-1" />
                        Resultados
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {loading ? "Cargando lotes..." : "No hay lotes disponibles todavía."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
