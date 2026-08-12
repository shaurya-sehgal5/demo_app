import { NavLink } from "react-router-dom";
import { Bell, User } from "lucide-react";

const navItems = [
  { label: "Overview", path: "/" },
  { label: "Projects", path: "/projects" },
  { label: "Tasks", path: "/tasks" },
  { label: "Activity", path: "/activity" },
];

export default function TopNav() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">
              PulseBoard
            </span>
            <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
              Project & team operations
            </span>
          </div>
          <div className="flex items-center space-x-8">
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? "text-primary-600 border-b-2 border-primary-500" : "text-gray-600 hover:text-gray-900"} pb-1`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2 border-l pl-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                  <User size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  Alex Morgan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
