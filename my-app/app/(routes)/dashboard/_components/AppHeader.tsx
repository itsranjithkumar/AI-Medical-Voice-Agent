import React from 'react'
import Image from 'next/image'
import { UserButton } from "@clerk/nextjs";

const menuOptions = [
    {
        id: 1,
        name: "Home",
        path: "/home"
    },
    {
        id: 2,
        name: "History",
        path: "/history"
    },
    {
        id: 3,
        name: "Pricing",
        path: "/pricing"
    },
    {
        id: 4,
        name: "Profile",
        path: "/profile"
    },
];

function AppHeader() {
  return (
    <div className='flex items-center justify-between p-4 shadow px-10 md:px-20 lg:px-40 xl:px-60'>
        <Image src={"/logo.svg"} alt="Logo" width={180} height={90} />

        <div className='hidden md:flex gap-12 items-center'>
            {menuOptions.map((option, index)=>(
                <div key={index}>
                    <h2 className='hover:font-bold cursor-pointer'>{option.name}</h2>
                    
                </div>
            ))}
            <UserButton />
        </div>
    </div>
  )
}

export default AppHeader