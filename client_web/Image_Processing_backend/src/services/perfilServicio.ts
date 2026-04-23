import bcrypt from "bcryptjs";
import {
  actualizarPasswordUsuario,
  guardarPerfilUsuario,
  obtenerPerfilUsuario,
} from "../models/perfilModelo";
import { buscarUsuarioPorEmail } from "../models/usuarioModelo";

const MAX_AVATAR_LENGTH = 7_000_000;

export class PerfilServicio {
  static async obtenerPerfil(idUsuario: number) {
    const perfil = await obtenerPerfilUsuario(idUsuario);

    if (!perfil) {
      throw new Error("Usuario no encontrado");
    }

    return perfil;
  }

  static async guardarPerfil(
    idUsuario: number,
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
    if (!payload.nombre?.trim() || !payload.email?.trim()) {
      throw new Error("Nombre y correo son obligatorios");
    }

    const usuarios = await buscarUsuarioPorEmail(payload.email.trim());
    const usuarioConMismoCorreo = usuarios.find(
      (usuario) => Number(usuario.id_usuario) !== idUsuario
    );

    if (usuarioConMismoCorreo) {
      throw new Error("Ya existe un usuario con ese correo");
    }

    if (payload.avatarBase64 && payload.avatarBase64.length > MAX_AVATAR_LENGTH) {
      throw new Error("La imagen de perfil es demasiado grande");
    }

    await guardarPerfilUsuario({
      idUsuario,
      nombre: payload.nombre.trim(),
      email: payload.email.trim(),
      empresa: payload.empresa,
      biografia: payload.biografia,
      avatarBase64: payload.avatarBase64,
      notificationsPush: payload.notificationsPush,
      notificationsEmail: payload.notificationsEmail,
      notificationsProcessing: payload.notificationsProcessing,
      notificationsErrors: payload.notificationsErrors,
    });

    return this.obtenerPerfil(idUsuario);
  }

  static async cambiarPassword(
    idUsuario: number,
    payload: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
  ) {
    if (!payload.currentPassword || !payload.newPassword || !payload.confirmPassword) {
      throw new Error("Todos los campos de contraseña son obligatorios");
    }

    if (payload.newPassword !== payload.confirmPassword) {
      throw new Error("La nueva contraseña y su confirmación no coinciden");
    }

    if (payload.newPassword.length < 6) {
      throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
    }

    const perfil = await this.obtenerPerfil(idUsuario);
    const usuarios = await buscarUsuarioPorEmail(perfil.email);
    const usuario = usuarios.find((item) => Number(item.id_usuario) === idUsuario);

    if (!usuario?.password_hash) {
      throw new Error("No fue posible validar la contraseña actual");
    }

    const currentPasswordOk = await bcrypt.compare(
      payload.currentPassword,
      usuario.password_hash
    );

    if (!currentPasswordOk) {
      throw new Error("La contraseña actual es incorrecta");
    }

    const passwordHash = await bcrypt.hash(payload.newPassword, 10);
    await actualizarPasswordUsuario(idUsuario, passwordHash);
  }
}
