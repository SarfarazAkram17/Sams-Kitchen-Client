import React from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import useAuth from "../../Hooks/useAuth";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

const ShareFood = ({ food }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const url = `https://sams-kitchen.netlify.app/foods/${food._id}`;

  return (
    <div className="flex gap-2 items-center">
      {user ? (
        <>
          <FacebookShareButton
            url={url}
            quote={`Check out this delicious dish: ${food.name}!`}
          >
            <FacebookIcon size={28} round />
          </FacebookShareButton>
          <TwitterShareButton
            url={url}
            title={`Check out this delicious dish: ${food.name}!`}
          >
            <TwitterIcon size={28} round />
          </TwitterShareButton>
          <TelegramShareButton
            url={url}
            title={`Check out this delicious dish: ${food.name}!`}
          >
            <TelegramIcon size={28} round />
          </TelegramShareButton>
          <WhatsappShareButton
            url={url}
            title={`Check out this delicious dish: ${food.name}!`}
            separator=" - "
          >
            <WhatsappIcon size={28} round />
          </WhatsappShareButton>
          <LinkedinShareButton
            url={url}
            title={`Check out this delicious dish: ${food.name}!`}
            summary={food.description}
            source="Sam's Kitchen"
          >
            <LinkedinIcon size={28} round />
          </LinkedinShareButton>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              navigate("/login", { state: location.pathname });
              toast.info("Login first");
            }}
          >
            <FacebookIcon size={28} round />
          </button>
          <button
            onClick={() => {
              navigate("/login", { state: location.pathname });
              toast.info("Login first");
            }}
          >
            <TwitterIcon size={28} round />
          </button>
          <button
            onClick={() => {
              navigate("/login", { state: location.pathname });
              toast.info("Login first");
            }}
          >
            <TelegramIcon size={28} round />
          </button>
          <button
            onClick={() => {
              navigate("/login", { state: location.pathname });
              toast.info("Login first");
            }}
          >
            <WhatsappIcon size={28} round />
          </button>
          <button
            onClick={() => {
              navigate("/login", { state: location.pathname });
              toast.info("Login first");
            }}
          >
            <LinkedinIcon size={28} round />
          </button>
        </>
      )}
    </div>
  );
};

export default ShareFood;
