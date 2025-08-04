import { Link } from "react-router";
import { MdBlock } from "react-icons/md";

const Forbidden = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-base-100 px-4">
      {/* 🚫 Icon */}
      <div className="bg-primary/10 p-6 rounded-full">
        <MdBlock className="text-primary" size={85} />
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-primary mt-6">
        403 – Forbidden
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-gray-600 text-lg max-w-md">
        Sorry, you don’t have permission to access this page.
      </p>

      {/* Actions */}
      <div className="mt-6">
        <Link to="/" className="btn btn-primary text-white">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
