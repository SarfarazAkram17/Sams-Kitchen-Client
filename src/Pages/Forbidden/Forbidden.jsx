import { Link } from "react-router";
import useAuth from "../../Hooks/useAuth";
import StatusPage from "../../Components/Shared/StatusPage";

const Forbidden = () => {
  const { user } = useAuth();

  return (
    <StatusPage
      code="403"
      title="You can’t open this page"
      description="Your account doesn’t have permission to view it. Sign in with an account that does, or return to a page you can use."
    >
      <Link to="/" className="btn btn-primary h-12 w-full sm:w-auto sm:min-w-44">
        Back to home
      </Link>
      {user ? (
        <Link to="/dashboard" className="btn h-12 w-full sm:w-auto sm:min-w-44">
          Open dashboard
        </Link>
      ) : (
        <Link to="/login" className="btn h-12 w-full sm:w-auto sm:min-w-44">
          Sign in
        </Link>
      )}
    </StatusPage>
  );
};

export default Forbidden;
