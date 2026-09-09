import { Navigate, Route, Routes } from "react-router-dom";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LoginPage from "../pages/auth/LoginPage";
import EmployeePage from "../pages/employee/EmployeePage";
import EmployeeCreatePage from "../pages/employee/EmployeeCreatePage";
import EmployeeSearchPage from "../pages/employee/EmployeeSearchPage";
import EmployeeEditPage from "../pages/employee/EmployeeEditPage";
import MorePage from "../pages/more/MorePage";
import SettingsPage from "../pages/settings/SettingsPage";
import NotFoundPage from "../pages/NotFoundPage";
import { moreItems, routePaths } from "../utils/navigation";
import MultipleTabsPage from "../pages/more/MultipleTabsPage";
import MenuPage from "../pages/more/MenuPage";
import AutocompletePage from "../pages/more/AutocompletePage";
import CollapsibleContentPage from "../pages/more/CollapsibleContentPage";
import ImagesPage from "../pages/more/ImagesPage";
import SliderPage from "../pages/more/SliderPage";
import TooltipsPage from "../pages/more/TooltipsPage";
import PopupsPage from "../pages/more/PopupsPage";
import LinksPage from "../pages/more/LinksPage";
import CssPropertiesPage from "../pages/more/CssPropertiesPage";
import IFramesPage from "../pages/more/IFramesPage";

const morePages = {
  "multiple-tabs": MultipleTabsPage,
  menu: MenuPage,
  autocomplete: AutocompletePage,
  "collapsible-content": CollapsibleContentPage,
  images: ImagesPage,
  slider: SliderPage,
  tooltips: TooltipsPage,
  popups: PopupsPage,
  links: LinksPage,
  "css-properties": CssPropertiesPage,
  iframes: IFramesPage,
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={routePaths.login} element={<LoginPage />} />
      <Route element={<AuthenticatedLayout />}>
        <Route
          path={routePaths.root}
          element={<Navigate to={routePaths.dashboard} replace />}
        />
        <Route path={routePaths.dashboard} element={<DashboardPage />} />
        <Route path={routePaths.employee} element={<EmployeePage />}>
          <Route
            index
            element={<Navigate to={routePaths.employeeSearch} replace />}
          />
          <Route
            path={routePaths.employeeCreate}
            element={<EmployeeCreatePage />}
          />
          <Route
            path={routePaths.employeeSearch}
            element={<EmployeeSearchPage />}
          />
          <Route
            path={routePaths.employeeEdit}
            element={<EmployeeEditPage />}
          />
        </Route>
        <Route path={routePaths.more}>
          <Route index element={<MorePage />} />
          {moreItems.map((item) => (
            <Route
              key={item.slug}
              path={item.to}
              Component={morePages[item.slug]}
            />
          ))}
        </Route>
        <Route path={routePaths.settings} element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
