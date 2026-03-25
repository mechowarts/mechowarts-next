import {
  Books01Icon,
  Calendar01Icon,
  File02Icon,
  GraduationScrollIcon,
  Location01Icon,
  Timer01Icon,
  ToolsIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const toolIcons = {
  Books: Books01Icon,
  GraduationCap: GraduationScrollIcon,
  CalendarDays: Calendar01Icon,
  Map: Location01Icon,
  FileText: File02Icon,
  TimerReset: Timer01Icon,
}

const tools = [
  {
    title: 'Materials',
    description: 'Course materials and resources',
    icon: 'Books',
  },
  {
    title: 'Grade Calculator',
    description: 'Calculate your CGPA',
    icon: 'GraduationCap',
  },
  {
    title: 'Events Calendar',
    description: 'Track department events',
    icon: 'CalendarDays',
  },
  {
    title: 'Alumni Map',
    description: 'Explore where our alumni work worldwide',
    icon: 'Map',
  },
  {
    title: 'Report Cover Generator',
    description: 'Generate professional report covers',
    icon: 'FileText',
  },
  {
    title: 'Pomodoro Timer',
    description: 'Stay focused with time management',
    icon: 'TimerReset',
  },
] as const

export function ToolsPage() {
  return (
    <div className="flex flex-1">
      <div className="w-full px-4 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-start gap-3">
          <HugeiconsIcon icon={ToolsIcon} className="h-9 w-9" />
          <h2 className="text-foreground w-full text-left text-2xl font-semibold md:text-3xl">
            Tools & Resources
          </h2>
        </div>

        <div className="mx-auto mt-8 w-full max-w-5xl">
          <p className="text-muted-foreground mb-8">
            Helpful tools and resources for mechatronics students
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const Icon = toolIcons[tool.icon]

              return (
                <div
                  key={tool.title}
                  className="group border-border bg-card relative cursor-pointer rounded-2xl border p-6 transition-all hover:shadow-lg"
                >
                  <span className="bg-primary/10 text-primary absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold">
                    Coming Soon
                  </span>

                  <HugeiconsIcon
                    icon={Icon}
                    className="text-primary mb-4 h-10 w-10"
                  />
                  <h3 className="group-hover:text-primary text-foreground mb-2 text-lg font-bold transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {tool.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
