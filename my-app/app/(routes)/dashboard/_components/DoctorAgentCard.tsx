import React from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export type doctorAgent = {
    id: number;
    specialist: string;
    description: string;
    image: string;
    agentPrompt: string;
    voiceId?:string
}
type props = {
    doctorAgent:doctorAgent
}


const DoctorAgentCard = ({doctorAgent}: props) => {
  return (
    <div className = '' >
        <Image src={doctorAgent.image}
         alt={doctorAgent.specialist} 
         width={200}
         height={300}
         className='w-full h-[250px] object-cover rounded-xl'
         />
         <h2 className='mt -1 font-bold '>{doctorAgent.specialist}</h2>
         <p className='text-sm text-gray-500'>{doctorAgent.description}</p>
         <Button className='w-full mt-2'>Consult Now <ArrowRight/></Button>
    </div>
  )
}

export default DoctorAgentCard