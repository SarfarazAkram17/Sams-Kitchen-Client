import { useQuery } from "@tanstack/react-query";
import useAxios from "../../../Hooks/useAxios";
import FoodGrid from "../../../Components/Shared/FoodGrid";
import SectionHeading from "../../../Components/Shared/SectionHeading";

const FoodsOnSale = () => {
  const axiosInstance = useAxios();
  const query = useQuery({
    queryKey: ["randomOfferFoods"],
    queryFn: async () => (await axiosInstance.get("/foods/offer/random")).data,
  });

  return (
    <section className="band-warm border-y border-base-300 px-4 py-16 sm:py-24" aria-labelledby="offers-title">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="offers-title"
          eyebrow="A little something extra"
          title="Today’s offers"
          description="Good food, thoughtfully priced. These specials are available while they last."
          action={{ to: "/offers", label: "View all offers" }}
        />
        <FoodGrid
          query={query}
          label="offers"
          emptyTitle="No specials today"
          emptyText="There are no discounted dishes right now. The full menu is still open."
          emptyAction={{ to: "/allFoods", label: "Explore menu" }}
        />
      </div>
    </section>
  );
};

export default FoodsOnSale;
