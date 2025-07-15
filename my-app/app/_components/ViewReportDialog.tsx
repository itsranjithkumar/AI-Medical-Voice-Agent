import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { sessionDetail } from "@/app/types/session";
import moment from 'moment';

type Props={
    record:sessionDetail
}
const ViewReportDialog = ({record}:Props) => {
  return (
<Dialog>
  <DialogTrigger>
  <Button variant={'link'} size={'sm'}>View Report</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle asChild>
        <h2 className='text-center text-4xl'>Medical AI Voice Agent Report</h2>
      </DialogTitle>
      <DialogDescription asChild>
  <div>
    <h2 className='mt-10 font-bold text-blue-500 text-lg'>Video Info</h2>
    {/* <p>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</p> */}

    <div className ='grid grid-cols-2'></div>
   
        <h2><span className='font-bold'>Doctor Specialization:</span> {record.selectedDoctor?.specialist}</h2>
        <h2><span className='font-bold'>Consultation Date:</span> { moment(new Date(record.createdOn)).fromNow()}</h2>

        <h2><span className='font-bold'>Description:</span> {record.notes}</h2>

  </div>
</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>  )
}

export default ViewReportDialog