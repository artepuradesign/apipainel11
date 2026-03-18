
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Add click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsChatOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const phoneNumber = "5598981074836";
  
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!name || !email) {
        toast.error("Por favor, preencha seu nome e email.");
        return;
      }
      if (!isValidEmail(email)) {
        toast.error("Por favor, informe um email válido.");
        return;
      }
      setStep(2);
    } else {
      if (!message) {
        toast.error("Por favor, digite sua mensagem.");
        return;
      }
      
      // Format the WhatsApp message with all collected information
      const formattedMessage = `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(formattedMessage)}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      // Reset the form
      setName("");
      setEmail("");
      setMessage("");
      setStep(1);
      setIsChatOpen(false);
      
      toast.success("Mensagem enviada! Em breve entraremos em contato.");
    }
  };
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleButtonClick = () => {
    if (!isChatOpen) {
      // Se o chat não estiver aberto, enviar mensagem direta
      const defaultMessage = "Olá, pode me ajudar? Estou no site apipainel.com.br";
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Se já estiver aberto, apenas fechar
      setIsChatOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                ref={chatRef}
                className="bg-white rounded-lg shadow-xl mb-4 w-80 overflow-hidden"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
              >
                <div className="bg-green-500 p-4 text-white flex justify-between items-center">
                  <h3 className="font-medium">Chat APIPainel</h3>
                  <button 
                    onClick={() => setIsChatOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <form onSubmit={handleChatSubmit}>
                    {step === 1 ? (
                      <>
                        <div className="mb-4">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome
                          </label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu-email@exemplo.com"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <div className="mb-4">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Qual a sua dúvida?
                        </label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="h-32"
                          required
                        />
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      {step === 1 ? "Continuar" : "Enviar mensagem"}
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            onClick={handleButtonClick}
            className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Chat no WhatsApp"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="w-8 h-8 text-white"
            >
              <path
                fill="currentColor"
                d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
              />
            </svg>
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppButton;
