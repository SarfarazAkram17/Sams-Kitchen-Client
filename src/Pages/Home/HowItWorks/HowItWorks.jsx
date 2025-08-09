import { FaSearch, FaMotorcycle, FaSmile } from "react-icons/fa";
import { PiShoppingCartBold } from "react-icons/pi";
import { motion } from "framer-motion";

const steps = [
  {
    icon: <FaSearch size={40} className="text-primary" />,
    title: "Browse Foods",
    description: "Explore our delicious foods and choose your favorites.",
  },
  {
    icon: <PiShoppingCartBold size={40} className="text-primary" />,
    title: "Place Order",
    description: "Add your desired items to the cart and checkout easily.",
  },
  {
    icon: <FaMotorcycle size={40} className="text-primary" />,
    title: "Fast Delivery",
    description: "Our riders deliver your food quickly and safely.",
  },
  {
    icon: <FaSmile size={40} className="text-primary" />,
    title: "Enjoy Meal",
    description: "Savor your tasty meal right at your doorstep.",
  },
];

const HowItWorks = () => {
  return (
    <section className="px-4 py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <motion.h2
          className="text-center text-3xl md:text-4xl font-bold text-primary mb-6"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          How It Works
        </motion.h2>

        <motion.p
          className="text-center text-gray-600 max-w-3xl mx-auto mb-10 text-sm"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          The How It Works section visually guides you through the simple
          process of ordering from Sam’s Kitchen. It highlights four key
          steps—browsing delicious foods, placing an order, fast delivery by
          trusted riders, and enjoying the meal at home. This section uses
          engaging icons, smooth animations, and clear text to help visitors
          quickly understand how easy and reliable the service is.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl border-2 shadow-md border-gray-200 p-4 text-center hover:border-secondary hover:shadow-xl transition-shadow transform-border duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="mb-4 flex justify-center">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
