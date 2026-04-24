import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  Image,
  Server,
  Clock,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { api, BatchSummary } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

  export function DashboardPage() {
    const { session } = useAuth();
    const [batches, setBatches] = useState<BatchSummary[]>([]);

    useEffect(() => {
    if (!session?.token) return;

    let cancelled = false;

    async function load() {
      try {
        const response = await api.listBatches(session.token);
        if (!cancelled) {
          setBatches(response.data);
        }
      } catch (e) {
        console.error(e);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []); // 🔥 CAMBIO CLAVE

  const statsData = useMemo(() => {
    const totalImages = batches.reduce((sum, batch) => sum + Number(batch.cantidadImagenes || 0), 0);
    const completed = batches.filter((batch) => batch.estado === "COMPLETADO").length;
    const successRate = batches.length > 0 ? `${Math.round((completed / batches.length) * 100)}%` : "--";
    const totalProcessedImages = batches.reduce((sum, batch) => sum + Number(batch.procesadas || 0), 0);
    const totalExecutionTime = batches.reduce((sum, batch) => sum + Number(batch.tiempoTotalEjecucion || 0), 0);
    const averageExecutionTime = totalProcessedImages > 0 ? totalExecutionTime / totalProcessedImages : 0;

    const formatExecutionTime = (value: number) => {
      if (!Number.isFinite(value) || value <= 0) {
        return "--";
      }

      if (value >= 1000) {
        return `${(value / 1000).toFixed(2)} s`;
      }

      return `${value.toFixed(0)} ms`;
    };

    return [
      { label: "Imágenes Procesadas", value: String(totalImages), change: `${batches.length} lotes`, icon: Image, color: "cyan" },
      { label: "Lotes Activos", value: String(batches.filter((batch) => batch.estado === "EN_PROCESO").length), change: "En tiempo real", icon: Server, color: "purple" },
      { label: "Tasa de Éxito", value: successRate, change: `${completed} completados`, icon: CheckCircle2, color: "green" },
      {
        label: "Tiempo Promedio",
        value: formatExecutionTime(averageExecutionTime),
        change: totalProcessedImages > 0 ? `${totalProcessedImages} imágenes medidas` : "Sin imágenes procesadas",
        icon: Clock,
        color: "blue",
      },
    ];
  }, [batches]);

  const recentActivity = batches.slice(0, 5).map((batch) => ({
    id: batch.id,
    action: `Lote #${batch.id} en estado ${batch.estado}`,
    time: new Date(batch.fechaRecepcion).toLocaleString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-cyan-400 glow-text-cyan">Panel de Control</h1>
        <p className="text-muted-foreground">Monitorea tu sistema distribuido de procesamiento de imágenes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:border-cyan-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <h3 className="text-2xl text-foreground mb-1">{stat.value}</h3>
                      <p className="text-sm text-cyan-400">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color === "cyan" ? "bg-cyan-500/10" : stat.color === "purple" ? "bg-purple-500/10" : stat.color === "green" ? "bg-green-500/10" : "bg-blue-500/10"}`}>
                      <Icon className={`w-6 h-6 ${stat.color === "cyan" ? "text-cyan-400" : stat.color === "purple" ? "text-purple-400" : stat.color === "green" ? "text-green-400" : "text-blue-400"}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Resumen de Lotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batches.length > 0 ? batches.slice(0, 6).map((batch) => (
                  <div key={batch.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm text-foreground mb-1">Lote #{batch.id}</h4>
                        <p className="text-xs text-muted-foreground">{new Date(batch.fechaRecepcion).toLocaleString()}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${batch.estado === "COMPLETADO" ? "bg-green-500/20 text-green-400" : batch.estado === "ERROR" ? "bg-red-500/20 text-red-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                        {batch.estado}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="text-cyan-400">{Number(batch.porcentajeProgreso || 0)}%</span>
                      </div>
                      <div className="h-1 bg-background rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Number(batch.porcentajeProgreso || 0)}%` }} />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="md:col-span-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                    No hay lotes disponibles para mostrar.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                    <div className="p-1 rounded-full bg-cyan-500/20">
                      <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                    La actividad reciente aparecerá aquí cuando haya lotes registrados.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
