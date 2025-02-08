import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoutes = ({
  user,
  initialUserLoading,
}: {
  user: unknown;
  initialUserLoading: boolean;
}) => {

  const userAuthenticated = user && !initialUserLoading;
  return userAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
