with open('components/layout/Shell.tsx', 'r') as f:
    content = f.read()

# Make MobileMoreMenu an inline JSX snippet properly
content = content.replace('const MobileMoreMenu = () => (', 'const mobileMoreMenuNode = (')
content = content.replace('<MobileMoreMenu />', '{mobileMoreMenuNode}')

# Fix pointer events and z-index
content = content.replace(
    'className="absolute bottom-full left-0 right-0 mb-2 mx-4 glass-panel border border-neutral-200/50 shadow-2xl z-50 overflow-hidden"',
    'className="absolute bottom-full left-0 right-0 mb-2 mx-4 glass-panel border border-neutral-200/50 shadow-2xl z-[100] overflow-hidden pointer-events-auto"'
)

# Fix width and padding
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

# Use activity SVG instead of logo
content = content.replace(
    '<Image\n              src="/logo-icon.png"\n              alt="SiteFlow Logo"\n              fill\n              sizes="32px"\n              className="object-contain"\n              priority\n            />',
    '<div className="relative w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-sm"><Activity className="w-5 h-5" /></div>'
)

# Put inside a pointer-events wrapper
content = content.replace('{mobileMoreMenuNode}', '<div className="pointer-events-auto">{mobileMoreMenuNode}</div>')

with open('components/layout/Shell.tsx', 'w') as f:
    f.write(content)
