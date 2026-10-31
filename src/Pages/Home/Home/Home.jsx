import Banner from "../Banner/Banner";
import CtaBanner from "../CtaBanner/CtaBanner";
import Faq from "../Faq/Faq";
import FeaturedFoods from "../FeaturedFoods/FeaturedFoods";
import FoodsOnSale from "../FoodsOnSale/FoodsOnSale";
import FoodTips from "../FoodTips/FoodTips";
import HowItWorks from "../HowItWorks/HowItWorks";
import TrustStrip from "../TrustStrip/TrustStrip";
import WhyChooseUs from "../WhyChooseUs/WhyChooseUs";

// RootLayout already provides <main>, so the page is just a stack of sections.
const Home = () => (
  <>
    <Banner />
    <TrustStrip />
    <FeaturedFoods />
    <FoodsOnSale />
    <HowItWorks />
    <WhyChooseUs />
    <FoodTips />
    <Faq />
    <CtaBanner />
  </>
);

export default Home;
