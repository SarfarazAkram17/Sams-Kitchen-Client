import './carousel.css'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

const Banner = () => {
  return (
    <Carousel
      autoPlay={true}
      infiniteLoop={true}
      showThumbs={false}
      showStatus={false}
      transitionTime={500}
    >
      {/* <div>
        <img src={bannerImagel} />
      </div>
      <div>
        <img src={bannerImage2} />
      </div>
      <div>
        <img src={bannerImage3} />
      </div> */}
    </Carousel>
  );
};

export default Banner;
