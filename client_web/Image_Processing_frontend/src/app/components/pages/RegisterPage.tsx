import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { api } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import logoImage from "figma:asset/8706927608ddbbd47a060a574b03f5a888a6cffb.png";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.register({
        nombre: name,
        email,
        password,
      });
      setMessage(response.mensaje);
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "No fue posible registrar la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.verifyRegister({ email, codigo });
      setSession({
        token: response.data.token,
        idUsuario: response.data.idUsuario,
        nombre: response.data.nombre,
        email: response.data.email,
        rol: response.data.rol,
      });
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "No fue posible verificar la cuenta");
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
                "0 0 20px rgba(147, 51, 234, 0.3)",
                "0 0 40px rgba(147, 51, 234, 0.5)",
                "0 0 20px rgba(147, 51, 234, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="text-4xl mb-2 text-purple-400 glow-text-purple">VISIONIX</h1>
          <p className="text-muted-foreground">
            {step === "register" ? "Crea tu Cuenta" : `Confirma el código enviado a ${email}`}
          </p>
        </div>

        <motion.div
          className="bg-card border border-border rounded-2xl p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl mb-6 text-center text-purple-400 glow-text-purple">
            {step === "register" ? "Comenzar" : "Verificar cuenta"}
          </h2>

          {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
          {message && <div className="mb-4 rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-3 text-sm text-purple-400">{message}</div>}

          {step === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white h-12 text-base glow-purple"
              >
                {loading ? "Registrando..." : "Crear Cuenta"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          ) : (
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
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white h-12 text-base glow-purple"
              >
                {loading ? "Verificando..." : "Confirmar Código"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/" className="text-purple-400 hover:text-purple-300">
              Iniciar sesión
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
