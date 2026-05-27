import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

const Hero = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-50 dark:bg-secondary-dark section-padding">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-primary uppercase bg-primary/10 rounded-full"
            >
              🚀 Thế hệ công nghệ mới 2024
            </motion.span>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-7xl font-black text-secondary dark:text-white leading-[1.1] mb-6"
            >
              Nâng Tầm Trải Nghiệm <br />
              <span className="gradient-text italic">Digital Lifestyle</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Khám phá bộ sưu tập thiết bị công nghệ đỉnh cao từ Apple, ASUS ROG và MSI. 
              Hiệu năng mạnh mẽ, thiết kế tinh tế, bảo hành chính hãng lên đến 2 năm.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button 
                aria-label="Shop now"
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                Sắm Ngay <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                aria-label="View promotions"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-secondary dark:text-white rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                Xem Khuyến Mãi
              </button>
            </motion.div>

            {/* Quick Stats/Trust Badges */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800"
            >
              {[
                { icon: ShieldCheck, text: "Chính hãng" },
                { icon: Truck, text: "Giao nhanh" },
                { icon: RotateCcw, text: "30 ngày đổi" },
                { icon: Headphones, text: "Hỗ trợ 24/7" },
              ].map((badge, index) => (
                <div key={index} className="flex flex-col items-center lg:items-start gap-2">
                  <badge.icon className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image/Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative order-1 lg:order-2 flex justify-center"
          >
            <motion.div 
              variants={floatingVariants}
              animate="animate"
              className="relative z-10 w-full max-w-[500px]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-super blur-2xl" />
              <img 
                src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=1200" 
                alt="Product Hero" 
                className="relative z-10 rounded-modern shadow-2xl border-4 border-white dark:border-slate-800 object-cover aspect-square sm:aspect-video lg:aspect-square"
              />
              
              {/* Floating Cards (Glass Effect) */}
              <div className="absolute -bottom-6 -left-6 sm:-left-12 z-20 glass-effect p-4 rounded-2xl shadow-xl hidden sm:block animate-bounce-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tin cậy</p>
                    <p className="text-sm font-black text-secondary">Chính hãng 100%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
