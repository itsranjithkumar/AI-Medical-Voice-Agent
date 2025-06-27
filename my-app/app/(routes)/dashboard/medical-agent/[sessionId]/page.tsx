"use client"

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { doctorAgent } from '../../_components/DoctorAgentCard';
import { AIDoctorAgents } from '../../../../Shared/list';
import Vapi from '@vapi-ai/web';

type sessionDetails={
  id:number,
  notes:string,
  sessionId:string,
  report:JSON,
  selectedDoctor:doctorAgent,
  createdOn:string

}

import { Circle, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';


const MedicalVoiceAgent = () => {
  const {sessionId} = useParams();
  const [sessionDetails,setSessionDetails]=useState<sessionDetails>();
  const [callStarted,setCallStarted]=useState(false);
  const [vapiInstance,setVapiInstance]=useState<any>();




  useEffect(()=>{
    sessionId&&GetSessionDetails();
  },[sessionId]);

  const GetSessionDetails=async()=>{
    const result=await axios.get(`/api/session-chat?sessionId=${sessionId}`);
    console.log(result.data);
    setSessionDetails(result.data);
  }

  const startCall = () => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setVapiInstance(vapi);

    vapi.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID!);

    vapi.on('call-start', () => {
      console.log('Call started');
      setCallStarted(true);
    });
    vapi.on('call-end', () => {
      console.log('Call ended');
      setCallStarted(false);
    });
    vapi.on('message', (message) => {
      if (message.type === 'transcript') {
        console.log(`${message.role}: ${message.transcript}`);
      }
    });
  }


  const endCall = () => {
    if (!vapiInstance) return;
    vapiInstance.stop();
    vapiInstance.off('call-start');
    vapiInstance.off('call-end');
    vapiInstance.off('message');
    setCallStarted(false);
    setVapiInstance(null);
  };

  // Debug: log sessionDetails to see what's coming from the API
  console.log('sessionDetails:', sessionDetails);

  // Find the doctor from the master list using the id from sessionDetails.selectedDoctor
  const selectedDoctorId = sessionDetails?.selectedDoctor?.id;
  const selectedDoctor = selectedDoctorId
    ? AIDoctorAgents.find((doc) => doc.id === selectedDoctorId)
    : undefined;

  return (
    <div className='flex flex-col items-center p-5 border rounded-3xl bg-secondary'>
      <div className='flex justify-between items-center w-full'>
        <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'><Circle className={`h-4 w-4 rounded-full ${callStarted?'bg-green-500':'bg-red-500'}`}/>{callStarted ? 'Connected' : 'Not Connected....'}</h2>
        <h2 className='font-bold text-xl text-gray-500'>00:00</h2>
      </div>

      {selectedDoctor && (
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
      )}
      <div className='flex flex-col items-center justify-center mt-10'>
        <h2 className='text-gray-500'>Assistant Msg</h2>
        <h2 className='text-lg'>User Msg</h2>
      </div>
      {!callStarted ? 
        <Button className='mt-20' onClick={startCall}> 
        <PhoneCall /> Start Call</Button>
        :<Button variant={'destructive'} onClick={endCall}> <PhoneOff/>Disconnect</Button>
}

    </div>
  )
}

export default MedicalVoiceAgent