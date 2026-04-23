import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Navigate } from "react-router";
import {
  Server,
  Activity,
  Database,
  Cpu,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Progress } from "../ui/progress";
import { api, AdminSummaryResponse } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export function AdminPage() {
  const { session } = useAuth();
  const [data, setData] = useState<AdminSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!session?.token) {
      return;
    }

    try {
      setError("");
      const response = await api.getAdminSummary(session.token);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "No fue posible cargar la administración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [session?.token]);

  const stats = useMemo(() => {
    const summary = data?.summary;
    if (!summary) {
      return [];
    }

    return [
      {
        label: "Total de Nodos",
        value: summary.totalNodos,
        icon: Server,
        color: "blue",
        detail: `${summary.nodosActivos} en línea`,
      },
      {
        label: "Nodos en Línea",
        value: summary.nodosActivos,
        icon: CheckCircle2,
        color: "green",
        detail: `${summary.totalNodos - summary.nodosActivos} fuera de línea`,
      },
      {
        label: "Procesadas",
        value: summary.imagenesProcesadas,
        icon: Activity,
        color: "cyan",
        detail: `${summary.totalImagenes} imágenes registradas`,
      },
      {
        label: "Salud del Sistema",
        value: `${summary.health}%`,
        icon: Zap,
        color: "purple",
        detail: `${summary.lotesCompletados}/${summary.totalLotes} lotes completados`,
      },
    ];
  }, [data]);

  if (session?.rol !== "ADMIN") {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 text-cyan-400 glow-text-cyan">Administración del Sistema</h1>
          <p className="text-muted-foreground">Monitorea y gestiona la infraestructura distribuida</p>
        </div>
        <Button
          onClick={load}
          disabled={loading}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-foreground glow-cyan"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar Datos
        </Button>
      </div>

      {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <h3 className="text-2xl mb-1">{stat.value}</h3>
                      <p className="text-xs text-muted-foreground">{stat.detail}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${
                      stat.color === "green" ? "bg-green-500/10" :
                      stat.color === "cyan" ? "bg-cyan-500/10" :
                      stat.color === "purple" ? "bg-purple-500/10" :
                      "bg-blue-500/10"
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        stat.color === "green" ? "text-green-400" :
                        stat.color === "cyan" ? "text-cyan-400" :
                        stat.color === "purple" ? "text-purple-400" :
                        "text-blue-400"
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Actividad de Solicitudes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data && data.systemMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.systemMetrics}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" />
                    <XAxis dataKey="time" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: "#121218", border: "1px solid #1e1e28", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="requests" stroke="#00d4ff" fillOpacity={1} fill="url(#colorRequests)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                  {loading ? "Cargando actividad..." : "Sin métricas del sistema"}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Distribución de Lotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={[
                      { name: "Completados", value: data.summary.lotesCompletados },
                      { name: "En proceso", value: data.summary.lotesEnProceso },
                      { name: "Con error", value: data.summary.lotesError },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: "#121218", border: "1px solid #1e1e28", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                  {loading ? "Cargando distribución..." : "Sin volumen de solicitudes"}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              Estado y Métricas de Nodos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data && data.nodes.length > 0 ? data.nodes.map((node, index) => (
                <motion.div
                  key={node.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    node.status === "online" ? "border-green-500/30 bg-green-500/5 hover:border-green-500/50" : "border-red-500/30 bg-red-500/5"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="mb-1">{node.name}</h4>
                      <p className="text-xs text-muted-foreground">{node.location}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${node.status === "online" ? "bg-green-400 pulse-glow" : "bg-red-400"}`} />
                      <span className={`text-xs ${node.status === "online" ? "text-green-400" : "text-red-400"}`}>
                        {node.status === "online" ? "En Línea" : "Fuera de Línea"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> Carga
                        </span>
                        <span className="text-cyan-400">{node.currentLoad}/{node.maxCapacity}</span>
                      </div>
                      <Progress value={node.cpu} className="h-1" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Database className="w-3 h-3" /> Uso lógico
                        </span>
                        <span className="text-purple-400">{node.memory}%</span>
                      </div>
                      <Progress value={node.memory} className="h-1 [&>div]:bg-purple-500" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <HardDrive className="w-3 h-3" /> Capacidad simulada
                        </span>
                        <span className="text-green-400">{node.disk}%</span>
                      </div>
                      <Progress value={node.disk} className="h-1 [&>div]:bg-green-500" />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                      <span className="text-muted-foreground">{node.uptime}</span>
                      <span className="text-cyan-400">{node.processedToday} procesadas hoy</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="md:col-span-2 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  {loading ? "Cargando nodos..." : "No hay nodos registrados todavía."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400 pulse-glow" />
              Registros del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar font-mono text-xs">
              {data && data.systemLogs.length > 0 ? data.systemLogs.map((log, index) => (
                <motion.div
                  key={`${log.time}-${index}`}
                  className={`p-3 rounded-lg border-l-2 ${
                    log.level === "success" ? "border-green-500 bg-green-500/5" :
                    log.level === "error" ? "border-red-500 bg-red-500/5" :
                    log.level === "warning" ? "border-orange-500 bg-orange-500/5" :
                    "border-cyan-500 bg-cyan-500/5"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + index * 0.03 }}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-muted-foreground">[{log.time}]</span>
                    <span className={
                      log.level === "success" ? "text-green-400" :
                      log.level === "error" ? "text-red-400" :
                      log.level === "warning" ? "text-orange-400" :
                      "text-cyan-400"
                    }>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-purple-400">{log.service}</span>
                  </div>
                  <p className="text-foreground">{log.message}</p>
                </motion.div>
              )) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  {loading ? "Cargando logs..." : "No hay logs del sistema todavía."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
