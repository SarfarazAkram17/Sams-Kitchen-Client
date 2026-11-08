import FoodListing from "../../Components/Shared/FoodListing";

const Offers = () => (
  <FoodListing
    endpoint="/foods/offer"
    mode="offers"
    eyebrow="A little extra goodness"
    title="Today’s offers"
    subtitle="A good meal tastes even better when there’s a little saved for later."
    emptyTitle="No offers on the table"
    emptyText="Our current menu has no discounted dishes. Keep an eye out for the next special."
  />
);

export default Offers;
