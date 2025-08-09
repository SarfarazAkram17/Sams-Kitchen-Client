import { motion } from "framer-motion";
import { FaLeaf, FaClock, FaShieldAlt, FaThumbsUp } from "react-icons/fa";

const reasons = [
  {
    icon: <FaLeaf size={36} className="text-green-500" />,
    title: "Fresh Ingredients",
    description:
      "We use only the freshest and highest quality ingredients in every dish.",
  },
  {
    icon: <FaClock size={36} className="text-yellow-500" />,
    title: "Fast Delivery",
    description:
      "Quick and reliable delivery ensures your food arrives hot and on time.",
  },
  {
    icon: <FaShieldAlt size={36} className="text-blue-500" />,
    title: "Safe & Hygienic",
    description: "Strict hygiene protocols to keep your food safe and healthy.",
  },
  {
    icon: <FaThumbsUp size={36} className="text-purple-500" />,
    title: "Trusted Quality",
    description:
      "Thousands of happy customers trust us for great taste and service.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="max-w-5xl mx-auto px-4">
      <motion.h2
        className="text-center text-3xl md:text-4xl font-bold text-primary mb-6"
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        Why Choose Us
      </motion.h2>

      <motion.p
        className="text-center text-gray-600 max-w-3xl mx-auto mb-10 text-sm"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        Sam’s Kitchen delivers fresh, high-quality meals straight to your door
        with fast, reliable, and hygienic service. We use only the best
        ingredients and have a trusted team of riders committed to ensuring your
        food arrives hot and on time. With thousands of happy customers, we
        provide a seamless ordering experience focused on great taste, safety,
        and customer satisfaction.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reasons.map((reason, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl border-2 border-gray-200 p-4 text-center hover:border-secondary shadow-md hover:shadow-xl transition-shadow transform-border duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="mb-4 flex justify-center">{reason.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{reason.title}</h3>
            <p className="text-gray-600">{reason.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
