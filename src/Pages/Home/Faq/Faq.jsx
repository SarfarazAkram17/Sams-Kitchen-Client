import { useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { FiMinus, FiPlus } from "react-icons/fi";
import Reveal from "../../../Components/Shared/Reveal";
import SectionHeading from "../../../Components/Shared/SectionHeading";

const faqs = [
  {
    question: "How do I place an order at Sam's Kitchen?",
    answer: "Log in, browse our foods, select your favorite dishes, and proceed to checkout. Once confirmed, you'll receive an order placed notification.",
  },
  {
    question: "Do I need an account to order?",
    answer: "Yes, you need an account to order. Creating an account helps us track your orders, provide faster checkout, and send you real-time order updates.",
  },
  {
    question: "How can I track my order?",
    answer: "Go to the 'My Orders' section in your dashboard. You can see live updates such as 'Pending', 'Picked Up', and 'Delivered' etc.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept credit/debit cards, mobile payments. For online payments, we use secure gateways like Stripe and SSL Commerz.",
  },
  {
    question: "Can I cancel my order?",
    answer: "Yes, you can cancel your order from 'My Orders' if it’s not paid. Once paid it cannot be cancelled.",
  },
  {
    question: "Do you offer special discounts?",
    answer: "Yes! We regularly post discounts on the foods.",
  },
  {
    question: "How do I leave a review for a food?",
    answer: "Open that food’s details page and use the add review section to share your review.",
  },
  {
    question: "What happens if my order is delayed?",
    answer: "We’ll notify you immediately via in-app notifications and email if there is any delay. You can track your order in real-time.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const visibleFaqs = showAll ? faqs : faqs.slice(0, 5);

  return (
    <section className="band-warm border-t border-base-300 px-4 py-16 sm:py-24" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <SectionHeading
            id="faq-title"
            eyebrow="Good to know"
            title="Questions, answered"
            description="Everything you need to know about ordering, paying and delivery."
          />
          <Reveal className="-mt-4 rounded-3xl border border-base-300 bg-base-100 p-6 sm:-mt-6">
            <p className="font-bold text-base-content">Still hungry for answers?</p>
            <p className="mt-1 text-sm leading-6 text-base-content/70">
              Learn more about who we are and how our kitchen works.
            </p>
            <Link to="/about" className="btn btn-primary btn-sm mt-4 px-5">About Sam’s Kitchen</Link>
          </Reveal>
        </div>

        <div className="space-y-3">
          {visibleFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={faq.question} delay={index * 0.05}>
                <div className={`rounded-2xl border bg-base-100 transition-colors ${isOpen ? "border-primary/50" : "border-base-300"}`}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-button-${index}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${index}`}
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left"
                    >
                      <span className="text-sm font-bold text-base-content sm:text-base">{faq.question}</span>
                      <span className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors ${isOpen ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}`}>
                        {isOpen ? <FiMinus aria-hidden="true" /> : <FiPlus aria-hidden="true" />}
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${index}`}
                        role="region"
                        aria-labelledby={`faq-button-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-7 text-base-content/70">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}

          <div className="pt-4 text-center lg:text-left">
            <button type="button" onClick={() => setShowAll((value) => !value)} className="btn rounded-full border-base-300 bg-base-100 px-6 text-base-content hover:border-primary hover:text-primary">
              {showAll ? "Show fewer questions" : `Show all ${faqs.length} questions`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
