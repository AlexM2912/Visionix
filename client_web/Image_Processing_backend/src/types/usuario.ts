export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  password_hash?: string; // opcional porque no siempre lo envías al frontend
  rol: "USER" | "ADMIN";
}