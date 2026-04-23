import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { motion } from "motion/react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Server,
  Clock,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { api, BatchDetail, BatchLog } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export function ProcessingPage() {
  const { batchId } = useParams();
  const { session } = useAuth();
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [logs, setLogs] = useState<BatchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    async function load() {
      if (!session?.token || !batchId) {
        return;
      }

      try {
        const [detailResponse, statusResponse, logsResponse] = await Promise.all([
          api.getBatchDetail(session.token, batchId),
          api.getBatchStatus(session.token, batchId),
          api.getBatchLogs(session.token, batchId),
        ]);

        if (!cancelled) {
          const nextDetail = {
            ...detailResponse.data,
            estado: statusResponse.data.estado || detailResponse.data.estado,
          };

          setDetail(nextDetail);
          setLogs(logsResponse.data);
          setError("");

          const images = nextDetail.imagenes || [];
          const terminalCount = images.filter((img) => img.estado === "PROCESADA" || img.estado === "ERROR").length;

          if (intervalId && images.length > 0 && terminalCount === images.length) {
            window.clearInterval(intervalId);
            intervalId = undefined;
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "No fue posible consultar el lote");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    intervalId = window.setInterval(load, 5000);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [batchId, session?.token]);

  const images = detail?.imagenes || [];
  const completedCount = images.filter((img) => img.estado === "PROCESADA").length;
  const errorCount = images.filter((img) => img.estado === "ERROR").length;
  const processingCount = images.filter((img) => img.estado === "EN_PROCESO" || img.estado === "PENDIENTE").length;
  const terminalCount = completedCount + errorCount;
  const effectiveBatchProgress = images.length > 0
    ? (terminalCount / images.length) * 100
    : Number(detail?.porcentajeProgreso || 0);
  const effectiveBatchState = useMemo(() => {
    if (!detail) {
      return "PENDIENTE";
    }

    if (images.length === 0) {
      return detail.estado;
    }

    if (terminalCount === images.length) {
      return errorCount > 0 ? "ERROR" : "COMPLETADO";
    }

    if (completedCount > 0 || processingCount > 0) {
      return "EN_PROCESO";
    }

    return "PENDIENTE";
  }, [completedCount, detail, errorCount, images.length, processingCount, terminalCount]);
  const timeline = useMemo(() => {
    return logs.map((log) => ({
      time: new Date(log.fechaHora).toLocaleTimeString(),
      level:
        log.nivel === "ERROR"
          ? "warning"
          : log.nivel === "INFO"
            ? "info"
            : "success",
      message: log.mensaje,
    }));
  }, [logs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-cyan-400 glow-text-cyan">
          {effectiveBatchState === "COMPLETADO"
            ? `Lote #${batchId} Completado`
            : effectiveBatchState === "ERROR"
              ? `Lote #${batchId} Finalizado con Errores`
              : `Procesando Lote #${batchId}`}
        </h1>
        <p className="text-muted-foreground">
          {effectiveBatchState === "COMPLETADO" || effectiveBatchState === "ERROR"
            ? "El lote ya terminó y sus resultados están listos para consulta"
            : "Estado de procesamiento y registros en tiempo real"}
        </p>
      </div>

      {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border border-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl mb-1">Progreso del Lote</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} completadas, {processingCount} pendientes/en proceso, {errorCount} errores
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl text-cyan-400">{Math.round(effectiveBatchProgress)}%</div>
                <div
                  className={`mt-1 text-xs ${
                    effectiveBatchState === "COMPLETADO"
                      ? "text-green-400"
                      : effectiveBatchState === "ERROR"
                        ? "text-red-400"
                        : "text-cyan-400"
                  }`}
                >
                  {effectiveBatchState}
                </div>
              </div>
            </div>
            <Progress value={effectiveBatchProgress} className="h-3" />
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Imágenes", value: images.length, icon: Activity, color: "blue" },
          { label: "Completadas", value: completedCount, icon: CheckCircle2, color: "green" },
          {
            label: processingCount > 0 ? "Procesando" : "Procesado",
            value: processingCount > 0 ? processingCount : terminalCount,
            icon: processingCount > 0 ? Loader2 : CheckCircle2,
            color: processingCount > 0 ? "cyan" : "green",
          },
          { label: "Errores", value: errorCount, icon: XCircle, color: "red" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <h3 className="text-2xl mt-1">{stat.value}</h3>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color === "green" ? "text-green-400" : stat.color === "cyan" ? "text-cyan-400 animate-spin" : stat.color === "red" ? "text-red-400" : "text-blue-400"}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Estado de Procesamiento de Imágenes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {!loading && images.length > 0 ? images.map((image, index) => {
                  const progress = image.estado === "PROCESADA" ? 100 : image.estado === "ERROR" ? 100 : effectiveBatchProgress;

                  return (
                    <motion.div
                      key={image.id}
                      className={`p-4 rounded-lg border ${
                        image.estado === "PROCESADA" ? "border-green-500/30 bg-green-500/5" :
                        image.estado === "ERROR" ? "border-red-500/30 bg-red-500/5" :
                        image.estado === "EN_PROCESO" ? "border-cyan-500/30 bg-cyan-500/5" :
                        "border-border"
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="mb-1">{image.nombreArchivo}</h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Server className="w-3 h-3" />
                              Nodo {image.idNodo || "--"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {image.fechaProcesamiento ? new Date(image.fechaProcesamiento).toLocaleString() : "Pendiente"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {image.estado === "EN_PROCESO" && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                          {image.estado === "PROCESADA" && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                          {image.estado === "ERROR" && <XCircle className="w-5 h-5 text-red-400" />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className={image.estado === "PROCESADA" ? "text-green-400" : image.estado === "ERROR" ? "text-red-400" : "text-cyan-400"}>
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className={`h-2 ${image.estado === "ERROR" ? "[&>div]:bg-red-500" : image.estado === "PROCESADA" ? "[&>div]:bg-green-500" : "[&>div]:bg-cyan-500"}`} />
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    {loading ? "Cargando lote..." : "No hay imágenes en procesamiento todavía."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400 pulse-glow" />
                Registros en Vivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs">
                {timeline.length > 0 ? timeline.map((log, index) => (
                  <motion.div
                    key={`${log.time}-${index}`}
                    className={`p-2 rounded border-l-2 ${log.level === "success" ? "border-green-500 bg-green-500/5" : log.level === "warning" ? "border-orange-500 bg-orange-500/5" : "border-cyan-500 bg-cyan-500/5"}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">[{log.time}]</span>
                      <span className={log.level === "success" ? "text-green-400" : log.level === "warning" ? "text-orange-400" : "text-cyan-400"}>
                        {log.level.toUpperCase()}:
                      </span>
                    </div>
                    <p className="text-foreground mt-1">{log.message}</p>
                  </motion.div>
                )) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    {loading ? "Cargando logs..." : "Todavía no hay logs registrados para este lote."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Link to={`/app/results/${batchId}`}>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-foreground">
              Ver Resultados
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
