import { Outlet, Link, Navigate, useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Upload,
  History,
  User,
  Settings,
  LogOut,
  Activity,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import logoImage from "figma:asset/8706927608ddbbd47a060a574b03f5a888a6cffb.png";

const navItems = [
  { path: "/app", icon: LayoutDashboard, label: "Panel" },
  { path: "/app/upload", icon: Upload, label: "Subir" },
  { path: "/app/history", icon: History, label: "Historial" },
  { path: "/app/profile", icon: User, label: "Perfil" },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, loading, logout, session } = useAuth();
  const visibleNavItems = session?.rol === "ADMIN"
    ? [...navItems, { path: "/app/admin", icon: Settings, label: "Admin" }]
    : navItems;

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/app" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden glow-cyan">
              <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl tracking-wider text-cyan-400 glow-text-cyan">VISIONIX</h1>
              <p className="text-xs text-cyan-400">Procesamiento de Imágenes</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative block"
              >
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-r"
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-colors"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64 min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Activity className="w-5 h-5 text-cyan-400 pulse-glow" />
            <span className="text-sm text-muted-foreground">
              Estado del Sistema: <span className="text-green-400">Activo</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm text-muted-foreground">
              {session?.email}
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-colors"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
