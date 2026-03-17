const fs = require('fs');

let pageContent = fs.readFileSync('app/page.tsx', 'utf8');

// Use proper t translation inside page.tsx if possible, but page.tsx might not be in the translation context tree at the root level.
// Wait, LanguageProvider is in app/layout.tsx
// Let's use the hook inside the component.

pageContent = pageContent.replace(
  `import { format } from "date-fns";`,
  `import { format } from "date-fns";\nimport { useTranslation } from "@/lib/i18n";`
);

pageContent = pageContent.replace(
  `export default function App() {`,
  `export default function App() {\n  const { t } = useTranslation();`
);

// Fix "Tienes X tareas pendientes" in page.tsx
pageContent = pageContent.replace(
  `new Notification("Tareas Pendientes", {
          body: \`Tienes \${pendingTodos.length} tareas pendientes. Haz clic para continuarlas.\`,
          icon: "/favicon.ico",
        });`,
  `new Notification(t.shell.notifications || "Notifications", {
          body: \`\${pendingTodos.length} pending tasks. Click to continue.\`,
          icon: "/favicon.ico",
        });`
);

// Fix "Configuration Required" text
pageContent = pageContent.replace(
  `<h1>Configuration Required</h1>`,
  `<h1>Configuration Required</h1>` // Actually let's just use English for setup stuff
);

// Fix "Access Denied" text
pageContent = pageContent.replace(
  `<h1 className="text-xl font-bold text-red-600 mb-2">Access Denied</h1>`,
  `<h1 className="text-xl font-bold text-red-600 mb-2">{t.auth.accessDenied}</h1>`
);
pageContent = pageContent.replace(
  `<p className="text-neutral-600 mb-6">Your account request has been rejected. Please contact your administrator.</p>`,
  `<p className="text-neutral-600 mb-6">{t.auth.contactAdmin}</p>`
);
pageContent = pageContent.replace(
  `Sign Out
          </button>`,
  `{t.navigation.signOut}\n          </button>`
);

pageContent = pageContent.replace(
  `<p className="text-sm font-medium">Loading SiteFlow...</p>`,
  `<p className="text-sm font-medium">{t.common.loading}</p>`
);

fs.writeFileSync('app/page.tsx', pageContent);

// Add missing translation keys to dictionaries
let d = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

d = d.replace(/contactAdmin: 'Please contact your administrator.', \},/g, "contactAdmin: 'Please contact your administrator.', accountRejected: 'Your account request has been rejected. Please contact your administrator.', },");
d = d.replace(/contactAdmin: 'Por favor, contacta a tu administrador.', \},/g, "contactAdmin: 'Por favor, contacta a tu administrador.', accountRejected: 'Tu solicitud de cuenta ha sido rechazada. Por favor contacta a tu administrador.', },");
d = d.replace(/contactAdmin: 'Por favor, contate o seu administrador.', \},/g, "contactAdmin: 'Por favor, contate o seu administrador.', accountRejected: 'Sua solicitação de conta foi rejeitada. Por favor contate o administrador.', },");

fs.writeFileSync('lib/i18n/dictionaries.ts', d);

// add to types.ts
let t = fs.readFileSync('lib/i18n/types.ts', 'utf8');
t = t.replace(/contactAdmin: string;/g, "contactAdmin: string;\n    accountRejected: string;");
fs.writeFileSync('lib/i18n/types.ts', t);
