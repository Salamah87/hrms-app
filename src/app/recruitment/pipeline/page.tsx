'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, ExternalLink, X, Mail, Ban, Sparkles, Calendar, Brain, Send, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import type { Job, PipelineStage, Application } from '@/types';

function KanbanCard({ application, onClick }: { application: Application; onClick?: (app: Application) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: { application },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const candidate = application.candidate;
  const initials = candidate
    ? `${candidate.firstName[0]}${candidate.lastName[0]}`.toUpperCase()
    : '?';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick?.(application)}
      className="group cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown'}
              </p>
              {candidate?.currentTitle && (
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{candidate.currentTitle}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {application.aiScore != null && (
              <Badge variant={application.aiScore >= 70 ? 'success' : application.aiScore >= 40 ? 'warning' : 'danger'} size="sm">
                <Sparkles className="h-3 w-3 mr-0.5" />
                {application.aiScore}
              </Badge>
            )}
            {!application.aiScore && application.stage?.name === 'Applied' && (
              <span className="text-[10px] text-gray-400 italic">Not screened</span>
            )}
            <span className="text-[10px] text-gray-400">{formatDate(application.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Column({ stage, applications, onScreenAll, screening, onCardClick }: {
  stage: PipelineStage; applications: Application[];
  onScreenAll?: () => void; screening?: boolean; onCardClick?: (app: Application) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { stage },
  });

  const colors: Record<string, string> = {
    'Applied': 'border-t-blue-500',
    'AI Screening': 'border-t-indigo-500',
    'CV Review': 'border-t-violet-500',
    'Phone Screen': 'border-t-purple-500',
    'Technical Interview': 'border-t-orange-500',
    'Final Interview': 'border-t-pink-500',
    'Reference Check': 'border-t-teal-500',
    'Offer Sent': 'border-t-yellow-500',
    'Hired': 'border-t-green-500',
    'Rejected': 'border-t-red-500',
  };

  const color = colors[stage.name] || 'border-t-gray-400';

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 flex-shrink-0 flex-col rounded-xl border bg-gray-50 shadow-sm dark:border-gray-700 dark:bg-gray-900/50 ${color} border-t-2 ${isOver ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {applications.length}
          </span>
        </div>
        {onScreenAll && applications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onScreenAll} disabled={screening} className="h-6 text-[10px] px-1.5">
            {screening ? <RotateCw className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
          </Button>
        )}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2.5 min-h-[200px] max-h-[calc(100vh-280px)]">
        {applications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-gray-400">Drop candidates here</p>
          </div>
        ) : (
          applications.map((app) => (
            <KanbanCard key={app.id} application={app} onClick={onCardClick} />
          ))
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [screening, setScreening] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    scheduledAt: '', durationMins: '60', type: 'video', locationLink: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    setLoading(true);
    fetch('/api/recruitment/jobs?status=open')
      .then((r) => r.json())
      .then((data) => {
        setJobs(data);
        if (data.length > 0 && !selectedJob) setSelectedJob(data[0].id);
      })
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const fetchPipeline = useCallback(() => {
    if (!selectedJob) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/recruitment/stages?jobId=${selectedJob}`).then((r) => r.json()),
      fetch(`/api/recruitment/jobs/${selectedJob}/applications`).then((r) => r.json()),
    ])
      .then(([stagesData, appsData]) => {
        setStages(stagesData);
        setApplications(appsData);
      })
      .catch(() => toast.error('Failed to load pipeline data'))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  useEffect(() => { fetchPipeline(); }, [fetchPipeline]);

  const getApplicationsByStage = useCallback(
    (stageId: string) => applications.filter((a) => a.stageId === stageId && a.status === 'active'),
    [applications]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const app = event.active.data.current?.application as Application;
    if (app) setActiveApp(app);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;

    const app = active.data.current?.application as Application;
    const targetStage = over.data.current?.stage as PipelineStage | undefined;
    if (!app || !targetStage || app.stageId === targetStage.id) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, stageId: targetStage.id, stage: targetStage } : a))
    );

    try {
      const res = await fetch(`/api/recruitment/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: targetStage.id }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Moved to ${targetStage.name}`);
    } catch {
      toast.error('Failed to update stage');
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, stageId: app.stageId, stage: app.stage } : a))
      );
    }
  };

  const handleCardClick = (app: Application) => {
    setActiveApp(app);
    setDetailOpen(true);
  };

  const handleReject = async (appId: string) => {
    try {
      const res = await fetch(`/api/recruitment/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Application rejected');
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      setDetailOpen(false);
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleScreen = async (app: Application) => {
    if (!app.candidate || !selectedJob) return;
    try {
      const res = await fetch('/api/recruitment/ai/screen-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'screen-resume', candidate: app.candidate, jobId: selectedJob }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      await fetch(`/api/recruitment/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiScore: result.score, aiSummary: result.summary }),
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, aiScore: result.score, aiSummary: result.summary } : a))
      );
      toast.success(`${app.candidate?.firstName} scored ${result.score}/100`);
      return result;
    } catch {
      toast.error('AI screening failed');
      return null;
    }
  };

  const handleScreenAll = async () => {
    const appliedStage = stages.find((s) => s.name === 'Applied');
    if (!appliedStage) return;
    const unscreened = applications.filter(
      (a) => a.stageId === appliedStage.id && a.aiScore == null && a.status === 'active'
    );
    if (unscreened.length === 0) {
      toast('All candidates already screened');
      return;
    }
    setScreening(true);
    let screened = 0;
    for (const app of unscreened) {
      const result = await handleScreen(app);
      if (result) {
        screened++;
        if (result.score >= 70) {
          const nextStage = stages.find((s) => s.stageOrder === appliedStage.stageOrder + 1);
          if (nextStage) {
            await fetch(`/api/recruitment/applications/${app.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stageId: nextStage.id }),
            });
            setApplications((prev) =>
              prev.map((a) => (a.id === app.id ? { ...a, stageId: nextStage.id, stage: nextStage } : a))
            );
          }
        } else if (result.score < 20) {
          await fetch(`/api/recruitment/applications/${app.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reject' }),
          });
          setApplications((prev) => prev.filter((a) => a.id !== app.id));
        }
      }
    }
    setScreening(false);
    toast.success(`Screened ${screened} candidates`);
  };

  const handleSchedule = async () => {
    if (!activeApp || !scheduleForm.scheduledAt) return;
    try {
      const res = await fetch('/api/recruitment/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: activeApp.id,
          stageId: activeApp.stageId,
          scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
          durationMins: parseInt(scheduleForm.durationMins),
          type: scheduleForm.type,
          locationLink: scheduleForm.locationLink || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Interview scheduled');
      setScheduleOpen(false);
      setDetailOpen(false);
    } catch {
      toast.error('Failed to schedule interview');
    }
  };

  const rejectedStages = stages.filter((s) => s.name === 'Rejected');
  const rejectedStageId = rejectedStages[0]?.id;
  const activeCandidate = activeApp?.candidate;
  const activeStage = activeApp?.stage;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline Board</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Drag candidates across stages. Click a card for details, AI screening, and scheduling.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: '', label: 'Select a job...' },
              ...jobs.map((j) => ({ value: j.id, label: j.title })),
            ]}
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-64"
            placeholder="Select a job..."
          />
          <Button variant="outline" onClick={() => router.push('/recruitment/requisitions')}>
            <ExternalLink className="h-4 w-4" /> All Jobs
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : !selectedJob ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-500 dark:text-gray-400">Select a job to view its pipeline</p>
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages
              .filter((s) => s.name !== 'Rejected' && s.name !== 'Hired')
              .sort((a, b) => a.stageOrder - b.stageOrder)
              .map((stage) => (
                <Column
                  key={stage.id}
                  stage={stage}
                  applications={getApplicationsByStage(stage.id)}
                  onScreenAll={stage.name === 'Applied' ? handleScreenAll : undefined}
                  screening={screening && stage.name === 'Applied'}
                  onCardClick={handleCardClick}
                />
              ))}
            <div className="flex-shrink-0 w-72">
              {rejectedStageId && (
                <Column
                  stage={rejectedStages[0]}
                  applications={getApplicationsByStage(rejectedStageId)}
                  onCardClick={handleCardClick}
                />
              )}
            </div>
          </div>
          <DragOverlay>
            {activeApp && (
              <div className="rounded-lg border bg-white p-3 shadow-lg dark:bg-gray-800 dark:border-gray-700 opacity-90">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {activeCandidate ? `${activeCandidate.firstName[0]}${activeCandidate.lastName[0]}`.toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activeCandidate ? `${activeCandidate.firstName} ${activeCandidate.lastName}` : 'Unknown'}
                    </p>
                    {activeCandidate?.currentTitle && (
                      <p className="text-xs text-gray-500">{activeCandidate.currentTitle}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Application Details" size="lg">
        {activeApp && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {activeCandidate ? `${activeCandidate.firstName[0]}${activeCandidate.lastName[0]}`.toUpperCase() : '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {activeCandidate ? `${activeCandidate.firstName} ${activeCandidate.lastName}` : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activeCandidate?.email}</p>
                </div>
              </div>
              <Badge variant={activeApp.status === 'active' ? 'success' : 'danger'}>{activeApp.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Current Position</p>
                <p className="font-medium text-gray-900 dark:text-white">{activeCandidate?.currentTitle || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Current Company</p>
                <p className="font-medium text-gray-900 dark:text-white">{activeCandidate?.currentCompany || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{activeCandidate?.phone || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Stage</p>
                <p className="font-medium text-gray-900 dark:text-white">{activeStage?.name || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Applied</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(activeApp.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Source</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{activeApp.source || 'portal'}</p>
              </div>
            </div>

            {/* AI Screening Section */}
            <div className="rounded-lg border p-4 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">AI Screening</span>
                </div>
                {activeApp.aiScore == null && (
                  <Button variant="outline" size="sm" onClick={() => handleScreen(activeApp)}>
                    <Sparkles className="h-3.5 w-3.5" /> Screen Now
                  </Button>
                )}
              </div>
              {activeApp.aiScore != null ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className={`h-2 rounded-full ${activeApp.aiScore >= 70 ? 'bg-green-500' : activeApp.aiScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${activeApp.aiScore}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{activeApp.aiScore}/100</span>
                  </div>
                  {activeApp.aiSummary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded p-2.5">{activeApp.aiSummary}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">Not yet screened. Click "Screen Now" to evaluate against the job requirements.</p>
              )}
            </div>

            {activeApp.coverLetter && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cover Letter</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-3">{activeApp.coverLetter}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                {activeCandidate?.phone && (
                  <Button variant="outline" size="sm" onClick={() => window.open(`tel:${activeCandidate.phone}`)}>
                    <Phone className="h-4 w-4" /> Call
                  </Button>
                )}
                {activeCandidate?.email && (
                  <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${activeCandidate.email}`)}>
                    <Mail className="h-4 w-4" /> Email
                  </Button>
                )}
                {activeApp.status === 'active' && (
                  <Button variant="outline" size="sm" onClick={() => { setScheduleForm({ scheduledAt: '', durationMins: '60', type: 'video', locationLink: '' }); setScheduleOpen(true); }}>
                    <Calendar className="h-4 w-4" /> Schedule Interview
                  </Button>
                )}
              </div>
              {activeApp.status === 'active' && (
                <Button variant="danger" size="sm" onClick={() => handleReject(activeApp.id)}>
                  <Ban className="h-4 w-4" /> Reject
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule Interview" size="md">
        <div className="space-y-4">
          <Input label="Date & Time" type="datetime-local" value={scheduleForm.scheduledAt} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (minutes)" type="number" value={scheduleForm.durationMins} onChange={(e) => setScheduleForm({ ...scheduleForm, durationMins: e.target.value })} min={15} step={15} />
            <Select label="Type" options={[
              { value: 'video', label: 'Video Call' },
              { value: 'phone', label: 'Phone Call' },
              { value: 'onsite', label: 'On-site' },
              { value: 'technical', label: 'Technical' },
            ]} value={scheduleForm.type} onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })} />
          </div>
          <Input label="Location / Meeting Link" value={scheduleForm.locationLink} onChange={(e) => setScheduleForm({ ...scheduleForm, locationLink: e.target.value })} placeholder="e.g. https://meet.google.com/abc-defg-hij" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={!scheduleForm.scheduledAt}>Schedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Phone(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
