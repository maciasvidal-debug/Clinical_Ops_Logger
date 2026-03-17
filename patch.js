const fs = require('fs');

let shellContent = fs.readFileSync('components/layout/Shell.tsx', 'utf8');

// Replace nav items array
const oldNavItems = `  const navItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: t.navigation.dashboard, icon: LayoutDashboard },
    { id: "log", label: t.navigation.log, icon: Clock },
    { id: "history", label: t.navigation.history, icon: History },
    { id: "reports", label: t.navigation.reports, icon: BarChart3 },
    ...(profile?.role === "manager" || profile?.role === "super_admin" ? [{ id: "team" as View, label: t.navigation.team, icon: Users }] : []),
  ];`;

const newNavItems = `  const navItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: t.navigation.dashboard, icon: LayoutDashboard },
    { id: "log", label: t.navigation.log, icon: Clock },
    { id: "history", label: t.navigation.history, icon: History },
    { id: "reports", label: t.navigation.reports, icon: BarChart3 },
    ...(profile?.role === "manager" || profile?.role === "super_admin" ? [{ id: "team" as View, label: t.navigation.team, icon: Users }] : []),
    ...(profile?.role === "manager" || profile?.role === "super_admin" ? [{ id: "settings" as View, label: t.navigation.settings || "Settings", icon: Settings }] : []),
  ];`;

shellContent = shellContent.replace(oldNavItems, newNavItems);

// Update mobile nav to include a sign out button, or put sign out in top header for mobile

const mobileNavOld = `      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 pb-safe z-20">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;`;

const mobileNavNew = `      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 pb-safe z-20">
        <div className="flex items-center justify-around px-1 py-2 overflow-x-auto hide-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;`;

shellContent = shellContent.replace(mobileNavOld, mobileNavNew);


const signOutMobileOld = `                <div className={cn(
                  "p-1 rounded-full mb-1 transition-colors",
                  isActive ? "bg-indigo-50" : "bg-transparent"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}`;

const signOutMobileNew = `                <div className={cn(
                  "p-1 rounded-full mb-1 transition-colors",
                  isActive ? "bg-indigo-50" : "bg-transparent"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center min-w-[64px] h-14 rounded-xl transition-colors text-neutral-500 hover:text-red-600"
          >
            <div className="p-1 rounded-full mb-1 transition-colors bg-transparent">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium whitespace-nowrap">{t.navigation.signOut}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}`;

shellContent = shellContent.replace(signOutMobileOld, signOutMobileNew);

const typeViewOld = `type View = "dashboard" | "log" | "history" | "reports" | "team";`;
const typeViewNew = `type View = "dashboard" | "log" | "history" | "reports" | "team" | "settings";`;
shellContent = shellContent.replace(typeViewOld, typeViewNew);

fs.writeFileSync('components/layout/Shell.tsx', shellContent);
