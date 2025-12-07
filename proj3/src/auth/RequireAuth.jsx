import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  const location = useLocation();

  if (isAuthed) return children ? children : <Outlet />;

  // Not authed? Then bounce to Home and remember where they tried to go
  return <Navigate to="/" state={{ from: location }} replace />;
}
