import FoodListing from "../../Components/Shared/FoodListing";

const AllFoods = () => (
  <FoodListing
    endpoint="/foods"
    mode="all"
    eyebrow="Cooked fresh, just for you"
    title="From our kitchen"
    subtitle="Familiar Bangladeshi favorites, made to order and ready to share."
    emptyTitle="The menu is resting"
    emptyText="There are no dishes to show right now. Please check back soon."
  />
);

export default AllFoods;
