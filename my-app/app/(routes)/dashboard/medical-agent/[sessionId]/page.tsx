"use client"

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { doctorAgent } from '../../_components/DoctorAgentCard';
import { AIDoctorAgents } from '../../../../Shared/list';

type sessionDetails={
  id:number,
  notes:string,
  sessionId:string,
  report:JSON,
  selectedDoctor:doctorAgent,
  createdOn:string

}

import { Circle } from 'lucide-react';
import Image from 'next/image';


const MedicalVoiceAgent = () => {
  const {sessionId} = useParams();
  const [sessionDetails,setSessionDetails]=useState<sessionDetails>();


  useEffect(()=>{
    sessionId&&GetSessionDetails();
  },[sessionId]);

  const GetSessionDetails=async()=>{
    const result=await axios.get(`/api/session-chat?sessionId=${sessionId}`);
    console.log(result.data);
    setSessionDetails(result.data);
  }
  // Debug: log sessionDetails to see what's coming from the API
  console.log('sessionDetails:', sessionDetails);

  // Find the doctor from the master list using the id from sessionDetails.selectedDoctor
  const selectedDoctorId = sessionDetails?.selectedDoctor?.id;
  const selectedDoctor = selectedDoctorId
    ? AIDoctorAgents.find((doc) => doc.id === selectedDoctorId)
    : undefined;

  return (
    <div>
      <div className='flex justify-between items-center'>
        <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'><Circle className='h-4 w-4'/> Not Connected</h2>
        <h2 className='font-bold text-xl text-gray-500'>00:00</h2>
      </div>

      {selectedDoctor ? (
        <div className='flex items-center flex-col mt-10'>
          <Image
            src={selectedDoctor.image}
            alt={selectedDoctor.specialist}
            width={120}
            height={120}
            className='w-[100px] h-[100px] object-cover rounded-full '
          />
          <h2 className='font-bold text-lg mt-2'>{selectedDoctor.specialist}</h2>
          <p className='text-sm text-gray-500'>AI Medical Voice Agent</p>
        </div>
      ) : (
        <div className='flex items-center flex-col mt-10 text-red-500'>
          <p>Doctor details not available.</p>
        </div>
      )}
    </div>
  )
}

export default MedicalVoiceAgent