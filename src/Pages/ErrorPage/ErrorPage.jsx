import { Link } from "react-router";
import Lottie from "lottie-react";
import errorAnimation from "../../assets/animations/error.json";

const ErrorPage = () => {
  return (
    <div className="pb-8 flex flex-col items-center justify-center text-center bg-base-100 px-4">
      <Lottie animationData={errorAnimation} loop={true} className="w-[28%]" />

      {/* Error Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-primary">
        Oops! Page Not Found
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-base-content/80 text-lg max-w-md">
        The page you’re looking for doesn’t exist or has been moved. Let’s get
        you back on track.
      </p>

      {/* Actions */}
      <div className="space-y-6 flex flex-col mt-6">
        <Link to="/" className="btn btn-primary">
          Go to Home
        </Link>
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
