const fs = require('fs');

const path = 'components/reports/ReportsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
  'import { Sparkles, Loader2 } from "lucide-react";',
  'import { Sparkles, Loader2, Printer } from "lucide-react";\nimport { TimesheetReport } from "./TimesheetReport";'
);

// 2. Add state variable
content = content.replace(
  'const [aiError, setAiError] = useState<string | null>(null);',
  'const [aiError, setAiError] = useState<string | null>(null);\n  const [showTimesheetModal, setShowTimesheetModal] = useState(false);'
);

// 3. Update header buttons
const oldButtons = `        <button
          onClick={handleGenerateAIReport}
          disabled={isGeneratingAI || visibleLogs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          {isGeneratingAI ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isGeneratingAI ? "Analyzing Data..." : "Generate AI Insights"}
        </button>
      </header>`;

const newButtons = `        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowTimesheetModal(true)}
            disabled={visibleLogs.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 disabled:text-neutral-400 disabled:bg-neutral-50 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            Export Timesheet (PDF)
          </button>
          <button
            onClick={handleGenerateAIReport}
            disabled={isGeneratingAI || visibleLogs.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            {isGeneratingAI ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGeneratingAI ? "Analyzing Data..." : "Generate AI Insights"}
          </button>
        </div>
      </header>

      {showTimesheetModal && (
        <TimesheetReport
          logs={visibleLogs}
          profile={profile}
          projects={projects}
          aiReport={aiReport}
          onClose={() => setShowTimesheetModal(false)}
        />
      )}`;

content = content.replace(oldButtons, newButtons);

fs.writeFileSync(path, content);
