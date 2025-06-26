"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { DialogClose } from '@radix-ui/react-dialog';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DoctorAgentCard, { doctorAgent } from './DoctorAgentCard';
import SuggestedDoctorCard from './SuggestedDoctorCard';
const AddNewSession = () => {
    const [note,setNote]=useState <string>('');
    const [loading,setLoading]=useState(false);
    const [suggestedDoctors,setSuggestedDoctors]=useState <doctorAgent[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent | null>(null);
    const OnClickNext = async () => {
        setLoading(true);
        const result = await axios.post('/api/suggest-doctors', {
            notes: note
        });

        console.log(result.data);
        // Ensure suggestedDoctors is always an array
        setSuggestedDoctors(Array.isArray(result.data) ? result.data : []);
        setLoading(false);
    }

    const onStartConsultation = async() => {
        setLoading(true);
       // save All info to database
       const result=await axios.post('/api/session-chat', {
            notes: note,
            selectedDoctors: selectedDoctor
        });
        console.log(result.data);
        if(result.data?.sessionId)
        {
            console.log(result.data.sessionId);
            // Route new Conversation Screen 
        }
        setLoading(false);
        
    }




  return (
    <Dialog onOpenChange={(open) => {
      if (open) {
        setSuggestedDoctors([]);
        setSelectedDoctor(null);
        setNote('');
      }
    }}>
    <DialogTrigger>
    <Button className='mt-5'>Start a Consultation</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Basic Details</DialogTitle>
        <DialogDescription asChild>
          {suggestedDoctors.length === 0 ? (
            <div>
              <h2>Add Symptoms or Any Other Details</h2>
              <Textarea placeholder='Add Details here...' className='h-[200px] mt-1'
                onChange={(e)=>setNote(e.target.value)} />
            </div>
          ) : (
            <div>
                <h2>Select the Doctor</h2>
                <div className='grid grid-cols-3 gap-5'>
              {/* suggested Doctors */}
              {Array.isArray(suggestedDoctors) && suggestedDoctors.map((doctor, index) => (
                <SuggestedDoctorCard key={index} doctorAgent={doctor}
                setSelecttedDoctor={() =>setSelectedDoctor(doctor)} 
                //@ts-ignore
                selectedDoctor={selectedDoctor}/>
              ))}
            </div></div> 
          )}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose>
        <Button variant="outline">Cancel</Button>
        </DialogClose>
       {suggestedDoctors.length === 0 ? (
          <Button disabled={!note||loading} onClick={OnClickNext}>
            Next {loading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
          </Button>
        ) : (
          <Button disabled={loading || !selectedDoctor} onClick={()=>onStartConsultation()}>Start Consultation {loading ? <Loader2 className='animate-spin' /> : <ArrowRight />}</Button>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>



  )
}

export default AddNewSession