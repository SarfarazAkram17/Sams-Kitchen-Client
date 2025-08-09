import Banner from '../Banner/Banner';
import Faq from "../Faq/Faq";
import FeaturedFoods from "../FeaturedFoods/FeaturedFoods";
import FoodsOnSale from "../FoodsOnSale/FoodsOnSale";
import FoodTips from "../FoodTips/FoodTips";
import HowItWorks from "../HowItWorks/HowItWorks";
import WhyChooseUs from "../WhyChooseUs/WhyChooseUs";

const Home = () => {
  return (
    <div className="space-y-16">
      <Banner></Banner>
      <HowItWorks></HowItWorks>
      <FeaturedFoods></FeaturedFoods>
      <FoodsOnSale></FoodsOnSale>
      <WhyChooseUs></WhyChooseUs>
      <FoodTips></FoodTips>
      <Faq></Faq>
    </div>
  );
};

export default Home;
