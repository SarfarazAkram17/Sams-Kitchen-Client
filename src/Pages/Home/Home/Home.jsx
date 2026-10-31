import Banner from "../Banner/Banner";
import Faq from "../Faq/Faq";
import FeaturedFoods from "../FeaturedFoods/FeaturedFoods";
import FoodsOnSale from "../FoodsOnSale/FoodsOnSale";
import FoodTips from "../FoodTips/FoodTips";
import HowItWorks from "../HowItWorks/HowItWorks";
import WhyChooseUs from "../WhyChooseUs/WhyChooseUs";

const Home = () => {
  return (
    <main>
      <div className="mt-8 mb-8">
        {" "}
        <Banner />
      </div>
      <div className="mt-8 mb-8">
        <FeaturedFoods />
      </div>
      <div className="mt-8 mb-8">
        <FoodsOnSale />
      </div>
      <div className="mt-8 mb-8">
        {" "}
        <HowItWorks />
      </div>
      <div className="mt-8 mb-8">
        {" "}
        <WhyChooseUs />
      </div>
      <div className="mt-8 mb-8">
        <FoodTips />
      </div>
      <div className="mt-8">
        <Faq />
      </div>
    </main>
  );
};

export default Home;
