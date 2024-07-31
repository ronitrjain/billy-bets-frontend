'use client';
import React, {useState} from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

interface ResponseButtonsProps {
  uploadQuery: (correct: boolean, index: number) => Promise<boolean>;
  index: number;
  feedbackStatus: {[key: number]: string | null};
  setFeedbackStatus: React.Dispatch<React.SetStateAction<{[key: number]: string | null}>>;
}

const ResponseButtons: React.FC<ResponseButtonsProps> = ({ uploadQuery, index, feedbackStatus, setFeedbackStatus }) => {
  const responseStatus = feedbackStatus[index] || null;
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async (isApproved: boolean) => {
    setIsLoading(true);
    const newStatus = isApproved ? 'approved' : 'disapproved';
    const success = await uploadQuery(isApproved, index);
    if (success) {
      setFeedbackStatus(prev => ({...prev, [index]: newStatus}));
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center">
      <AnimatePresence>
        {responseStatus && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`mr-2 ${responseStatus === 'approved' ? 'text-green-500' : 'text-red-500'}`}
          >
            {responseStatus === 'approved'
              ? 'Response saved successfully'
              : 'Response saved as disapproved'}
          </motion.span>
        )}
      </AnimatePresence>
      
      <Button
        onClick={() => handleResponse(true)}
        className={`mr-2 ${responseStatus === 'approved' ? 'bg-green-500 text-white' : 'text-black bg-white hover:bg-gray-100'}`}
        disabled={isLoading || responseStatus !== null}
      >
        {isLoading ? 'Saving...' : (responseStatus === 'approved' ? 'Approved' : 'Approve')}
      </Button>
      <Button
        onClick={() => handleResponse(false)}
        className={`mr-2 ${responseStatus === 'disapproved' ? 'bg-red-500 text-white' : 'text-red-500 bg-white hover:bg-gray-100'}`}
        disabled={isLoading || responseStatus !== null}
      >
        {isLoading ? 'Saving...' : (responseStatus === 'disapproved' ? 'Disapproved' : 'Disapprove')}
      </Button>
    </div>
  );
};

export default ResponseButtons;