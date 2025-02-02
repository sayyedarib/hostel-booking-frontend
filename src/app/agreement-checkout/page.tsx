"use client";

import { useState } from "react";

import Header from "@/components/header";
import Step2 from "@/components/agreement-checkout/step2";
import Step3 from "@/components/agreement-checkout/step3";
import Step4 from "@/components/agreement-checkout/step4";

export default function AgreementCheckoutPage() {
  const [currentStep, setCurrentStep] = useState(2);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <>
      <Header className="fixed top-0 left-0 right-0 z-50" />
      <div className="flex flex-col items-center justify-center h-screen w-full lg:w-1/2 mx-auto px-3">
        {currentStep === 2 && (
          <Step2 handleNext={handleNext} handlePrev={handlePrev} />
        )}
        {currentStep === 3 && (
          <Step3 handlePrev={handlePrev} handleNext={handleNext} />
        )}
        {currentStep === 4 && <Step4 handlePrev={handlePrev} />}
      </div>
    </>
  );
}
