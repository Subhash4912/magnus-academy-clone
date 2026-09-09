import { matchPath } from "react-router-dom";

export const routePaths = {
  root: "/",
  login: "/login",
  dashboard: "/dashboard",
  employee: "/employee",
  employeeCreate: "/employee/create",
  employeeSearch: "/employee/search",
  employeeEdit: "/employee/edit/:id",
  more: "/more",
  settings: "/settings",
};

export const moreItems = [
  {
    slug: "multiple-tabs",
    label: "Multiple Tabs",
    description: "Practice navigating between tabbed content.",
  },
  {
    slug: "menu",
    label: "Menu",
    description: "Explore menu navigation patterns.",
  },
  {
    slug: "autocomplete",
    label: "Autocomplete",
    description: "Explore suggested matches while entering text.",
  },
  {
    slug: "collapsible-content",
    label: "Collapsible Content",
    description: "Explore expandable sections of content.",
  },
  {
    slug: "images",
    label: "Images",
    description: "Explore image presentation and layouts.",
  },
  {
    slug: "slider",
    label: "Slider",
    description: "Explore slider controls and value selection.",
  },
  {
    slug: "tooltips",
    label: "Tooltips",
    description: "Explore contextual hints for interface controls.",
  },
  {
    slug: "popups",
    label: "Popups",
    description: "Explore popup and dialog interfaces.",
  },
  {
    slug: "links",
    label: "Links",
    description: "Explore links and navigation examples.",
  },
  {
    slug: "css-properties",
    label: "CSS Properties",
    description: "Explore visual styling with CSS properties.",
  },
  {
    slug: "iframes",
    label: "iFrames",
    description: "Explore embedded page content.",
  },
].map((item) => ({ ...item, to: `${routePaths.more}/${item.slug}` }));

export const navigation = [
  { label: "Home", to: routePaths.dashboard, icon: "home" },
  {
    label: "Employee",
    to: routePaths.employee,
    icon: "employee",
    children: [
      { label: "Create", to: routePaths.employeeCreate },
      { label: "Search", to: routePaths.employeeSearch },
    ],
  },
  { label: "More", to: routePaths.more, icon: "more", children: moreItems },
  { label: "Settings", to: routePaths.settings, icon: "settings" },
];

export function getPageInfo(pathname) {
  for (const item of navigation) {
    if (matchPath(item.to, pathname))
      return { title: item.label === "Home" ? "Dashboard" : item.label };
    const child = item.children?.find((entry) => matchPath(entry.to, pathname));
    if (child) return { title: child.label, parent: item };
  }
  if (matchPath(routePaths.employeeEdit, pathname)) {
    return {
      title: "Edit",
      parent: navigation.find((item) => item.to === routePaths.employee),
    };
  }
  return { title: "Page not found" };
}
