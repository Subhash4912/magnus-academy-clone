import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import { routePaths } from "../utils/navigation";

export default function NotFoundPage() {
  return (
    <Card className="text-center">
      <div className="py-12 sm:py-20">
        <p className="text-6xl font-semibold tracking-tight text-indigo-600">
          404
        </p>
        <h1 className="mt-5 text-2xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          This address does not match a workspace page. Check the URL or return
          to your dashboard.
        </p>
        <Link
          to={routePaths.dashboard}
          className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to dashboard
        </Link>
      </div>
    </Card>
  );
}
