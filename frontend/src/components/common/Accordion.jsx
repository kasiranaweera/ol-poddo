import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Accordion = ({ items = [] }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="w-full">
      {items.map((item, index) => (
        <div key={index} className="border-b border-border rounded-lg overflow-hidden bg-card">
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted transition-colors focus:outline-none"
          >
            <h3 className="text-lg font-semibold text-left">{item.title}</h3>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <p className="text-muted-foreground leading-relaxed">{item.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
