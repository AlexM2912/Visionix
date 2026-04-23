import { authDb } from "../config/bd";
import { Usuario } from "../types/usuario";

export async function buscarUsuarioPorEmail(email: string) {
  const [filas] = await authDb.query(
    "SELECT * FROM usuario WHERE email = ?",
    [email]
  );

  return filas as Usuario[];
}

export async function crearUsuario(usuario: Usuario) {
  const [resultado] = await authDb.query(
    "INSERT INTO usuario (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)",
    [usuario.nombre, usuario.email, usuario.password_hash, usuario.rol]
  );

  return resultado;
}
