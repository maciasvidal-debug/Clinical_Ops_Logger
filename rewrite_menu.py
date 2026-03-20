with open('components/layout/Shell.tsx', 'r') as f:
    content = f.read()

import re
# We need to extract MobileMoreMenu function and replace it with a variable.
# BUT wait! React hooks (like t() from useTranslation) cannot be called inside a non-component function if we move it out.
# It IS currently inside Shell component, so extracting it as a variable is correct.
# Why is it failing parsing? Because `const mobileMoreMenuNode = (` is failing if there's no closing `);`.
# It's better to just leave it as a function and add `// eslint-disable-next-line react-hooks/static-components`
# wait, the error was `react/no-unstable-nested-components`.
# Or we can just inline it completely inside the return statement!

match = re.search(r'const MobileMoreMenu = \(\) => \((.*?)\n  \);', content, re.DOTALL)
if match:
    menu_jsx = match.group(1)
    # Remove the function declaration
    content = content[:match.start()] + content[match.end():]
    # Replace the component call with the JSX
    content = content.replace('<MobileMoreMenu />', f'<div className="pointer-events-auto">{menu_jsx}</div>')

# Apply the rest of the visual fixes
content = content.replace(
    'className="absolute bottom-full left-0 right-0 mb-2 mx-4 glass-panel border border-neutral-200/50 shadow-2xl z-50 overflow-hidden"',
    'className="absolute bottom-full left-0 right-0 mb-2 mx-4 glass-panel border border-neutral-200/50 shadow-2xl z-[100] overflow-hidden pointer-events-auto"'
)

content = content.replace(
    'className={cn(\n                  "relative flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-300 active:scale-90",',
    'className={cn(\n                  "relative flex flex-col items-center justify-center flex-1 min-w-0 px-1 py-1 rounded-2xl transition-all duration-300 active:scale-90",'
)
content = content.replace(
    'className={cn(\n                "relative flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all duration-300 active:scale-90",',
    'className={cn(\n                "relative flex flex-col items-center justify-center flex-1 min-w-0 px-1 py-1 rounded-2xl transition-all duration-300 active:scale-90",'
)

content = content.replace(
    '<span className={cn("relative z-10 text-[10px] whitespace-nowrap transition-all duration-300", isActive ? "font-bold" : "font-medium")}>',
    '<span className={cn("relative z-10 text-[10px] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-1 transition-all duration-300", isActive ? "font-bold" : "font-medium")}>'
)

# Use activity SVG instead of logo for consistency across all files since the Auth menu uses Activity too or simple Logo
# Wait, Auth menu uses a complex Siteflow logo icon. Let's make sure the mobile Shell header is consistent with Auth menu if it's there. The dashboard uses Activity.
content = content.replace(
    '<Image\n              src="/logo-icon.png"\n              alt="SiteFlow Logo"\n              fill\n              sizes="32px"\n              className="object-contain"\n              priority\n            />',
    '<div className="relative w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-sm"><Activity className="w-5 h-5" /></div>'
)

with open('components/layout/Shell.tsx', 'w') as f:
    f.write(content)
