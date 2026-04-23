import { Request, Response, NextFunction } from "express";
import { AuthServicio } from "../services/authServicio";

export interface RequestConUsuario extends Request {
  usuario?: {
    id_usuario: number | string;
    email?: string;
    rol?: string;
  };
  token?: string;
}

export const authMiddleware = async (
  req: RequestConUsuario,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.header("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        mensaje: "No autorizado. Falta el token Bearer",
      });
    }

    const token = authorization.slice(7);
    const validacion = await AuthServicio.validarToken(token);

    if (!validacion?.valido || !validacion.idUsuario) {
      return res.status(401).json({
        mensaje: validacion?.mensaje || "No autorizado",
      });
    }

    req.usuario = {
      id_usuario: validacion.idUsuario,
      email: validacion.email,
      rol: validacion.rol || "USER",
    };
    req.token = token;

    next();
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error validando autenticación",
    });
  }
};
