import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { FaLeaf, FaClock, FaShieldAlt, FaThumbsUp } from "react-icons/fa";

const reasons = [
  {
    icon: <FaLeaf size={36} className="text-success" />,
    title: "Fresh Ingredients",
    description:
      "We use only the freshest and highest quality ingredients in every dish.",
  },
  {
    icon: <FaClock size={36} className="text-secondary" />,
    title: "Fast Delivery",
    description:
      "Quick and reliable delivery ensures your food arrives hot and on time.",
  },
  {
    icon: <FaShieldAlt size={36} className="text-info" />,
    title: "Safe & Hygienic",
    description: "Strict hygiene protocols to keep your food safe and healthy.",
  },
  {
    icon: <FaThumbsUp size={36} className="text-primary" />,
    title: "Trusted Quality",
    description:
      "Thousands of happy customers trust us for great taste and service.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="px-4 py-12 bg-base-200/70">
      <div className="max-w-7xl mx-auto">
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
          className="text-center text-base-content/70 max-w-3xl mx-auto mb-10 text-sm leading-6"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Sam’s Kitchen delivers fresh, high-quality meals straight to your door
          with fast, reliable, and hygienic service. We use only the best
          ingredients and have a trusted team of riders committed to ensuring
          your food arrives hot and on time. With thousands of happy customers,
          we provide a seamless ordering experience focused on great taste,
          safety, and customer satisfaction.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              className="bg-base-100 rounded-2xl border border-base-300 p-5 text-center hover:border-secondary shadow-sm hover:shadow-xl transition-shadow transform-border duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="mb-4 flex justify-center">{reason.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{reason.title}</h3>
              <p className="text-base-content/70 leading-6">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
