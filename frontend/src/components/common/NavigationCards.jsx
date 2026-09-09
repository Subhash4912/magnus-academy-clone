import { Link } from "react-router-dom";
import Card from "./Card";
import Icon from "./Icon";
export default function NavigationCards({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.to}>
          <span className="mb-5 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <Icon name={item.icon || "more"} />
          </span>
          <h2 className="text-base font-semibold text-slate-900">
            <Link className="hover:text-indigo-600" to={item.to}>
              {item.label}
            </Link>
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {item.description ||
              `Open the ${item.label.toLowerCase()} example.`}
          </p>
          <Link
            to={item.to}
            aria-label={`Open ${item.label}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Explore
            <Icon name="arrow" className="size-4" />
          </Link>
        </Card>
      ))}
    </div>
  );
}
