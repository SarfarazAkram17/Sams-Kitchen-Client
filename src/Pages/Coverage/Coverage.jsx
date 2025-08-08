import { useState } from "react";
import BangladeshMap from "./BangladeshMap";
import { useLoaderData } from "react-router";

const Coverage = () => {
  const serviceCenters = useLoaderData();
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSelectedDistrict(search);
  };

  return (
    <div className="px-4 md:px-8 py-16 bg-white rounded-2xl space-y-10">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#03373D]">
        We are available in 64 districts
      </h1>

      <div>
        <form onSubmit={handleSubmit} className="relative">
          <label className="input rounded-full w-[50%] bg-[#F0F3F6]">
            <svg
              className="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              required
              placeholder="Search here"
              defaultValue={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary absolute right-[50%] z-10 font-bold px-8 rounded-full text-white"
          >
            Search
          </button>
        </form>

        {error && (
          <p className="text-red-500 font-semibold text-xs mt-4">{error}</p>
        )}
      </div>

      <hr className="text-gray-300" />

      <h1 className="text-xl md:text-2xl font-extrabold text-[#03373D]">
        We deliver almost all over Bangladesh
      </h1>

      <BangladeshMap
        serviceCenters={serviceCenters}
        selectedDistrict={selectedDistrict}
        setError={setError}
      />
    </div>
  );
};

export default Coverage;
