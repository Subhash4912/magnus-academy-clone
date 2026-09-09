import ModulePage from '../../components/more/ModulePage'
import Tooltip from '../../components/more/Tooltip'

const examples = [
  ['Edit', 'Update the selected item'],
  ['Delete', 'Permanently remove this item'],
  ['Information', 'View more information'],
  ['Settings', 'Open application preferences'],
  ['Help', 'Get help with this page'],
]
export default function TooltipsPage() {
  return (
    <ModulePage
      title="Tooltips"
      description="Hover over or focus each button to reveal a short contextual hint."
    >
      <p className="mb-8 max-w-2xl text-sm leading-6 text-slate-600">
        Tooltips add supporting information without replacing clear button
        labels. Use Tab to test keyboard focus.
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-12 py-6">
        {examples.map(([label, tip]) => (
          <Tooltip key={label} label={tip}>
            {label}
          </Tooltip>
        ))}
      </div>
    </ModulePage>
  )
}
