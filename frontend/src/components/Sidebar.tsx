import {
  LayoutDashboard, ShoppingCart, Package, BarChart3,
  LogOut, Store, Menu, X, ChevronRight
} from "lucide-react";

type Page = "dashboard" | "pos" | "products" | "reports";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userRole: "admin" | "kasir";
  userName: string;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "pos" as Page, label: "Transaksi (POS)", icon: ShoppingCart },
  { id: "products" as Page, label: "Manajemen Barang", icon: Package },
  { id: "reports" as Page, label: "Laporan Penjualan", icon: BarChart3 },
];

export function Sidebar({ currentPage, onNavigate, userRole, userName, onLogout, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        w-64 bg-white border-r border-border`}
        style={{ borderRight: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <Store size={18} color="white" />
            </div>
            <div>
              <p className="text-sm leading-tight" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
                Warung
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                POS System
              </p>
            </div>
          </div>
          <button onClick={onToggle} className="lg:hidden p-1 rounded-lg hover:bg-muted transition-colors" style={{ color: "var(--muted-foreground)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onToggle(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group"
                style={{
                  backgroundColor: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "white" : "var(--muted-foreground)",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.color = "var(--accent-foreground)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
                  }
                }}
              >
                <Icon size={18} />
                <span className="text-sm" style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ backgroundColor: "var(--primary)" }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{userName}</p>
              <p className="text-xs capitalize" style={{ color: "var(--muted-foreground)" }}>
                {userRole === "admin" ? "Administrator" : "Kasir"}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
            style={{ color: "var(--destructive)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#FEF2F2"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
export default Sidebar;