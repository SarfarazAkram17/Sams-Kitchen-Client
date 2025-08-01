import { Link, NavLink } from "react-router";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import logo from "../../assets/images/logo.png";

const Footer = () => {
  const normalClass = "px-3 py-0.5 block w-fit text-sm rounded-full font-bold hover:text-primary hover:bg-primary/10";

  const navLinks = (
    <>
      <NavLink
        to="/"
        className={`${normalClass}`}
      >
        Home
      </NavLink>
      <NavLink
        to="/about"
        className={`${normalClass}`}
      >
        About Us
      </NavLink>
      <NavLink
        to="/community"
       className={`${normalClass}`}
      >
        Community
      </NavLink>
      <NavLink
        to="/foods"
       className={`${normalClass}`}
      >
        All Foods
      </NavLink>
      {/* <NavLink
        to="/offers"
       className={`${normalClass}`}
      >
        Offers
      </NavLink> */}
    </>
  );
  return (
    <footer className="bg-base-200 text-base-content mt-10 border-t border-gray-200">
      <div className="px-6 py-10 grid md:grid-cols-3 gap-10">
        {/* Brand Section */}
        <div>
        <Link to="/" className="flex items-center gap-1">
          <img src={logo} alt="Sam's Kitchen Logo" className="h-14 w-auto" />
          <span className="text-[#392B12] font-bold sm:text-xl">
            Sam's Kitchen
          </span>
        </Link>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Fresh, delicious meals delivered to your door. Experience the taste
            of love in every bite. 🍴
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">{navLinks}</ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="text-lg font-bold mb-3">Get In Touch</h3>
          <p className="text-sm mb-2">📍 Dhaka, Bangladesh</p>
          <p className="text-sm mb-2">📧 support@samskitchen.com</p>
          <p className="text-sm mb-2">📞 +880 1234 567 890</p>

          {/* Social Icons */}
          <div className="flex space-x-3 mt-4">
            <a
              href="https://www.facebook.com"
              target="_blank"
              className="p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              className="p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition"
            >
              <FaInstagram />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              className="p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition"
            >
              <FaTwitter />
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              className="p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-300 text-center py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} Sam's Kitchen. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
