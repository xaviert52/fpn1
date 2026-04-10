import { useEmisionStore } from '@/stores/useEmisionStore';
import { motion } from 'framer-motion';
import Stepper from '@/components/Stepper';
import Step1PersonType from './emision/Step1PersonType';
import Step2Plans from './emision/Step2Plans';
import Step3Payment from './emision/Step3Payment';
import Step4Form from './emision/Step4Form';
import Step5Validation from './emision/Step5Validation';
import Step6OTP from './emision/Step6OTP';
import Step7Biometric from './emision/Step7Biometric';
import Step8Key from './emision/Step8Key';
import Step9Confirmation from './emision/Step9Confirmation';

const stepComponents: Record<number, React.ComponentType> = {
  1: Step1PersonType,
  2: Step2Plans,
  3: Step3Payment,
  4: Step4Form,
  5: Step5Validation,
  6: Step6OTP,
  7: Step7Biometric,
  8: Step8Key,
  9: Step9Confirmation,
};

export default function Emision() {
  const { currentStep } = useEmisionStore();
  const StepComponent = stepComponents[currentStep] || Step1PersonType;

  return (
    <div>
      <Stepper />
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <StepComponent />
      </motion.div>
    </div>
  );
}
