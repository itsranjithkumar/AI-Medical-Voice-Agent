"use client";

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs';
import { UserDetailContext } from '@/context/UserDetailContext';

 export type UserDetail = {
    name: string;
    email: string;
    credit: number;
}


function provider({children}: 
    Readonly<{children: React.ReactNode}>) {

        const { user } = useUser();
        const [userDetail, setUserDetail] = useState<any>();

        useEffect(() => {
            createNewUser();
        }, []);

        const createNewUser = async () => {
            const result = await axios.post("/api/users");
            console.log(result.data);  
            setUserDetail(result.data);          
        }
  return (
    <div>
        <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
            {children}
        </UserDetailContext.Provider>
    </div>
  )
}

export default provider