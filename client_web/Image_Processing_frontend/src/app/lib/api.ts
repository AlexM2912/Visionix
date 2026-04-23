const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000/api";

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.mensaje || "Error en la solicitud");
  }

  return data as T;
}

export interface AuthSession {
  token: string;
  idUsuario: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface UserProfile {
  idUsuario: number;
  nombre: string;
  email: string;
  rol: string;
  fechaCreacion: string | null;
  fechaActivacion: string | null;
  empresa: string | null;
  biografia: string | null;
  avatarBase64: string | null;
  notificationsPush: boolean;
  notificationsEmail: boolean;
  notificationsProcessing: boolean;
  notificationsErrors: boolean;
}

export interface BatchSummary {
  id: number;
  estado: string;
  fechaRecepcion: string;
  porcentajeProgreso: number;
  cantidadImagenes: number;
  totalImagenes: number;
  procesadas: number;
  fallidas: number;
  tiempoTotalEjecucion: number;
  tiempoPromedioEjecucion: number;
}

export interface BatchImage {
  id: number;
  nombreArchivo: string;
  rutaOriginal: string;
  rutaResultado: string | null;
  rutaArchivoResultado: string | null;
  estado: string;
  formatoSalida: string | null;
  tiempoEjecucion: number | null;
  fechaProcesamiento: string | null;
  idNodo: number | null;
  tamanoArchivoKb: number | null;
  transformaciones: Array<{
    idImagen: number;
    tipo: string;
    valor: string;
    orden: number;
  }>;
}

export interface BatchDetail {
  id: number;
  idUsuario: number;
  estado: string;
  fechaRecepcion: string;
  porcentajeProgreso: number;
  cantidadImagenes: number;
  imagenes: BatchImage[];
}

export interface BatchLog {
  id: number;
  idImagen: number;
  nivel: string;
  mensaje: string;
  fechaHora: string;
}

export interface AdminSummaryResponse {
  summary: {
    totalLotes: number;
    lotesCompletados: number;
    lotesEnProceso: number;
    lotesError: number;
    totalImagenes: number;
    imagenesProcesadas: number;
    imagenesError: number;
    totalNodos: number;
    nodosActivos: number;
    totalLogs: number;
    health: number;
  };
  systemMetrics: Array<{
    time: string;
    cpu: number;
    memory: number;
    requests: number;
  }>;
  nodes: Array<{
    id: string;
    name: string;
    status: "online" | "offline";
    location: string;
    cpu: number;
    memory: number;
    disk: number;
    uptime: string;
    processedToday: number;
    processingNow: number;
    currentLoad: number;
    maxCapacity: number;
    availableCapacity: number;
  }>;
  systemLogs: Array<{
    time: string;
    level: "info" | "warning" | "error" | "success";
    service: string;
    message: string;
  }>;
}

export interface UploadImagePayload {
  nombreArchivo: string;
  contenidoBase64: string;
  transformaciones: Array<{
    tipo: string;
    valor: string;
  }>;
}

export const api = {
  register(payload: { nombre: string; email: string; password: string }) {
    return request<{ mensaje: string; data: { mensaje: string } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyRegister(payload: { email: string; codigo: string }) {
    return request<{
      mensaje: string;
      data: {
        mensaje: string;
        token: string;
        idUsuario: number;
        nombre: string;
        email: string;
        rol: string;
      };
    }>("/auth/verify-register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: { email: string; password: string }) {
    return request<{ mensaje: string; data: { mensaje: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  forgotPassword(payload: { email: string }) {
    return request<{ mensaje: string; data: { mensaje: string } }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resetPassword(payload: {
    email: string;
    codigo: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return request<{ mensaje: string; data: { mensaje: string } }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyLogin(payload: { email: string; codigo: string }) {
    return request<{
      mensaje: string;
      data: {
        token: string;
        idUsuario: number;
        nombre: string;
        email: string;
        rol: string;
      };
    }>("/auth/verify-login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  me(token: string) {
    return request<{
      data: {
        idUsuario: number;
        email: string;
        rol: string;
      };
    }>("/auth/me", {
      method: "GET",
      token,
    });
  },

  logout(token: string) {
    return request<{ mensaje: string }>("/auth/logout", {
      method: "POST",
      token,
    });
  },

  getProfile(token: string) {
    return request<{ data: UserProfile }>("/auth/profile", {
      method: "GET",
      token,
    });
  },

  updateProfile(
    token: string,
    payload: {
      nombre: string;
      email: string;
      empresa?: string | null;
      biografia?: string | null;
      avatarBase64?: string | null;
      notificationsPush: boolean;
      notificationsEmail: boolean;
      notificationsProcessing: boolean;
      notificationsErrors: boolean;
    }
  ) {
    return request<{ mensaje: string; data: UserProfile }>("/auth/profile", {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },

  updatePassword(
    token: string,
    payload: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
  ) {
    return request<{ mensaje: string }>("/auth/password", {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },

  createBatch(token: string, imagenes: UploadImagePayload[]) {
    return request<{
      mensaje: string;
      data: {
        id: number;
        estado: string;
        mensaje: string;
      };
    }>("/procesamiento/lote", {
      method: "POST",
      token,
      body: JSON.stringify({ imagenes }),
    });
  },

  listBatches(token: string) {
    return request<{ data: BatchSummary[] }>("/procesamiento/lotes", {
      method: "GET",
      token,
    });
  },

  getBatchDetail(token: string, batchId: string | number) {
    return request<{ data: BatchDetail }>(`/procesamiento/lote/${batchId}`, {
      method: "GET",
      token,
    });
  },

  getBatchStatus(token: string, batchId: string | number) {
    return request<{
      data: {
        id: number;
        estado: string;
        mensaje: string;
      };
    }>(`/procesamiento/estado/${batchId}`, {
      method: "GET",
      token,
    });
  },

  getBatchLogs(token: string, batchId: string | number) {
    return request<{ data: BatchLog[] }>(`/procesamiento/lote/${batchId}/logs`, {
      method: "GET",
      token,
    });
  },

  getAdminSummary(token: string) {
    return request<{ data: AdminSummaryResponse }>("/procesamiento/admin/resumen", {
      method: "GET",
      token,
    });
  },

  fileUrl(ruta: string) {
    const params = new URLSearchParams({ ruta });
    return `${API_BASE_URL}/procesamiento/archivo?${params.toString()}`;
  },

  async downloadBatchZip(token: string, batchId: string | number) {
    const response = await fetch(`${API_BASE_URL}/procesamiento/lote/${batchId}/zip`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.mensaje || "No fue posible descargar el ZIP");
    }

    return response.blob();
  },
};
