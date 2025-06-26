import React from 'react'
import { doctorAgent } from './DoctorAgentCard'
import Image from 'next/image'

type props = {
    doctorAgent:doctorAgent
    setSelecttedDoctor:any
    selectedDoctor:doctorAgent
}

const SuggestedDoctorCard = ({doctorAgent,setSelecttedDoctor,selectedDoctor}: props) => {
  return (
    <div className = {`flex flex-col items-center border rounded-2xl shadow p-5 hover:border-blue-500 cursor-pointer ${selectedDoctor.id === doctorAgent.id ? 'border-blue-500' : ''}`}onClick={() => setSelecttedDoctor(doctorAgent)} >
        <Image src={doctorAgent.image}
         alt={doctorAgent.specialist} 
         width={70}
         height={70}
         className='w-[50px] h-[50px] object-cover rounded-4xl '
         />
         <h2 className='font-bold mt-2 text-sm text-center'>{doctorAgent.specialist}</h2>
         <p className='text-xs text-gray-500 text-center line-clamp-2'>{doctorAgent.description}</p>
    </div>
  )
}

export default SuggestedDoctorCard