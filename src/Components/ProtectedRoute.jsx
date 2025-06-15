import { Navigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";

function ProtectedRoute({ allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/unauthorized" />;
  }

  if (!allowedRoles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet/>;
}

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.array.isRequired,
};

export default ProtectedRoute;
