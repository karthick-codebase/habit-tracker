import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold">
        404
      </h1>

      <Link
        to="/"
        className="mt-4 text-indigo-600"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;