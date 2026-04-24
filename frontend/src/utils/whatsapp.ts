import { format } from 'date-fns';

export const sendWhatsAppMessage = (phone: string, name: string, template: string = 'default') => {
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  let message = '';
  
  switch (template) {
    case 'intro':
      message = `Hi ${name}, this is Deepika Builtech Engineering. We received your inquiry regarding a PEB structure. Would you like to schedule a site visit?`;
      break;
    case 'quote':
      message = `Hi ${name}, I have sent the quotation for your project. Please let me know if you have any questions. Regards, Deepika Builtech.`;
      break;
    case 'followup':
      message = `Hi ${name}, following up on our previous conversation. Any updates on the project?`;
      break;
    default:
      message = `Hi ${name}, this is Deepika Builtech Engineering. How can we help you today?`;
  }

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
};
