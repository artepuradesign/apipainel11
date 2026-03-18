 import React, { useState, useEffect } from 'react';
 import { ArrowUp } from 'lucide-react';
 import { Button } from './button';
 
 const ScrollToTop = () => {
   const [isVisible, setIsVisible] = useState(false);
 
   useEffect(() => {
     const toggleVisibility = () => {
       if (window.scrollY > 300) {
         setIsVisible(true);
       } else {
         setIsVisible(false);
       }
     };
 
     window.addEventListener('scroll', toggleVisibility);
     return () => window.removeEventListener('scroll', toggleVisibility);
   }, []);
 
   const scrollToTop = () => {
     window.scrollTo({
       top: 0,
       behavior: 'smooth'
     });
   };
 
   return (
     <>
       {isVisible && (
         <Button
           onClick={scrollToTop}
           size="icon"
           className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full bg-primary/60 hover:bg-primary shadow-lg transition-all duration-300 hover:scale-110 animate-fade-in"
           aria-label="Voltar ao topo"
         >
           <ArrowUp className="h-5 w-5" />
         </Button>
       )}
     </>
   );
 };
 
 export default ScrollToTop;