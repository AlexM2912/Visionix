import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  User,
  Calendar,
  Shield,
  Bell,
  Save,
  Image as ImageIcon,
  Clock,
  Award,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { api, UserProfile } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

type TabKey = "account" | "notifications" | "security" | "activity";

function formatDate(value: string | null) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { session, setSession } = useAuth();
  const maxAvatarSizeBytes = 4 * 1024 * 1024;

  const [activeTab, setActiveTab] = useState<TabKey>("account");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [processingNotifications, setProcessingNotifications] = useState(true);
  const [errorNotifications, setErrorNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setLoading(true);

      try {
        const response = await api.getProfile(session.token);

        if (cancelled) {
          return;
        }

        const nextProfile = response.data;
        setProfile(nextProfile);
        setName(nextProfile.nombre || "");
        setEmail(nextProfile.email || "");
        setCompany(nextProfile.empresa || "");
        setBio(nextProfile.biografia || "");
        setAvatarBase64(nextProfile.avatarBase64 || null);
        setNotifications(nextProfile.notificationsPush);
        setEmailNotifications(nextProfile.notificationsEmail);
        setProcessingNotifications(nextProfile.notificationsProcessing);
        setErrorNotifications(nextProfile.notificationsErrors);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "No fue posible cargar el perfil");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  const applyProfile = (nextProfile: UserProfile) => {
    setProfile(nextProfile);
    setName(nextProfile.nombre || "");
    setEmail(nextProfile.email || "");
    setCompany(nextProfile.empresa || "");
    setBio(nextProfile.biografia || "");
    setAvatarBase64(nextProfile.avatarBase64 || null);
    setNotifications(nextProfile.notificationsPush);
    setEmailNotifications(nextProfile.notificationsEmail);
    setProcessingNotifications(nextProfile.notificationsProcessing);
    setErrorNotifications(nextProfile.notificationsErrors);

    if (session) {
      setSession({
        ...session,
        nombre: nextProfile.nombre,
        email: nextProfile.email,
      });
    }
  };

  const saveProfile = async (mode: "profile" | "notifications") => {
    if (!session?.token) {
      return;
    }

    setError("");
    setMessage("");

    if (mode === "profile") {
      setSavingProfile(true);
    } else {
      setSavingNotifications(true);
    }

    try {
      const response = await api.updateProfile(session.token, {
        nombre: name,
        email,
        empresa: company,
        biografia: bio,
        avatarBase64,
        notificationsPush: notifications,
        notificationsEmail: emailNotifications,
        notificationsProcessing: processingNotifications,
        notificationsErrors: errorNotifications,
      });

      applyProfile(response.data);
      setMessage(response.mensaje);
    } catch (err: any) {
      setError(err.message || "No fue posible guardar el perfil");
    } finally {
      if (mode === "profile") {
        setSavingProfile(false);
      } else {
        setSavingNotifications(false);
      }
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Selecciona una imagen válida");
      return;
    }

    if (file.size > maxAvatarSizeBytes) {
      setError("La imagen debe pesar menos de 4 MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setAvatarBase64(result);
      setMessage("Imagen cargada. Guarda los cambios para persistirla.");
      setError("");
    };

    reader.onerror = () => {
      setError("No fue posible leer la imagen seleccionada");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handlePasswordUpdate = async () => {
    if (!session?.token) {
      return;
    }

    setSavingPassword(true);
    setError("");
    setMessage("");

    try {
      const response = await api.updatePassword(session.token, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(response.mensaje);
    } catch (err: any) {
      setError(err.message || "No fue posible actualizar la contraseña");
    } finally {
      setSavingPassword(false);
    }
  };

  const stats = [
    { label: "Rol", value: profile?.rol || "--", icon: Shield, color: "cyan" },
    {
      label: "Notificaciones Activas",
      value: [notifications, emailNotifications, processingNotifications, errorNotifications]
        .filter(Boolean)
        .length.toString(),
      icon: Bell,
      color: "purple",
    },
    {
      label: "Cuenta",
      value: profile?.fechaActivacion ? "Activa" : "Pendiente",
      icon: Award,
      color: "green",
    },
    {
      label: "Miembro Desde",
      value: formatDate(profile?.fechaCreacion || null),
      icon: Calendar,
      color: "blue",
    },
  ];

  const recentActivity = [
    {
      date: formatDate(profile?.fechaCreacion || null),
      action: "Cuenta creada en Visionix",
      batch: profile?.email || "",
    },
    ...(profile?.fechaActivacion
      ? [
          {
            date: formatDate(profile.fechaActivacion),
            action: "Cuenta activada correctamente",
            batch: "Usuario verificado",
          },
        ]
      : []),
  ];

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "U";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-cyan-400 glow-text-cyan">Configuración de Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu cuenta y preferencias</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-400">
          {message}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border border-glow">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24 border border-cyan-500/40 glow-cyan">
                  {avatarBase64 ? <AvatarImage src={avatarBase64} alt={name || "Avatar"} /> : null}
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-2xl text-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border bg-background"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Cambiar foto
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-xs text-muted-foreground">PNG o JPG, hasta 4 MB</p>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl mb-1">{name || "Sin nombre"}</h2>
                <p className="text-muted-foreground mb-3">{email || "Sin correo asociado"}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm">
                    {profile?.rol || "USER"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm">
                    {profile?.fechaActivacion ? "Verificado" : "Pendiente"}
                  </span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <h3 className="text-xl mt-1">{loading ? "..." : stat.value}</h3>
                    </div>
                    <Icon
                      className={`w-8 h-8 ${
                        stat.color === "cyan"
                          ? "text-cyan-400"
                          : stat.color === "purple"
                            ? "text-purple-400"
                            : stat.color === "green"
                              ? "text-green-400"
                              : "text-blue-400"
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className="space-y-6">
          <TabsList className="bg-card border border-border p-1">
            <TabsTrigger value="account" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <User className="w-4 h-4 mr-2" />
              Cuenta
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Bell className="w-4 h-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Shield className="w-4 h-4 mr-2" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Clock className="w-4 h-4 mr-2" />
              Actividad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  Información de la Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Nombre Completo</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nombre completo"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Correo Electrónico</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@dominio.com"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Empresa</label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nombre de tu empresa"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Biografía</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntanos sobre ti..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => saveProfile("profile")}
                    disabled={savingProfile || loading}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-foreground"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {savingProfile ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  Preferencias de Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="mb-1">Notificaciones Push</h4>
                    <p className="text-sm text-muted-foreground">Recibe notificaciones sobre el procesamiento de lotes</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="mb-1">Notificaciones por Email</h4>
                    <p className="text-sm text-muted-foreground">Recibe actualizaciones por email sobre tus lotes</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="mb-1">Alertas de Procesamiento</h4>
                    <p className="text-sm text-muted-foreground">Notificar cuando el procesamiento esté completo</p>
                  </div>
                  <Switch checked={processingNotifications} onCheckedChange={setProcessingNotifications} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="mb-1">Notificaciones de Errores</h4>
                    <p className="text-sm text-muted-foreground">Alertar sobre errores de procesamiento</p>
                  </div>
                  <Switch checked={errorNotifications} onCheckedChange={setErrorNotifications} />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => saveProfile("notifications")}
                    disabled={savingNotifications || loading}
                    className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-foreground"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {savingNotifications ? "Guardando..." : "Guardar Preferencias"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Configuración de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Contraseña Actual</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Nueva Contraseña</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Confirmar Nueva Contraseña</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handlePasswordUpdate}
                    disabled={savingPassword || loading}
                    className="bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-foreground"
                  >
                    {savingPassword ? "Actualizando..." : "Actualizar Contraseña"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <motion.div
                        key={`${activity.action}-${index}`}
                        className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border hover:border-cyan-500/50 transition-all"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div>
                          <p className="mb-1">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.batch}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{activity.date}</div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                      La actividad reciente del usuario aparecerá aquí cuando haya datos reales.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
