import Lottie from "lottie-react";
import loading from "../../assets/animations/loading.json";

const Loading = () => {
  return (
    <div className="h-[80vh] flex justify-center items-center">
      <Lottie
        animationData={loading}
        loop={true}
        className="h-[35vh]"
      />
    </div>
  );
};

export default Loading;