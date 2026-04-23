import { authDb } from "../config/bd";

export interface PerfilUsuario {
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

export async function asegurarTablaPerfilUsuario() {
  await authDb.query(`
    CREATE TABLE IF NOT EXISTS perfil_usuario (
      id_usuario BIGINT PRIMARY KEY,
      empresa VARCHAR(150) NULL,
      biografia TEXT NULL,
      avatar_base64 LONGTEXT NULL,
      notifications_push BOOLEAN NOT NULL DEFAULT FALSE,
      notifications_email BOOLEAN NOT NULL DEFAULT FALSE,
      notifications_processing BOOLEAN NOT NULL DEFAULT TRUE,
      notifications_errors BOOLEAN NOT NULL DEFAULT TRUE,
      fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_perfil_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);
}

export async function obtenerPerfilUsuario(idUsuario: number): Promise<PerfilUsuario | null> {
  await asegurarTablaPerfilUsuario();

  const [filas]: any = await authDb.query(
    `
      SELECT
        u.id_usuario AS idUsuario,
        u.nombre,
        u.email,
        u.rol,
        u.fecha_creacion AS fechaCreacion,
        u.fecha_activacion AS fechaActivacion,
        p.empresa,
        p.biografia,
        p.avatar_base64 AS avatarBase64,
        COALESCE(p.notifications_push, FALSE) AS notificationsPush,
        COALESCE(p.notifications_email, FALSE) AS notificationsEmail,
        COALESCE(p.notifications_processing, TRUE) AS notificationsProcessing,
        COALESCE(p.notifications_errors, TRUE) AS notificationsErrors
      FROM usuario u
      LEFT JOIN perfil_usuario p ON p.id_usuario = u.id_usuario
      WHERE u.id_usuario = ?
      LIMIT 1
    `,
    [idUsuario]
  );

  if (!Array.isArray(filas) || filas.length === 0) {
    return null;
  }

  const perfil = filas[0];

  return {
    ...perfil,
    notificationsPush: Boolean(perfil.notificationsPush),
    notificationsEmail: Boolean(perfil.notificationsEmail),
    notificationsProcessing: Boolean(perfil.notificationsProcessing),
    notificationsErrors: Boolean(perfil.notificationsErrors),
  };
}

export async function guardarPerfilUsuario(input: {
  idUsuario: number;
  nombre: string;
  email: string;
  empresa?: string | null;
  biografia?: string | null;
  avatarBase64?: string | null;
  notificationsPush: boolean;
  notificationsEmail: boolean;
  notificationsProcessing: boolean;
  notificationsErrors: boolean;
}) {
  await asegurarTablaPerfilUsuario();

  const connection = await authDb.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `
        UPDATE usuario
        SET nombre = ?, email = ?
        WHERE id_usuario = ?
      `,
      [input.nombre, input.email, input.idUsuario]
    );

    await connection.query(
      `
        INSERT INTO perfil_usuario (
          id_usuario,
          empresa,
          biografia,
          avatar_base64,
          notifications_push,
          notifications_email,
          notifications_processing,
          notifications_errors
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          empresa = VALUES(empresa),
          biografia = VALUES(biografia),
          avatar_base64 = VALUES(avatar_base64),
          notifications_push = VALUES(notifications_push),
          notifications_email = VALUES(notifications_email),
          notifications_processing = VALUES(notifications_processing),
          notifications_errors = VALUES(notifications_errors)
      `,
      [
        input.idUsuario,
        input.empresa?.trim() || null,
        input.biografia?.trim() || null,
        input.avatarBase64 || null,
        input.notificationsPush,
        input.notificationsEmail,
        input.notificationsProcessing,
        input.notificationsErrors,
      ]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function actualizarPasswordUsuario(idUsuario: number, passwordHash: string) {
  const [resultado]: any = await authDb.query(
    `
      UPDATE usuario
      SET password_hash = ?
      WHERE id_usuario = ?
    `,
    [passwordHash, idUsuario]
  );

  return resultado;
}
