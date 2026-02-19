import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, Link2, UserCog, Settings, Database, LogOut, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { id: 'intelligence', label: 'Intelligence', icon: LayoutDashboard, path: '/admin' },
  { id: 'affiliates', label: 'Affiliates', icon: Users, path: '/admin/affiliates' },
  { id: 'links', label: 'Link Management', icon: Link2, path: '/admin/links' },
  { id: 'team', label: 'Team Access', icon: UserCog, path: '/admin/team' },
  { id: 'recovery', label: 'Data Recovery', icon: Database, path: '/admin/recovery' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      style={{
        background: 'hsl(var(--sidebar-background))',
        borderRight: '1px solid hsl(var(--sidebar-border))',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-neon-indigo to-neon-pink flex items-center justify-center">
          <Shield className="w-4 h-4 text-background" />
        </div>
        {!collapsed && (
          <span className="font-outfit font-bold text-base gradient-text whitespace-nowrap">AMP Mediaz</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded-lg hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`sidebar-item w-full ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-2 py-4 border-t border-sidebar-border space-y-1">
        {!collapsed && profile && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-foreground truncate">{profile.name || profile.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-item w-full text-destructive hover:text-destructive hover:bg-destructive/10 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
