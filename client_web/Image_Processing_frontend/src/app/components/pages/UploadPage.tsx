import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Settings,
  Play,
  Check,
  Plus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { api } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

type TransformationType =
  | "ESCALA_GRISES"
  | "ROTAR"
  | "REDIMENSIONAR"
  | "RECORTAR"
  | "REFLEJAR"
  | "DESENFOCAR"
  | "PERFILAR"
  | "BRILLO_CONTRASTE"
  | "MARCA_AGUA_TEXTO"
  | "CONVERSION_FORMATO";

interface TransformationConfig {
  type: TransformationType;
  label: string;
  icon: string;
  description: string;
  defaultValue: string;
}

interface AppliedTransformation {
  id: string;
  type: TransformationType;
  value: string;
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  transformations: AppliedTransformation[];
}

type ApplyMode = "individual" | "selected" | "range";

const transformOptions: TransformationConfig[] = [
  {
    type: "ESCALA_GRISES",
    label: "Escala de grises",
    icon: "🎨",
    description: "Convierte la imagen a grises.",
    defaultValue: "",
  },
  {
    type: "ROTAR",
    label: "Rotar 90°",
    icon: "🔄",
    description: "Rota la imagen 90 grados.",
    defaultValue: "",
  },
  {
    type: "REDIMENSIONAR",
    label: "Redimensionar",
    icon: "📐",
    description: "Formato: ancho x alto. Ejemplo: 800x600",
    defaultValue: "800x600",
  },
  {
    type: "RECORTAR",
    label: "Recortar",
    icon: "✂️",
    description: "Formato: x,y,ancho,alto. Ejemplo: 0,0,400,400",
    defaultValue: "0,0,400,400",
  },
  {
    type: "REFLEJAR",
    label: "Reflejar",
    icon: "↔️",
    description: "Valores válidos: HORIZONTAL o VERTICAL",
    defaultValue: "HORIZONTAL",
  },
  {
    type: "DESENFOCAR",
    label: "Desenfocar",
    icon: "🌫️",
    description: "Aplica desenfoque suave.",
    defaultValue: "",
  },
  {
    type: "PERFILAR",
    label: "Perfilar",
    icon: "🔪",
    description: "Aumenta nitidez de bordes.",
    defaultValue: "",
  },
  {
    type: "BRILLO_CONTRASTE",
    label: "Brillo y contraste",
    icon: "☀️",
    description: "Formato: brillo,contraste. Ejemplo: 15,1.2",
    defaultValue: "10,1.1",
  },
  {
    type: "MARCA_AGUA_TEXTO",
    label: "Marca de agua",
    icon: "©️",
    description: "Texto que se dibuja sobre la imagen.",
    defaultValue: "VISIONIX",
  },
  {
    type: "CONVERSION_FORMATO",
    label: "Conversión de formato",
    icon: "🧾",
    description: "Valores válidos: JPG, JPEG, PNG, TIF, TIFF",
    defaultValue: "PNG",
  },
];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`No fue posible leer ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function createTransformation(option: TransformationConfig): AppliedTransformation {
  return {
    id: `${option.type}-${Math.random().toString(36).slice(2, 9)}`,
    type: option.type,
    value: option.defaultValue,
  };
}

function cloneTransformation(transformation: AppliedTransformation): AppliedTransformation {
  return {
    id: `${transformation.type}-${Math.random().toString(36).slice(2, 9)}`,
    type: transformation.type,
    value: transformation.value,
  };
}

export function UploadPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTransformType, setSelectedTransformType] = useState<TransformationType>("ESCALA_GRISES");
  const [applyMode, setApplyMode] = useState<ApplyMode>("individual");
  const [rangeStart, setRangeStart] = useState("1");
  const [rangeEnd, setRangeEnd] = useState("1");

  const selectedImageData = useMemo(
    () => images.find((img) => img.id === selectedImage) || null,
    [images, selectedImage]
  );

  const selectedTransformOption = transformOptions.find((option) => option.type === selectedTransformType)!;
  const rangeTargetIds = useMemo(() => {
    if (images.length === 0) {
      return [];
    }

    const start = Number(rangeStart);
    const end = Number(rangeEnd);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return [];
    }

    const normalizedStart = Math.max(1, Math.min(start, end));
    const normalizedEnd = Math.min(images.length, Math.max(start, end));

    return images.slice(normalizedStart - 1, normalizedEnd).map((image) => image.id);
  }, [images, rangeEnd, rangeStart]);

  const targetImageIds = useMemo(() => {
    if (applyMode === "individual") {
      return selectedImageData ? [selectedImageData.id] : [];
    }

    if (applyMode === "selected") {
      return selectedImageIds;
    }

    return rangeTargetIds;
  }, [applyMode, rangeTargetIds, selectedImageData, selectedImageIds]);

  const targetImages = useMemo(
    () => images.filter((image) => targetImageIds.includes(image.id)),
    [images, targetImageIds]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const newImages = imageFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      transformations: [],
    }));

    setImages((current) => {
      const next = [...current, ...newImages];
      if (!selectedImage && next[0]) {
        setSelectedImage(next[0].id);
      }
      if (next.length > 0) {
        setRangeStart("1");
        setRangeEnd(String(next.length));
      }
      return next;
    });
    setError("");
  };

  const removeImage = (id: string) => {
    setImages((current) => current.filter((img) => img.id !== id));
    setSelectedImageIds((current) => current.filter((imageId) => imageId !== id));
    if (selectedImage === id) {
      const remaining = images.filter((img) => img.id !== id);
      setSelectedImage(remaining[0]?.id || null);
    }
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImageIds((current) =>
      current.includes(id) ? current.filter((imageId) => imageId !== id) : [...current, id]
    );
  };

  const selectAllImages = () => {
    setSelectedImageIds(images.map((image) => image.id));
  };

  const clearImageSelection = () => {
    setSelectedImageIds([]);
  };

  const addTransformation = () => {
    if (targetImages.length === 0) {
      setError("Selecciona al menos una imagen o un rango válido.");
      return;
    }

    if (targetImages.some((image) => image.transformations.length >= 5)) {
      setError("Alguna de las imágenes objetivo ya tiene 5 transformaciones.");
      return;
    }

    setImages((current) =>
      current.map((image) =>
        targetImageIds.includes(image.id)
          ? {
              ...image,
              transformations: [
                ...image.transformations,
                createTransformation(selectedTransformOption),
              ],
            }
          : image
      )
    );
    setError("");
  };

  const clearTransformationsForTargets = () => {
    if (targetImages.length === 0) {
      setError("Selecciona al menos una imagen o un rango válido.");
      return;
    }

    setImages((current) =>
      current.map((image) =>
        targetImageIds.includes(image.id)
          ? { ...image, transformations: [] }
          : image
      )
    );
    setError("");
  };

  const copyCurrentConfigurationToTargets = () => {
    if (!selectedImageData) {
      setError("Selecciona una imagen base para copiar su configuración.");
      return;
    }

    if (targetImages.length === 0) {
      setError("Selecciona al menos una imagen o un rango válido.");
      return;
    }

    if (selectedImageData.transformations.length === 0) {
      setError("La imagen base no tiene transformaciones para copiar.");
      return;
    }

    setImages((current) =>
      current.map((image) =>
        targetImageIds.includes(image.id)
          ? {
              ...image,
              transformations: selectedImageData.transformations.map(cloneTransformation),
            }
          : image
      )
    );
    setError("");
  };

  const updateTransformationValue = (imageId: string, transformationId: string, value: string) => {
    setImages((current) =>
      current.map((image) =>
        image.id === imageId
          ? {
              ...image,
              transformations: image.transformations.map((transformation) =>
                transformation.id === transformationId
                  ? { ...transformation, value }
                  : transformation
              ),
            }
          : image
      )
    );
  };

  const removeTransformation = (imageId: string, transformationId: string) => {
    setImages((current) =>
      current.map((image) =>
        image.id === imageId
          ? {
              ...image,
              transformations: image.transformations.filter(
                (transformation) => transformation.id !== transformationId
              ),
            }
          : image
      )
    );
  };

  const moveTransformation = (imageId: string, transformationId: string, direction: -1 | 1) => {
    setImages((current) =>
      current.map((image) => {
        if (image.id !== imageId) {
          return image;
        }

        const index = image.transformations.findIndex((item) => item.id === transformationId);
        const nextIndex = index + direction;

        if (index === -1 || nextIndex < 0 || nextIndex >= image.transformations.length) {
          return image;
        }

        const nextTransformations = [...image.transformations];
        const [moved] = nextTransformations.splice(index, 1);
        nextTransformations.splice(nextIndex, 0, moved);

        return {
          ...image,
          transformations: nextTransformations,
        };
      })
    );
  };

  const buildTransformations = (image: UploadedImage) => {
    return image.transformations.map((transformation) => ({
      tipo: transformation.type,
      valor: transformation.value,
    }));
  };

  const startProcessing = async () => {
    if (!session?.token || images.length === 0) {
      return;
    }

    if (images.some((image) => image.transformations.length === 0)) {
      setError("Cada imagen debe tener al menos una transformación configurada.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const imagenes = await Promise.all(
        images.map(async (image) => ({
          nombreArchivo: image.file.name,
          contenidoBase64: await readFileAsDataUrl(image.file),
          transformaciones: buildTransformations(image),
        }))
      );

      const response = await api.createBatch(session.token, imagenes);
      navigate(`/app/processing/${response.data.id}`);
    } catch (err: any) {
      setError(err.message || "No fue posible crear el lote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-cyan-400 glow-text-cyan">Subir Imágenes</h1>
          <p className="text-muted-foreground">Configura transformaciones por imagen, por selección o por rango</p>
        </div>
        <Button
          onClick={startProcessing}
          disabled={images.length === 0 || loading}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-foreground glow-cyan"
        >
          <Play className="w-5 h-5 mr-2" />
          {loading ? "Enviando..." : `Iniciar Procesamiento (${images.length})`}
        </Button>
      </div>

      {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive ? "border-cyan-500 bg-cyan-500/10 glow-cyan" : "border-border hover:border-cyan-500/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <motion.div animate={dragActive ? { scale: 1.04 } : { scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Upload className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                  <h3 className="text-xl mb-2">Arrastra imágenes aquí</h3>
                  <p className="text-muted-foreground mb-4">o haz clic para seleccionar archivos</p>
                  <input type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" id="file-input" />
                  <label htmlFor="file-input">
                    <Button
                      type="button"
                      onClick={() => document.getElementById("file-input")?.click()}
                      className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                    >
                      Elegir Archivos
                    </Button>
                  </label>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {images.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                  Imágenes Subidas ({images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={selectAllImages}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                  >
                    Seleccionar todas
                  </Button>
                  <Button
                    type="button"
                    onClick={clearImageSelection}
                    className="bg-background border border-border text-foreground"
                  >
                    Limpiar selección
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedImageIds.length} seleccionadas para edición múltiple
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer ${
                        selectedImage === image.id ? "border-cyan-500 glow-cyan" : "border-border hover:border-cyan-500/50"
                      }`}
                      onClick={() => setSelectedImage(image.id)}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleImageSelection(image.id);
                        }}
                        className={`absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border text-white transition-all ${
                          selectedImageIds.includes(image.id)
                            ? "border-cyan-400 bg-cyan-500/80"
                            : "border-white/40 bg-black/50"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <div className="aspect-square">
                        <img src={image.preview} alt={image.file.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-xs truncate text-white">{image.file.name}</p>
                          <p className="text-xs text-gray-200">{image.transformations.length} transformaciones</p>
                          <p className="text-xs text-cyan-200">Imagen #{index + 1}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-card border-border sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Transformaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedImageData ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Configurando: <span className="text-foreground">{selectedImageData.file.name}</span>
                  </div>

                  <div className="rounded-lg border border-border p-3 space-y-3">
                    <label className="block text-sm text-muted-foreground">Modo de aplicación</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "individual", label: "Individual" },
                        { id: "selected", label: "Selección" },
                        { id: "range", label: "Rango" },
                      ].map((mode) => (
                        <Button
                          key={mode.id}
                          type="button"
                          onClick={() => setApplyMode(mode.id as ApplyMode)}
                          className={
                            applyMode === mode.id
                              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                              : "bg-background border border-border text-foreground"
                          }
                        >
                          {mode.label}
                        </Button>
                      ))}
                    </div>

                    {applyMode === "selected" && (
                      <p className="text-xs text-muted-foreground">
                        Objetivo actual: {targetImages.length} imágenes seleccionadas manualmente
                      </p>
                    )}

                    {applyMode === "range" && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          min="1"
                          max={String(images.length || 1)}
                          value={rangeStart}
                          onChange={(e) => setRangeStart(e.target.value)}
                          placeholder="Desde"
                          className="bg-background border-border text-foreground"
                        />
                        <Input
                          type="number"
                          min="1"
                          max={String(images.length || 1)}
                          value={rangeEnd}
                          onChange={(e) => setRangeEnd(e.target.value)}
                          placeholder="Hasta"
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Se aplicará sobre {targetImages.length} imagen{targetImages.length === 1 ? "" : "es"}.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-3 space-y-3">
                    <label className="block text-sm text-muted-foreground">Agregar transformación</label>
                    <select
                      value={selectedTransformType}
                      onChange={(e) => setSelectedTransformType(e.target.value as TransformationType)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:border-cyan-500 focus:outline-none"
                    >
                      {transformOptions.map((option) => (
                        <option key={option.type} value={option.type}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">{selectedTransformOption.description}</p>
                    <Button
                      type="button"
                      onClick={addTransformation}
                      disabled={selectedImageData.transformations.length >= 5}
                      className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar a objetivo
                    </Button>
                    {applyMode !== "individual" && (
                      <>
                        <Button
                          type="button"
                          onClick={copyCurrentConfigurationToTargets}
                          className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                        >
                          Copiar configuración de la imagen activa
                        </Button>
                        <Button
                          type="button"
                          onClick={clearTransformationsForTargets}
                          className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                        >
                          Limpiar transformaciones del objetivo
                        </Button>
                      </>
                    )}
                  </div>

                  {applyMode === "individual" ? (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                      {selectedImageData.transformations.length > 0 ? selectedImageData.transformations.map((transformation, index) => {
                      const option = transformOptions.find((item) => item.type === transformation.type)!;
                      const requiresValue = !["ESCALA_GRISES", "ROTAR", "DESENFOCAR", "PERFILAR"].includes(transformation.type);

                      return (
                        <motion.div
                          key={transformation.id}
                          className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/10 space-y-3"
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{option.icon}</span>
                              <div>
                                <div className="text-sm">{option.label}</div>
                                <div className="text-xs text-muted-foreground">Orden #{index + 1}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => moveTransformation(selectedImageData.id, transformation.id, -1)}
                                disabled={index === 0}
                                className="bg-background text-muted-foreground"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => moveTransformation(selectedImageData.id, transformation.id, 1)}
                                disabled={index === selectedImageData.transformations.length - 1}
                                className="bg-background text-muted-foreground"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => removeTransformation(selectedImageData.id, transformation.id)}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {requiresValue ? (
                            <Input
                              value={transformation.value}
                              onChange={(e) =>
                                updateTransformationValue(
                                  selectedImageData.id,
                                  transformation.id,
                                  e.target.value
                                )
                              }
                              placeholder={option.defaultValue || option.description}
                              className="bg-background border-border text-foreground"
                            />
                          ) : (
                            <div className="text-xs text-green-400 flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              Sin parámetro adicional
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </motion.div>
                      );
                      }) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Agrega transformaciones para esta imagen</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground space-y-2">
                      <p>
                        Modo {applyMode === "selected" ? "selección múltiple" : "rango"} activo.
                      </p>
                      <p>
                        Puedes agregar una transformación a todas las imágenes objetivo o copiar la configuración completa de la imagen activa.
                      </p>
                      <p>
                        La edición detallada de orden y parámetros sigue disponible en modo individual.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Selecciona una imagen para configurar transformaciones</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
