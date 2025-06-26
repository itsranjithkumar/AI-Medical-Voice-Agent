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
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
const AddNewSession = () => {
    const [note,setNote]=useState <string>('');
    const router=useRouter();
  return (
    <Dialog>
    <DialogTrigger>
    <Button className='mt-5'>Start a Consultation</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Basic Details</DialogTitle>
        <DialogDescription asChild>
          <div>
             <h2>Add Symptoms or Any Other Details</h2>
             <Textarea placeholder='Add Details here...' className='h-[200px] mt-1'
             onChange={(e)=>setNote(e.target.value)}/>
          </div>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose>
        <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button disabled={!note}>Next <ArrowRight/></Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>



  )
}

export default AddNewSession