import { useTransform, useScroll, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const Hero = () => {

    const [height, setHeight] = useState(180);
    const heroRef = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        let padding = 23;
        const calcHeight = () => {
            let offset = heroRef.current.getBoundingClientRect().top;
            let height = Math.round(window.innerHeight - offset - (padding * 2));
            setHeight(height);
        }

        calcHeight();

        window.addEventListener('resize', calcHeight);

        return () => {
          window.removeEventListener('resize', calcHeight)
        }
    })

    const { scrollYProgress } = useScroll();
    const heroPadding = useTransform(scrollYProgress, [0, 1], [20, 0]);
    const homeCopyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0], { clamp: false });
    const scale = useTransform(scrollYProgress, [0, 0.6], [50, 80], { clamp: false });
    const marginTop = useTransform(scrollYProgress, [0, 0.6], [0, 50], { clamp: false });

    return (
      <motion.div 
        style={{padding: heroPadding}}
      >
        <div
          ref={heroRef}
          className='h-screen mt-20 bg-white/10 backdrop-blur-[10px] rounded-lg p-5'
        >
          <div 
            className={`relative flex flex-col md:flex-row justify-between text-white/80`}
            style={{height: `${height}px`}}
          >

            <motion.div 
              className="absolute"
              style={{marginTop}}
            >
              <motion.h1 style={{fontSize: scale}} className='text-5xl tracking-wider'>ONYX</motion.h1>
            </motion.div>

            <div className='flex flex-row md:flex-col justify-between h-full'>
              <span></span>
              <motion.div 
                className='text-xs'
                style={{opacity: homeCopyOpacity}}
              >
                <h3><i>Forged in the void.</i></h3>
                <h3 className=""><i>Not made for daylight.</i></h3>
              </motion.div>
            </div>
            <motion.div
              className='md:w-80 h-full flex md:flex-col justify-between items-end'
              style={{opacity: homeCopyOpacity}}
            >
              <div className='w-[50%] md:w-full'>
                <p className='md:w-80 text-xs tracking-wider italic'>ONYX is a jewellery house built in shadow. Each piece is conceived at the edge of excess.</p>
                <p className='md:w-80 mt-5 text-xs text-[#c98a4c] tracking-wider italic'>This is jewellery that doesn't need an occasion.</p>
              </div>
              <span className='bg-white/20 p-1 px-3 rounded-full text-xs'>Scroll to explore</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
}

export default Hero