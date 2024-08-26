"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import { getUserOnboadingStatus } from "@/db/queries";
import { logger } from "@/lib/utils";

export default function AgreementCheckout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [fetching, setFetching] = useState(true);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  useEffect(() => {
    async function fetchData() {
      const { data } = await getUserOnboadingStatus();
      if (!data) {
        logger("error", "Failed to fetch onboarding status");
        return;
      }
      if (data.onboarded) setCurrentStep(2);
      setFetching(false);
    }

    fetchData();
  }, []);

  return (
    <>
      {fetching ? (
        <div className="min-h-[80vh] min-w-screen flex justify-center items-center">
          <Image
            src="/Loading.gif"
            width={100}
            height={100}
            alt="loading"
            unoptimized={true}
          />
        </div>
      ) : (
        <div className="w-full md:2/3 lg:w-1/2 max-h-full">
          {currentStep === 1 && <Step1 handleNext={handleNext} />}
          {currentStep === 2 && (
            <Step2 handleNext={handleNext} handlePrev={handlePrev} />
          )}
          {currentStep === 3 && (
            <Step3 handlePrev={handlePrev} handleNext={handleNext} />
          )}
          {currentStep === 4 && <Step4 handlePrev={handlePrev} />}
        </div>
      )}
    </>
  );
}
