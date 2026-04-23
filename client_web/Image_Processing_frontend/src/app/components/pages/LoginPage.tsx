import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { api } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import logoImage from "figma:asset/8706927608ddbbd47a060a574b03f5a888a6cffb.png";

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [step, setStep] = useState<"login" | "verify" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.login({ email, password });
      setMessage(response.mensaje);
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "No fue posible iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.verifyLogin({ email, codigo });
      setSession({
        token: response.data.token,
        idUsuario: response.data.idUsuario,
        nombre: response.data.nombre,
        email: response.data.email,
        rol: response.data.rol,
      });
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "No fue posible verificar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.forgotPassword({ email });
      setMessage(response.mensaje);
      setCodigo("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "No fue posible enviar el código de recuperación");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.resetPassword({
        email,
        codigo,
        newPassword,
        confirmPassword,
      });
      setMessage(response.mensaje);
      setPassword("");
      setCodigo("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("login");
    } catch (err: any) {
      setError(err.message || "No fue posible restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden mb-4"
            animate={{
              boxShadow: [
                "0 0 20px rgba(0, 212, 255, 0.3)",
                "0 0 40px rgba(0, 212, 255, 0.5)",
                "0 0 20px rgba(0, 212, 255, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="text-4xl mb-2 text-cyan-400 glow-text-cyan">VISIONIX</h1>
          <p className="text-muted-foreground">Plataforma Distribuida de Procesamiento de Imágenes</p>
        </div>

        <motion.div
          className="bg-card border border-border rounded-2xl p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl mb-2 text-center text-cyan-400 glow-text-cyan">
            {step === "login"
              ? "Bienvenido"
              : step === "verify"
                ? "Verifica tu acceso"
                : step === "forgot"
                  ? "Recuperar contraseña"
                  : "Nueva contraseña"}
          </h2>
          <p className="text-sm text-center text-muted-foreground mb-6">
            {step === "login"
              ? "Ingresa tus credenciales para recibir un código"
              : step === "verify"
                ? `Ingresa el código enviado a ${email}`
                : step === "forgot"
                  ? "Te enviaremos un código para restablecer el acceso"
                  : `Ingresa el código enviado a ${email} y define una nueva contraseña`}
          </p>

          {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
          {message && <div className="mb-4 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-400">{message}</div>}

          {step === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white h-12 text-base glow-cyan"
              >
                {loading ? "Enviando..." : "Iniciar Sesión"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setCodigo("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setStep("forgot");
                }}
                className="w-full text-sm text-cyan-400 hover:text-cyan-300"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          ) : step === "verify" ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Código de verificación</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Ingresa el código"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white h-12 text-base glow-cyan"
              >
                {loading ? "Verificando..." : "Confirmar Código"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                type="button"
                onClick={() => setStep("login")}
                className="w-full bg-transparent border border-border text-foreground hover:bg-accent"
              >
                Volver
              </Button>
            </form>
          ) : step === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white h-12 text-base glow-cyan"
              >
                {loading ? "Enviando..." : "Enviar código"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                type="button"
                onClick={() => setStep("login")}
                className="w-full bg-transparent border border-border text-foreground hover:bg-accent"
              >
                Volver al login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Código de recuperación</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Ingresa el código"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Nueva contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Confirmar nueva contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white h-12 text-base glow-cyan"
              >
                {loading ? "Guardando..." : "Actualizar contraseña"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                type="button"
                onClick={() => setStep("login")}
                className="w-full bg-transparent border border-border text-foreground hover:bg-accent"
              >
                Volver al login
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
              Crear una
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
