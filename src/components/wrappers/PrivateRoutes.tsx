import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoutes = ({
  session,
  sessionLoading,
}: {
  session: unknown;
  sessionLoading: boolean;
}) => {
  const userAuthenticated = session && !sessionLoading;
  return userAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
