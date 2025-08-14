import { useState } from 'react';

export const useFormHandlers = () => {
  const [showRefillForm, setShowRefillForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  const handleRefillClick = () => setShowRefillForm(true);
  const handleAppointmentClick = () => setShowAppointmentForm(true);
  const handleTransferClick = () => setShowTransferForm(true);

  const closeRefillForm = () => setShowRefillForm(false);
  const closeAppointmentForm = () => setShowAppointmentForm(false);
  const closeTransferForm = () => setShowTransferForm(false);

  return {
    // Form states
    showRefillForm,
    showAppointmentForm,
    showTransferForm,
    
    // Form handlers
    handleRefillClick,
    handleAppointmentClick,
    handleTransferClick,
    
    // Close handlers
    closeRefillForm,
    closeAppointmentForm,
    closeTransferForm,
    
    // For Header component
    onRefillClick: handleRefillClick,
    onAppointmentClick: handleAppointmentClick,
    onTransferClick: handleTransferClick,
  };
};








