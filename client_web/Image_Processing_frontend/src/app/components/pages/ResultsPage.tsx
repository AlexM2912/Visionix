import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { motion } from "motion/react";
import {
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  FileArchive,
  Grid3x3,
  List,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { api, BatchDetail } from "../../lib/api";
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

function formatStorageSizeFromKb(valueKb: number) {
  if (!Number.isFinite(valueKb) || valueKb <= 0) {
    return "--";
  }

  if (valueKb >= 1024 * 1024) {
    return `${(valueKb / (1024 * 1024)).toFixed(2)} GB`;
  }

  if (valueKb >= 1024) {
    return `${(valueKb / 1024).toFixed(2)} MB`;
  }

  return `${valueKb.toFixed(2)} KB`;
}

export function ResultsPage() {
  const { batchId } = useParams();
  const { session } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [previewImage, setPreviewImage] = useState<any | null>(null);
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!session?.token || !batchId) {
        return;
      }

      try {
        const response = await api.getBatchDetail(session.token, batchId);
        if (!cancelled) {
          setDetail(response.data);
          setError("");
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "No fue posible cargar los resultados");
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
  }, [batchId, session?.token]);

  const results = useMemo(() => {
    return (detail?.imagenes || []).map((image) => ({
      ...image,
      processed: image.rutaArchivoResultado ? api.fileUrl(image.rutaArchivoResultado) : null,
      transformationsLabel: image.transformaciones.map((item) => item.tipo).join(", "),
    }));
  }, [detail?.imagenes]);

  const toggleImageSelection = (id: number) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedImages(results.filter((img) => img.processed).map((img) => img.id));
  };

  const deselectAll = () => {
    setSelectedImages([]);
  };

  const successCount = results.filter((img) => img.estado === "PROCESADA").length;
  const totalSizeKb = results.reduce((sum, img) => sum + Number(img.tamanoArchivoKb || 0), 0);
  const averageExecutionTime = useMemo(() => {
    const processedTimes = results
      .map((img) => Number(img.tiempoEjecucion || 0))
      .filter((time) => Number.isFinite(time) && time > 0);

    if (processedTimes.length === 0) {
      return 0;
    }

    const total = processedTimes.reduce((sum, time) => sum + time, 0);
    return total / processedTimes.length;
  }, [results]);

  const downloadZip = async () => {
    if (!session?.token || !batchId) {
      return;
    }

    setDownloadingZip(true);
    setError("");

    try {
      const blob = await api.downloadBatchZip(session.token, batchId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `visionix-lote-${batchId}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "No fue posible descargar el ZIP");
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 text-cyan-400 glow-text-cyan">Resultados del Lote #{batchId}</h1>
          <p className="text-muted-foreground">
            {results.length > 0
              ? `${successCount} de ${results.length} imágenes procesadas exitosamente`
              : "No hay resultados disponibles todavía"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={downloadZip}
            disabled={loading || results.filter((img) => img.processed).length === 0 || downloadingZip}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-foreground"
          >
            <FileArchive className="w-5 h-5 mr-2" />
            {downloadingZip ? "Generando ZIP..." : "Descargar ZIP"}
          </Button>
          <Button onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-cyan-500/20 text-cyan-400" : "bg-[#1e1e28] text-muted-foreground"}>
            <Grid3x3 className="w-5 h-5" />
          </Button>
          <Button onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-cyan-500/20 text-cyan-400" : "bg-[#1e1e28] text-muted-foreground"}>
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: "Total de Imágenes", value: results.length, icon: ImageIcon, color: "blue" },
          { label: "Exitosas", value: successCount, icon: CheckCircle2, color: "green" },
          { label: "Fallidas", value: results.filter((img) => img.estado === "ERROR").length, icon: XCircle, color: "red" },
          { label: "Tiempo Promedio", value: formatExecutionTime(averageExecutionTime), icon: Eye, color: "cyan" },
          { label: "Tamaño Total", value: formatStorageSizeFromKb(totalSizeKb), icon: FileArchive, color: "purple" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <h3 className="text-2xl mt-1">{stat.value}</h3>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color === "green" ? "text-green-400" : stat.color === "red" ? "text-red-400" : stat.color === "purple" ? "text-purple-400" : stat.color === "cyan" ? "text-cyan-400" : "text-blue-400"}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={selectedImages.length === results.filter((img) => img.processed).length ? deselectAll : selectAll}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
              >
                {selectedImages.length === results.filter((img) => img.processed).length && results.length > 0 ? "Deseleccionar Todas" : "Seleccionar Todas"}
              </Button>
              {selectedImages.length > 0 && <span className="text-sm text-muted-foreground">{selectedImages.length} seleccionadas</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            Imágenes Procesadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {!loading && results.length > 0 ? results.map((image, index) => (
                <motion.div
                  key={image.id}
                  className={`rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${selectedImages.includes(image.id) ? "border-cyan-500 glow-cyan" : "border-border hover:border-cyan-500/50"}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => image.processed && setPreviewImage(image)}
                >
                  <div className="aspect-square relative bg-muted flex items-center justify-center">
                    {image.processed ? (
                      <img src={image.processed} alt={image.nombreArchivo} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin archivo</span>
                    )}
                    <div className="absolute top-2 left-2">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleImageSelection(image.id);
                        }}
                        className="w-6 h-6 rounded bg-black/50 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/70"
                      >
                        <Checkbox checked={selectedImages.includes(image.id)} className="pointer-events-none" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      {image.estado === "PROCESADA" ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
                    </div>
                  </div>
                  <div className="p-4 bg-background">
                    <h4 className="mb-1 truncate">{image.nombreArchivo}</h4>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{image.tamanoArchivoKb ? `${Number(image.tamanoArchivoKb).toFixed(2)} KB` : "--"}</span>
                      <span>{formatExecutionTime(Number(image.tiempoEjecucion || 0))}</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="lg:col-span-3 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  {loading ? "Cargando resultados..." : "Los resultados procesados aparecerán aquí cuando el backend entregue imágenes."}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {!loading && results.length > 0 ? results.map((image, index) => (
                <motion.div
                  key={image.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedImages.includes(image.id) ? "border-cyan-500 bg-cyan-500/5" : "border-border hover:border-cyan-500/50"}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => toggleImageSelection(image.id)}
                >
                  <Checkbox checked={selectedImages.includes(image.id)} />
                  {image.processed ? (
                    <img src={image.processed} alt={image.nombreArchivo} className="w-16 h-16 rounded object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">Sin archivo</div>
                  )}
                  <div className="flex-1">
                    <h4 className="mb-1">{image.nombreArchivo}</h4>
                    <p className="text-sm text-muted-foreground">{image.transformationsLabel || "Sin transformaciones"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{image.tamanoArchivoKb ? `${Number(image.tamanoArchivoKb).toFixed(2)} KB` : "--"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatExecutionTime(Number(image.tiempoEjecucion || 0))}</p>
                    {image.estado === "PROCESADA" ? <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto mt-1" /> : <XCircle className="w-5 h-5 text-red-400 ml-auto mt-1" />}
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (image.processed) {
                        setPreviewImage(image);
                      }
                    }}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </motion.div>
              )) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  {loading ? "Cargando resultados..." : "Los resultados procesados aparecerán aquí cuando el backend entregue imágenes."}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {previewImage && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setPreviewImage(null)}
        >
          <motion.div
            className="bg-card border border-border rounded-2xl max-w-4xl w-full overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-xl mb-1">{previewImage.nombreArchivo}</h3>
                <p className="text-sm text-muted-foreground">{previewImage.transformationsLabel}</p>
              </div>
              <Button onClick={() => setPreviewImage(null)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400">
                Cerrar
              </Button>
            </div>
            <div className="p-6">
              <img src={previewImage.processed} alt={previewImage.nombreArchivo} className="w-full rounded-lg" />
            </div>
            <div className="p-6 border-t border-border flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Tamaño: {previewImage.tamanoArchivoKb ? `${Number(previewImage.tamanoArchivoKb).toFixed(2)} KB` : "--"} | Tiempo: {formatExecutionTime(Number(previewImage.tiempoEjecucion || 0))}
              </div>
              <a href={previewImage.processed} target="_blank" rel="noreferrer">
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-foreground">
                  <Download className="w-5 h-5 mr-2" />
                  Descargar
                </Button>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
