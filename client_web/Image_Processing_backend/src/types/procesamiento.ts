export interface TransformacionDTO {
  tipo: string;
  valor: string;
}

export interface ImagenSolicitudDTO {
  nombreArchivo: string;
  rutaOrigen?: string;
  contenidoBase64?: string;
  transformaciones: TransformacionDTO[];
}

export interface SolicitudLoteDTO {
  id?: number;
  idUsuario: number;
  estado?: string;
  mensaje?: string;
  imagenes: ImagenSolicitudDTO[];
}
