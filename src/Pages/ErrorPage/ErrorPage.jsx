import { Link } from "react-router";
import useAuth from "../../Hooks/useAuth";
import StatusPage from "../../Components/Shared/StatusPage";

const ErrorPage = () => {
  const { user } = useAuth();

  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="The link may be broken, or the page may have moved. Check the address, or head back to a page that works."
    >
      <Link to="/" className="btn btn-primary h-12 w-full sm:w-auto sm:min-w-44">
        Back to home
      </Link>
      {user && (
        <Link to="/dashboard" className="btn h-12 w-full sm:w-auto sm:min-w-44">
          Open dashboard
        </Link>
      )}
    </StatusPage>
  );
};

export default ErrorPage;
