"use client"

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { doctorAgent } from '../../_components/DoctorAgentCard';
import { AIDoctorAgents } from '../../../../Shared/list';
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner';

interface SessionDetails {
  id: number;
  notes: string;
  sessionId: string;
  report: any;
  selectedDoctor: doctorAgent;
  createdOn: string;
  conversation: any | null;
  selectedDoctors?: any;
  createdBy?: string;
}

interface Message {
  role: string;
  content: string;
}

type VapiInstance = Vapi;

import { Circle, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const MedicalVoiceAgent = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [sessionDetails, setSessionDetails] = useState<SessionDetails>();
  const [callStarted, setCallStarted] = useState<boolean>(false);
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);
  const [currentRoll, setCurrentRoll] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) return;
      
      try {
        console.log('Fetching session details for sessionId:', sessionId);
        
        // Create a default session with the first doctor as fallback
        const defaultSession: SessionDetails = {
          id: parseInt(sessionId),
          sessionId: sessionId,
          notes: 'New consultation',
          selectedDoctor: AIDoctorAgents[0], // Default to first doctor
          createdOn: new Date().toISOString(),
          report: null, // Add the missing report field
          conversation: null // Add the missing conversation field
        };
        
        try {
          const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
          console.log('API Response:', result.data);
          
          if (result.data?.error?.code === 404) {
            // If 404, use default session
            console.log('Using default session data');
            setSessionDetails(defaultSession);
            return;
          }
          
          if (!result.data) {
            throw new Error('No data returned from API');
          }
          
          // If selectedDoctor is an error object, use default
          if (result.data.selectedDoctor?.error) {
            console.warn('Error in selectedDoctor, using default');
            result.data.selectedDoctor = defaultSession.selectedDoctor;
          }
          
          // Ensure we have a valid doctor
          if (!result.data.selectedDoctor) {
            result.data.selectedDoctor = defaultSession.selectedDoctor;
          }
          
          // Find the doctor in AIDoctorAgents to ensure we have all required fields
          const doctorFromList = AIDoctorAgents.find(doc => 
            doc.id === result.data.selectedDoctor?.id || 
            doc.specialist === result.data.selectedDoctor?.specialist
          ) || defaultSession.selectedDoctor;
          
          // Merge the doctor data
          result.data.selectedDoctor = {
            ...doctorFromList,
            ...result.data.selectedDoctor
          };
          
          console.log('Setting session details with:', result.data);
          setSessionDetails(result.data);
          
        } catch (apiError: any) {
          console.warn('Error fetching session, using default:', apiError);
          setSessionDetails(defaultSession);
        }
        
      } catch (error: any) {
        console.error('Unexpected error:', error);
        toast.error('Failed to initialize session. Please refresh the page.');
      }
    };
    
    fetchSessionDetails();
  }, [sessionId]);

  const startCall = useCallback(async () => {
    if (!sessionDetails) {
      toast.error('Session details not loaded');
      return;
    }

    console.log('Session details:', JSON.stringify(sessionDetails, null, 2));
    
    if (!sessionDetails.selectedDoctor) {
      toast.error('No doctor selected');
      return;
    }
    
    const { selectedDoctor } = sessionDetails;
    console.log('Selected doctor:', selectedDoctor);
    
    if (!selectedDoctor.assistantId) {
      const doctorFromList = AIDoctorAgents.find(doc => 
        doc.id === selectedDoctor.id || 
        doc.specialist === selectedDoctor.specialist
      );
      
      if (doctorFromList?.assistantId) {
        console.log('Using assistantId from AIDoctorAgents:', doctorFromList.assistantId);
        selectedDoctor.assistantId = doctorFromList.assistantId;
      } else {
        toast.error('Could not find assistant configuration for the selected doctor');
        console.error('No assistantId found for doctor:', selectedDoctor);
        return;
      }
    }

    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
      if (!apiKey) {
        throw new Error('VAPI API key is missing. Please check your environment variables.');
      }
      
      console.log('Initializing VAPI with key:', apiKey ? '***' + apiKey.slice(-4) : 'not found');
      
      // Initialize VAPI client
      const vapi = new Vapi(apiKey);
      
      // Set up event listeners
      vapi.on('call-start', () => {
        console.log('Call started');
        setCallStarted(true);
      });

      vapi.on('call-end', () => {
        console.log('Call ended');
        setCallStarted(false);
      });

      vapi.on('error', (error) => {
        console.error('VAPI Error:', error);
        toast.error('Failed to start call. Please try again.');
      });

      vapi.on('message', (message: any) => {
        console.log('Message received:', message);
        if (message.type === 'transcript') {
          const { role, transcriptType, transcript } = message;
          setCurrentRoll(role);
          
          if (transcriptType === 'partial') {
            setLiveTranscript(transcript);
          } else if (transcriptType === 'final') {
            setMessages(prev => [...prev, { role, content: transcript }]);
            setLiveTranscript('');
          }
        }
      });

      vapi.on('speech-start', () => {
        console.log('Assistant started speaking');
        setCurrentRoll('assistant');
      });
      
      vapi.on('speech-end', () => {
        console.log('Assistant stopped speaking');
        setCurrentRoll('user');
      });

      // Validate assistant ID
      const assistantId = sessionDetails.selectedDoctor?.assistantId;
      console.log('Selected doctor:', sessionDetails.selectedDoctor);
      console.log('Using assistant ID:', assistantId);
      
      if (!assistantId) {
        throw new Error('No assistant ID found. Please configure an assistant in the VAPI dashboard and update the doctor profile.');
      }
      
      console.log('Starting VAPI call with assistant ID:', assistantId);
      
      // Start the call with the assistant ID as a string
      await vapi.start(assistantId);
      
      setVapiInstance(vapi);
      
    } catch (error: any) {
      console.error('Error in startCall:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        toast.error(`Failed to start call (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`);
      } else {
        toast.error(`Failed to start call: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [sessionDetails]);

  const endCall = useCallback(async () => {
    if (!vapiInstance) return;
    
    setIsLoading(true);
    
    try {
      await vapiInstance.stop();
      
      vapiInstance.off('call-start', () => {});
      vapiInstance.off('call-end', () => {});
      vapiInstance.off('message', () => {});
      vapiInstance.off('error', () => {});
      
      setCallStarted(false);
      setVapiInstance(null);
      
      if (sessionId) {
        const result = await GenerateReport();
        console.log('Report generated:', result);
        toast.success('Your report has been generated');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call properly');
    } finally {
      setIsLoading(false);
    }
  }, [vapiInstance, sessionId, router]);

  const GenerateReport = useCallback(async () => {
    if (!sessionId || !sessionDetails) return null;
    
    try {
      const result = await axios.post('/api/generate-report', {
        messages,
        sessionId,
        notes: sessionDetails.notes,
        selectedDoctor: sessionDetails.selectedDoctor
      });
      
      return result.data;
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      return null;
    }
  }, [messages, sessionId, sessionDetails]);

  console.log('sessionDetails:', sessionDetails);

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
      <div className='flex flex-col items-center justify-center mt-10 overflow-y-auto w-full'>
  <div className="w-full max-w-xl mx-auto">
    {messages?.slice(-4).map((msg: Message, index) => (
        <h2 className='text-gray-500 p-2 text-center' key={index}>{msg.role}: {msg.content}</h2>
    ))}
    {liveTranscript && liveTranscript.length > 0 && (
      <h2 className='text-lg text-center'>{currentRoll} {liveTranscript}</h2>
    )}
  </div>
</div>
      {!callStarted ? 
        <Button className='mt-20' onClick={startCall}> 
        <PhoneCall /> Start Call</Button>
        :<Button variant={'destructive'} onClick={endCall} > <PhoneOff/>Disconnect</Button>
}

    </div>
  )
}

export default MedicalVoiceAgent

// function setLoading(arg0: boolean) {
//   throw new Error('Function not implemented.');
// }
