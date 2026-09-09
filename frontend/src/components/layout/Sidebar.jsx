import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navigation } from "../../utils/navigation";
import Icon from "../common/Icon";

const linkClass = ({ isActive }) =>
  `flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/25" : "text-slate-300 hover:bg-white/10 hover:text-white"}`;
function NavigationGroup({ item, onNavigate, prefix }) {
  const { pathname } = useLocation();
  const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
  const [manuallyExpanded, setManuallyExpanded] = useState(false);
  const expanded = active || manuallyExpanded;
  const id = `${prefix}-${item.icon}`;
  return (
    <li>
      <div
        className={`flex items-center rounded-xl ${active ? "bg-white/5" : ""}`}
      >
        <NavLink
          to={item.to}
          end
          onClick={onNavigate}
          className={() => `${linkClass({ isActive: active })} flex-1`}
        >
          <Icon name={item.icon} />
          {item.label}
        </NavLink>
        <button
          type="button"
          aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
          aria-expanded={expanded}
          aria-controls={id}
          disabled={active}
          title={active ? "The current section stays expanded" : undefined}
          onClick={() => setManuallyExpanded(!manuallyExpanded)}
          className="mr-1 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:text-indigo-200"
        >
          <Icon
            name="chevron"
            className={`size-4 transition-transform motion-reduce:transition-none ${expanded ? "rotate-90" : ""}`}
          />
        </button>
      </div>
      <ul
        id={id}
        hidden={!expanded}
        className="my-2 ml-5 space-y-1 border-l border-slate-700 pl-3"
      >
        {item.children.map((child) => (
          <li key={child.to}>
            <NavLink
              to={child.to}
              end
              onClick={onNavigate}
              className={linkClass}
            >
              {child.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </li>
  );
}
export default function Sidebar({ onNavigate, prefix = "desktop" }) {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-full flex-col p-4">
      <p className="px-3 pb-4 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Main navigation
      </p>
      <nav aria-label="Main">
        <ul className="space-y-1">
          {navigation.map((item) =>
            item.children ? (
              <NavigationGroup
                key={`${item.to}-${pathname}`}
                item={item}
                onNavigate={onNavigate}
                prefix={prefix}
              />
            ) : (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  onClick={onNavigate}
                  className={linkClass}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </NavLink>
              </li>
            ),
          )}
        </ul>
      </nav>
      <div className="mt-auto pt-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
          <p className="text-sm font-semibold text-white">
            A space to practice
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Explore your academy workspace, one step at a time.
          </p>
          <span className="mt-3 inline-block rounded-md border border-indigo-400/20 bg-indigo-500/15 px-2 py-1 text-[11px] font-medium text-indigo-200">
            React · Express · MongoDB
          </span>
        </div>
      </div>
    </div>
  );
}
