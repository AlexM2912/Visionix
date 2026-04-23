import * as soap from "soap";
import { env } from "../config/env";
import { unwrapSoapResult } from "../utils/soap";

interface AuthSoapResponse {
  ok?: boolean;
  mensaje?: string;
  token?: string;
  idUsuario?: number;
  nombre?: string;
  email?: string;
  rol?: string;
}

interface TokenValidationResponse {
  valido?: boolean;
  mensaje?: string;
  idUsuario?: number;
  email?: string;
  rol?: string;
}

export class AuthServicio {
  static async registrar(nombre: string, email: string, password: string) {
    const client = await soap.createClientAsync(env.SOAP_WSDL_URL);
    const [response] = await client.signupAsync({
      request: {
        nombre,
        email,
        password,
      },
    });
    const resultado = unwrapSoapResult<AuthSoapResponse>(response);

    if (!resultado?.ok) {
      throw new Error(resultado?.mensaje || "No fue posible registrar el usuario");
    }

    return resultado;
  }

  static async verificarRegistro(email: string, codigo: string) {
    const client = await soap.createClientAsync(env.SOAP_WSDL_URL);
    const [response] = await client.verifySignupAsync({
      request: {
        email,
        codigo,
      },
    });
    const resultado = unwrapSoapResult<AuthSoapResponse>(response);

    if (!resultado?.ok) {
      throw new Error(resultado?.mensaje || "No fue posible verificar el registro");
    }

    return resultado;
  }

  static async login(email: string, password: string) {
    const client = await soap.createClientAsync(env.SOAP_WSDL_URL);
    const [response] = await client.loginAsync({
      request: {
        email,
        password,
      },
    });
    const resultado = unwrapSoapResult<AuthSoapResponse>(response);

    if (!resultado?.ok) {
      throw new Error(resultado?.mensaje || "No fue posible iniciar sesión");
    }

    return resultado;
  }

  static async forgotPassword(email: string) {
    const client = await soap.createClientAsync(env.SOAP_WSDL_URL);
    const [response] = await client.forgotPasswordAsync({
      request: {
        email,
      },
    });
    const resultado = unwrapSoapResult<AuthSoapResponse>(response);

    if (!resultado?.ok) {
      throw new Error(resultado?.mensaje || "No fue posible iniciar la recuperación");
    }

    return resultado;
  }

  static async resetPassword(email: string, codigo: string, newPassword: string) {
    const client = await soap.createClientAsync(env.SOAP_WSDL_URL);
    const [response] = await client.resetPasswordAsync({
      request: {
        email,
        codigo,
        newPassword,
      },
    });
    const resultado = unwrapSoapResult<AuthSoapResponse>(response);

    if (!resultado?.ok) {
      throw new Error(resultado?.mensaje || "No fue posible restablecer la contraseña");
    }

    return resultado;
  }

  static async verificarLogin(email: string, codigo: string) {
    const client = await soap.createClientAsync(env.SOAP_WSDL_URL);
    const [response] = await client.verifyLoginAsync({
      request: {
        email,
        codigo,
      },
    });
    const resultado = unwrapSoapResult<AuthSoapResponse>(response);

    if (!resultado?.ok) {
      throw new Error(resultado?.mensaje || "No fue posible verificar el login");
    }

    return resultado;
  }

  static async validarToken(token: string) {
    const client = await soap.createClientAsync(env.SOAP_WSDL_URL);
    const [response] = await client.validarTokenAsync({ token });
    const resultado = unwrapSoapResult<TokenValidationResponse>(response);
    return resultado;
  }

  static async logout(token: string) {
    const client = await soap.createClientAsync(env.SOAP_WSDL_URL);
    const [response] = await client.logoutAsync({ token });
    const resultado = unwrapSoapResult<AuthSoapResponse>(response);

    if (!resultado?.ok) {
      throw new Error(resultado?.mensaje || "No fue posible cerrar sesión");
    }

    return resultado;
  }
}
