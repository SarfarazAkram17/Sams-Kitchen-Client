import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { MdArrowDropDown } from "react-icons/md";

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const faqs = [
    {
      question: "How do I place an order at Sam's Kitchen?",
      answer:
        "Log in, browse our foods, select your favorite dishes, and proceed to checkout. Once confirmed, you'll receive an order placed notification.",
    },
    {
      question: "Do I need an account to order?",
      answer:
        "Yes, you need an account to order. Creating an account helps us track your orders, provide faster checkout, and send you real-time order updates.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Go to the 'My Orders' section in your dashboard. You can see live updates such as 'Pending', 'Picked Up', and 'Delivered' etc.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept credit/debit cards, mobile payments. For online payments, we use secure gateways like Stripe and SSL Commerz.",
    },
    {
      question: "Can I cancel my order?",
      answer:
        "Yes, you can cancel your order from 'My Orders' if it’s not paid. Once paid it cannot be cancelled.",
    },
    {
      question: "Do you offer special discounts?",
      answer: "Yes! We regularly post discounts on the foods.",
    },
    {
      question: "How do I leave a review for a food?",
      answer:
        "You can go to that foods details page and their is a add review section from where you can add review for that food.",
    },
    {
      question: "What happens if my order is delayed?",
      answer:
        "We’ll notify you immediately via in-app notifications and email if there is any delay. You can track your order in real-time.",
    },
  ];
  const visibleFaqs = showAll ? faqs : faqs.slice(0, 5);

  return (
    <div className="max-w-[1500px] mx-auto">
      <motion.h1
        className="mb-10 text-center text-primary text-3xl md:text-4xl font-bold"
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        Frequently Asked Questions
      </motion.h1>

      <div className="space-y-4 px-4">
        {visibleFaqs.map((faq, index) => {
          const isActive = activeIndex === index;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setActiveIndex(isActive ? -1 : index)}
              className={`cursor-pointer rounded-xl border-2 p-4 shadow-sm ${
                isActive
                  ? "bg-[#f8f6f5] border-secondary shadow-md"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm md:text-base font-bold text-[#03373D]">
                  {faq.question}
                </h3>
                <motion.span
                  className="text-primary"
                  animate={{ rotate: isActive ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MdArrowDropDown size={25} />
                </motion.span>
              </div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 text-[#606060] text-sm leading-relaxed"
                >
                  <hr className="mb-3 border-t-2 border-[#d7bfb3]" />
                  {faq.answer}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => setShowAll(!showAll)}
          className="btn btn-secondary text-white rounded-lg"
        >
          {showAll ? (
            <span className="flex gap-2 items-center">
              Show Less <FaArrowUp size={15} />
            </span>
          ) : (
            <span className="flex gap-2 items-center">
              Show All <FaArrowDown size={15} />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Faq;
