import { Outlet } from "react-router-dom";

// Shared employee route boundary; search, create, and edit supply their own page content.
export default function EmployeePage() {
  return <Outlet />;
}
