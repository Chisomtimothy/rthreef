import React, { useEffect, useRef, useState } from "react";

const Hero = () => {

    const [height, setHeight] = useState(180);
    const heroRef = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        let padding = 20;
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

    return (
      <div
        ref={heroRef}
        className='h-screen mt-25 bg-white/10 backdrop-blur-[10px] rounded-lg p-5'
      >
        <div 
          className={`flex flex-col md:flex-row justify-between text-white/80`}
          style={{height: `${height}px`}}
        >
          <div className='flex flex-row md:flex-col justify-between h-full'>
            <h1 className='text-5xl tracking-wider'>ONYX</h1>
            <div className='text-xs'>
              <h3><i>Forged in the void.</i></h3>
              <h3><i>Not made for daylight.</i></h3>
            </div>
          </div>
          <div className='md:w-80 h-full flex md:flex-col justify-between items-end'>
            <p className='w-[50%] md:w-80 text-xs tracking-wider italic'>ONYX is a jewellery house built in shadow. Each piece is conceived at the edge of excess.</p>
            <span className='bg-white/20 p-1 px-3 rounded-full text-xs'>Scroll to explore...</span>
          </div>
        </div>
      </div>
    )
}

export default Hero