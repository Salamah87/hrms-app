'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Phone, Mail, Briefcase, Calendar, Upload, Plus, MessageSquare, FileText, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';

interface Interview {
  id: string;
  date: string;
  interviewer: string;
  type: string;
  feedback?: string;
  rating?: number;
}

interface Note {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface TimelineEvent {
  id: string;
  action: string;
  detail: string;
  date: string;
}

const candidate = {
  id: '1',
  name: 'Ahmad Khaled',
  email: 'ahmad@email.com',
  phone: '+966 55 111 1111',
  position: 'Frontend Developer',
  department: 'Engineering',
  status: 'interview' as const,
  appliedDate: '2026-06-20',
};

const mockInterviews: Interview[] = [
  { id: '1', date: '2026-06-25', interviewer: 'Sarah Johnson (Tech Lead)', type: 'Technical', feedback: 'Strong React skills, good problem solving', rating: 4 },
  { id: '2', date: '2026-06-22', interviewer: 'Khaled Omar (HR)', type: 'HR Screening', feedback: 'Good communication, aligned with company values', rating: 4 },
];

const mockNotes: Note[] = [
  { id: '1', author: 'Recruiter', content: 'Candidate has 5 years of experience with React and TypeScript.', date: '2026-06-21' },
  { id: '2', author: 'Tech Lead', content: 'Reviewed portfolio - impressed with previous projects.', date: '2026-06-23' },
];

const mockTimeline: TimelineEvent[] = [
  { id: '1', action: 'Application Submitted', detail: 'Applied for Frontend Developer position', date: '2026-06-20' },
  { id: '2', action: 'Screening Passed', detail: 'HR screening completed successfully', date: '2026-06-21' },
  { id: '3', action: 'Technical Interview Scheduled', detail: 'Interview set with Tech Lead', date: '2026-06-22' },
  { id: '4', action: 'Technical Interview Completed', detail: 'Positive feedback received', date: '2026-06-25' },
];

const statusOptions = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export default function CandidateDetailPage() {
  const params = useParams();

  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState(mockNotes);
  const [offerModal, setOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerStatus, setOfferStatus] = useState('draft');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [...prev, { id: String(Date.now()), author: 'You', content: newNote, date: new Date().toISOString().split('T')[0] }]);
    setNewNote('');
  };

  const handleSendOffer = () => {
    console.log('Offer sent:', { candidate: candidate.name, amount: offerAmount });
    setOfferModal(false);
  };

  const interviewContent = (
    <div className="space-y-4">
      {mockInterviews.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No interviews yet</p>
      ) : (
        mockInterviews.map((iv) => (
          <Card key={iv.id}>
            <CardContent className="px-5 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{iv.type} Interview</p>
                  <p className="text-xs text-gray-500">with {iv.interviewer}</p>
                  <p className="text-xs text-gray-400">{formatDate(iv.date)}</p>
                </div>
                {iv.rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < iv.rating! ? 'text-yellow-400' : 'text-gray-300'}`}>&#9733;</span>
                    ))}
                  </div>
                )}
              </div>
              {iv.feedback && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{iv.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
      <Button variant="outline" className="w-full" leftIcon={<Calendar className="h-4 w-4" />}>
        Schedule Interview
      </Button>
    </div>
  );

  const notesContent = (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="rounded-lg border p-4 dark:border-gray-800">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{note.author}</span>
            <span className="text-xs text-gray-400">{formatDate(note.date)}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{note.content}</p>
        </div>
      ))}
      <div className="flex gap-2">
        <Input placeholder="Add a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
        <Button onClick={handleAddNote} disabled={!newNote.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const offerContent = (
    <div className="space-y-4">
      <Card>
        <CardContent className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Offer Status</p>
                <Badge variant={offerStatus === 'draft' ? 'warning' : offerStatus === 'sent' ? 'info' : 'success'}>
                  {offerStatus}
                </Badge>
              </div>
            </div>
            <Button onClick={() => setOfferModal(true)}>
              <FileText className="h-4 w-4" />
              Create Offer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const timelineContent = (
    <div className="space-y-0">
      {mockTimeline.map((event, i) => (
        <div key={event.id} className="relative flex gap-4 pb-6">
          {i < mockTimeline.length - 1 && (
            <div className="absolute left-[15px] top-8 h-full w-px bg-gray-200 dark:bg-gray-700" />
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-white dark:bg-gray-900">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{event.action}</p>
            <p className="text-xs text-gray-500">{event.detail}</p>
            <p className="mt-0.5 text-[10px] text-gray-400">{formatDate(event.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/recruitment/candidates">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar src={candidate.avatar} name={candidate.name} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{candidate.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{candidate.position}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{candidate.email}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{candidate.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select options={statusOptions} value={candidate.status} onChange={() => {}} className="w-36" />
              <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>Upload Resume</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        tabs={[
          { id: 'interviews', label: 'Interviews', content: interviewContent },
          { id: 'notes', label: 'Notes', content: notesContent, badge: notes.length },
          { id: 'offer', label: 'Offer', content: offerContent },
          { id: 'timeline', label: 'Timeline', content: timelineContent },
        ]}
      />
    </div>
  );
}
