import { useQuery } from "@tanstack/react-query";
import useAxios from "../../../Hooks/useAxios";
import FoodGrid from "../../../Components/Shared/FoodGrid";
import SectionHeading from "../../../Components/Shared/SectionHeading";

const FeaturedFoods = () => {
  const axiosInstance = useAxios();
  const query = useQuery({
    queryKey: ["randomFoods"],
    queryFn: async () => (await axiosInstance.get("/foods/random")).data,
  });

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-24" aria-labelledby="featured-foods-title">
      <SectionHeading
        id="featured-foods-title"
        eyebrow="From our kitchen"
        title="House favorites"
        description="The dishes our guests come back for, prepared fresh when you order."
        action={{ to: "/allFoods", label: "See the full menu" }}
      />
      <FoodGrid
        query={query}
        label="featured dishes"
        emptyTitle="The menu is being refreshed"
        emptyText="Browse all dishes to see what’s available today."
        emptyAction={{ to: "/allFoods", label: "Browse menu" }}
      />
    </section>
  );
};

export default FeaturedFoods;
