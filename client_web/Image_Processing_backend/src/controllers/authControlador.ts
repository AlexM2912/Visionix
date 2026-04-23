import { Request, Response } from "express";
import { RequestConUsuario } from "../middlewares/authMiddleware";
import { AuthServicio } from "../services/authServicio";
import { PerfilServicio } from "../services/perfilServicio";

export class AuthControlador {
  static async register(req: Request, res: Response) {
    try {
      const { nombre, email, password } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({
          mensaje: "Faltan campos obligatorios",
        });
      }

      const resultado = await AuthServicio.registrar(nombre, email, password);

      return res.status(201).json({
        mensaje: resultado.mensaje,
        data: resultado,
      });
    } catch (error: any) {
      console.error("Error en register:", error);
      return res.status(400).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }

  static async verifyRegister(req: Request, res: Response) {
    try {
      const { email, codigo } = req.body;

      if (!email || !codigo) {
        return res.status(400).json({
          mensaje: "Faltan campos obligatorios",
        });
      }

      const resultado = await AuthServicio.verificarRegistro(email, codigo);
      return res.json({
        mensaje: resultado.mensaje,
        data: resultado,
      });
    } catch (error: any) {
      console.error("Error en verifyRegister:", error);
      return res.status(400).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          mensaje: "Faltan campos obligatorios",
        });
      }

      const resultado = await AuthServicio.login(email, password);
      return res.json({
        mensaje: resultado.mensaje,
        data: resultado,
      });
    } catch (error: any) {
      console.error("Error en login:", error);
      return res.status(400).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          mensaje: "El correo es obligatorio",
        });
      }

      const resultado = await AuthServicio.forgotPassword(email);
      return res.json({
        mensaje: resultado.mensaje,
        data: resultado,
      });
    } catch (error: any) {
      console.error("Error en forgotPassword:", error);
      return res.status(400).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, codigo, newPassword, confirmPassword } = req.body;

      if (!email || !codigo || !newPassword || !confirmPassword) {
        return res.status(400).json({
          mensaje: "Faltan campos obligatorios",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          mensaje: "La nueva contraseña y su confirmación no coinciden",
        });
      }

      const resultado = await AuthServicio.resetPassword(email, codigo, newPassword);
      return res.json({
        mensaje: resultado.mensaje,
        data: resultado,
      });
    } catch (error: any) {
      console.error("Error en resetPassword:", error);
      return res.status(400).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }

  static async verifyLogin(req: Request, res: Response) {
    try {
      const { email, codigo } = req.body;

      if (!email || !codigo) {
        return res.status(400).json({
          mensaje: "Faltan campos obligatorios",
        });
      }

      const resultado = await AuthServicio.verificarLogin(email, codigo);
      return res.json({
        mensaje: resultado.mensaje,
        data: resultado,
      });
    } catch (error: any) {
      console.error("Error en verifyLogin:", error);
      return res.status(400).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const authorization = req.header("authorization");
      const token = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : authorization;

      if (!token) {
        return res.status(401).json({
          mensaje: "Token no enviado",
        });
      }

      const resultado = await AuthServicio.validarToken(token);

      if (!resultado?.valido) {
        return res.status(401).json({
          mensaje: resultado?.mensaje || "Token inválido",
        });
      }

      return res.json({
        data: resultado,
      });
    } catch (error: any) {
      console.error("Error en me:", error);
      return res.status(500).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const authorization = req.header("authorization");
      const token = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : authorization;

      if (!token) {
        return res.status(401).json({
          mensaje: "Token no enviado",
        });
      }

      const resultado = await AuthServicio.logout(token);
      return res.json({
        mensaje: resultado.mensaje,
        data: resultado,
      });
    } catch (error: any) {
      console.error("Error en logout:", error);
      return res.status(400).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }

  static async profile(req: RequestConUsuario, res: Response) {
    try {
      const idUsuario = Number(req.usuario?.id_usuario);

      if (!idUsuario) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
        });
      }

      const perfil = await PerfilServicio.obtenerPerfil(idUsuario);

      return res.json({
        data: perfil,
      });
    } catch (error: any) {
      console.error("Error en profile:", error);
      return res.status(400).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }

  static async updateProfile(req: RequestConUsuario, res: Response) {
    try {
      const idUsuario = Number(req.usuario?.id_usuario);

      if (!idUsuario) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
        });
      }

      const perfil = await PerfilServicio.guardarPerfil(idUsuario, req.body);

      return res.json({
        mensaje: "Perfil actualizado correctamente",
        data: perfil,
      });
    } catch (error: any) {
      console.error("Error en updateProfile:", error);
      return res.status(400).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }

  static async updatePassword(req: RequestConUsuario, res: Response) {
    try {
      const idUsuario = Number(req.usuario?.id_usuario);

      if (!idUsuario) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
        });
      }

      await PerfilServicio.cambiarPassword(idUsuario, req.body);

      return res.json({
        mensaje: "Contraseña actualizada correctamente",
      });
    } catch (error: any) {
      console.error("Error en updatePassword:", error);
      return res.status(400).json({
        mensaje: error.message || "Error del servidor",
      });
    }
  }
}
