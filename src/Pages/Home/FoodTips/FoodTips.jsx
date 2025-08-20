import React from "react";
import { motion } from "framer-motion";
import { FaSnowflake, FaFire, FaLeaf, FaClock } from "react-icons/fa";

const foodTips = [
  {
    icon: <FaSnowflake className="text-3xl text-blue-500" />,
    title: "Proper Storage",
    description:
      "Store meals in airtight containers and refrigerate within 2 hours to maintain freshness and prevent spoilage.",
  },
  {
    icon: <FaFire className="text-3xl text-red-500" />,
    title: "Reheat Safely",
    description:
      "Reheat your food evenly to at least 165°F (74°C) to ensure safety and preserve taste.",
  },
  {
    icon: <FaLeaf className="text-4xl text-green-500" />,
    title: "Use Fresh Ingredients",
    description:
      "We prepare all meals using fresh, high-quality ingredients for the best flavor and nutrition.",
  },
  {
    icon: <FaClock className="text-3xl text-yellow-500" />,
    title: "Consume Timely",
    description:
      "Enjoy your cooked foods within 3-4 days for optimal taste and safety.",
  },
];

const FoodTips = () => {
  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-center text-3xl md:text-4xl font-bold text-primary mb-6"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          Food Tips for your Meals
        </motion.h2>

        <motion.p
          className="text-center text-sm max-w-3xl mx-auto text-gray-600 mb-10"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Keep your meals fresh and tasty with our expert tips on proper
          storage, safe reheating, and timely consumption. These simple
          guidelines help you enjoy delicious and safe food every time.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {foodTips.map((tip, index) => (
            <motion.div
              key={index}
              className="rounded-xl border-2 border-gray-200 hover:border-secondary shadow-md hover:shadow-xl transition-shadow transform-border transition-border duration-300 p-6 bg-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                {tip.icon}
                <h3 className="font-semibold text-primary text-lg">
                  {tip.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {tip.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FoodTips;
