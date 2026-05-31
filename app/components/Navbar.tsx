import React from 'react'

const Navbar = () => {
  return (
    <div 
      className='fixed z-1000 w-full pt-5 px-5 lg:px-10 font-mono'
      // style={{fontFamily: '"Inter", sans-serif'}}
    >
        <div className='flex justify-between items-center'>
            <div className='logo-font text-[8px] mix-blend-difference tracking-[2px] bg-white/10 backdrop-blur-[10px] px-3 py-2 rounded-full'>
              O <span className='text-[#C9A84C]'>N</span> Y X
            </div>

            <div className='lg:hidden gap-5 flex justify-between items-center mix-blend-difference bg-white/10 backdrop-blur-[10px] px-3 py-2 rounded-full'>
              <button className='text-[11px]'>
                <span className=''>+</span>
              </button>
              <div className='flex gap-1 text-[8px]'>
                <span className='text-[#C9A84C]'>01.</span>
                <span className='tracking-[2px] uppercase'>home</span>
              </div>
              <button className='text-[11px]'>
                +
              </button>
            </div>

            <div className='hidden lg:flex gap-5 bg-white/10 backdrop-blur-[10px] px-3 py-2 rounded-full'>
              {['home', 'collection', 'atelier', 'archive'].map((label, i) => (
                <div
                  key={i} 
                  className='flex gap-1 text-[8px]'
                >
                  <span className='text-[#C9A84C]'>0{i + 1}.</span>
                  <span className='tracking-[2px] uppercase'>{label}</span>
                </div>
              ))}
            </div>
        </div>
    </div>
  )
}

export default Navbar