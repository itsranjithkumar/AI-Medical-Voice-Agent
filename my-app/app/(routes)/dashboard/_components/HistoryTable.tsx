import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  //@ts-ignore
import { SessionDetails } from "../medical-agent/[sessionId]/page"
import { Button } from '@/components/ui/button'
import moment from 'moment';
  type Props={
    historyList: SessionDetails[]
  }

const HistoryTable = ({historyList}:Props) => {
  return (
    <div>
        <Table>
  <TableCaption>Previous Consultations Reports.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[200px]">AI Medical Specialist</TableHead>
      <TableHead className="w-[200px]">Description</TableHead>
      <TableHead className="w-[200px]">Date</TableHead>
      <TableHead className="text-right">Action</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {historyList.map((record:SessionDetails,index:number)=>(
            <TableRow key={index}>
            <TableCell className="font-medium">{record.selectedDoctor?.specialist}</TableCell>
            <TableCell>{record.notes}</TableCell>
            <TableCell>{moment(new Date(record.createdOn)).fromNow()}</TableCell>
            <TableCell className="text-right"><Button variant={'link'} size={'sm'}>View Report</Button></TableCell>
          </TableRow>
    ))}


  </TableBody>
</Table>
    </div>
  )
}

export default HistoryTable