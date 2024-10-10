'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

interface ResponseButtonsProps {
  uploadQuery: (correct: boolean, index: number) => Promise<boolean>;
  index: number;
  feedbackStatus: { [key: number]: string | null } | undefined;
  setFeedbackStatus: React.Dispatch<React.SetStateAction<{ [key: number]: string | null } | undefined>>;
}

const ResponseButtons: React.FC<ResponseButtonsProps> = ({ uploadQuery, index, feedbackStatus, setFeedbackStatus }) => {
  const responseStatus = feedbackStatus?.[index] ?? null;
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async (isApproved: boolean) => {
    setIsLoading(true);
    const newStatus = isApproved ? 'approved' : 'disapproved';
    const success = await uploadQuery(isApproved, index);
    if (success) {
      setFeedbackStatus((prev) => ({ ...prev, [index]: newStatus }));
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col w-full space-y-2">
      <AnimatePresence>
        {responseStatus && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`text-sm ${responseStatus === 'approved' ? 'text-green-500' : 'text-red-500'}`}
          >
          </motion.span>
        )}
      </AnimatePresence>
      <div className="flex flex-wrap gap-2 justify-end"> {/* Buttons aligned to the right */}
        <Button
          onClick={() => handleResponse(true)}
          className={`rounded-full ${
            responseStatus === 'approved'
              ? 'bg-green-500 text-white'
              : 'text-black bg-white hover:bg-gray-100'
          }`}
          disabled={isLoading || responseStatus !== null}
        >
          {isLoading ? 'Saving...' : responseStatus === 'approved' ? 'Approved' : 'Approve'}
        </Button>
        <Button
          onClick={() => handleResponse(false)}
          className={`rounded-full ${
            responseStatus === 'disapproved'
              ? 'bg-red-500 text-white'
              : 'text-black bg-white hover:bg-gray-100'
          }`}
          disabled={isLoading || responseStatus !== null}
        >
          {isLoading ? 'Saving...' : responseStatus === 'disapproved' ? 'Disapproved' : 'Disapprove'}
        </Button>
      </div>
    </div>
  );
};

export default ResponseButtons;