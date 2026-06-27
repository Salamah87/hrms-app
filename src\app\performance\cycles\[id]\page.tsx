'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, ChevronLeft, Target, Plus, Edit3, Play, XCircle, BarChart3, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import type { PerformanceCycle, Goal, Competency, CompetencyRating } from '@/types';

export default function CycleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cycle, setCycle] = useState<PerformanceCycle | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', description: '', targetValue: '', unit: '', dueDate: '' });
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const fetchData = async () => {
    const [cRes, gRes, compRes] = await Promise.all([
      fetch(`/api/performance/cycles/${id}`),
      fetch(`/api/performance/goals?cycleId=${id}`),
      fetch('/api/performance/competencies'),
    ]);
    if (cRes.ok) setCycle(await cRes.json());
    if (gRes.ok) setGoals(await gRes.json());
    if (compRes.ok) setCompetencies((await compRes.json()).filter((c: Competency) => c.isActive));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAction = async (action: string) => {
    await fetch(`/api/performance/cycles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    fetchData();
  };

  const rateCompetency = async (competencyId: string, rating: number) => {
    setRatings(r => ({ ...r, [competencyId]: rating }));
    await fetch('/api/performance/competency-ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: id, competencyId, rating }),
    });
  };

  const handleAddGoal = async () => {
    await fetch('/api/performance/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cycleId: id,
        employeeId: 'emp-1',
        title: goalForm.title,
        description: goalForm.description,
        type: 'objective',
        targetValue: goalForm.targetValue ? Number(goalForm.targetValue) : undefined,
        unit: goalForm.unit,
        dueDate: goalForm.dueDate || undefined,
      }),
    });
    setShowGoalModal(false);
    setGoalForm({ title: '', description: '', targetValue: '', unit: '', dueDate: '' });
    fetchData();
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!cycle) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Cycle not found</p>
      <Link href="/performance/cycles"><Button variant="outline" className="mt-4">Back to Cycles</Button></Link>
    </div>
  );

  const progress = goals.reduce((sum, g) => {
    if (g.type === 'objective' && g.targetValue && g.targetValue > 0) {
      return sum + Math.min(g.currentValue / g.targetValue, 1) * (g.weight / 100);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Link href="/performance/cycles" className="hover:text-blue-600 transition-colors">Cycles</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{cycle.name}</span>
      </div>

      <Card>
        <CardContent className="px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                cycle.status === 'active' ? 'bg-green-100 text-green-600' :
                cycle.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'
              }`}>
                <Calendar className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{cycle.name}</h1>
                  <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                    cycle.status === 'active' ? 'bg-green-100 text-green-700' :
                    cycle.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                  }`}>{cycle.status}</span>
                </div>
                <p className="text-gray-500 mt-1">
                  {cycle.type.replace('_', ' ')} · {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
                  {cycle.reviewStyle === '360' && ' · 360° Feedback'}
                  {cycle.reviewStyle === 'okr' && ' · OKR Based'}
                  {cycle.reviewStyle === 'all' && ' · All Components'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {cycle.status === 'draft' && (
                <>
                  <Button variant="outline" onClick={() => setShowEdit(true)} leftIcon={<Edit3 className="h-4 w-4" />}>Edit</Button>
                  <Button onClick={() => handleAction('launch')} leftIcon={<Play className="h-4 w-4" />}>Launch Cycle</Button>
                </>
              )}
              {cycle.status === 'active' && (
                <Button variant="danger" onClick={() => handleAction('close')} leftIcon={<XCircle className="h-4 w-4" />}>Close Cycle</Button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
              <p className="text-xs text-gray-500 mt-1">Objectives</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {goals.reduce((s, g) => s + (g.children?.length || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Key Results</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{(progress * 100).toFixed(0)}%</p>
              <p className="text-xs text-gray-500 mt-1">Progress</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objectives & Key Results</CardTitle>
          <Button size="sm" onClick={() => setShowGoalModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Add Objective
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No objectives defined yet</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowGoalModal(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add First Objective
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="border rounded-lg p-4 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <p className="font-medium text-gray-900">{goal.title}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          goal.status === 'on_track' ? 'bg-green-100 text-green-700' :
                          goal.status === 'at_risk' ? 'bg-yellow-100 text-yellow-700' :
                          goal.status === 'behind' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{goal.status.replace('_', ' ')}</span>
                      </div>
                      {goal.description && <p className="text-sm text-gray-500 mt-1">{goal.description}</p>}
                      {goal.targetValue && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }} />
                            </div>
                            <span className="font-medium">{goal.currentValue}/{goal.targetValue}{goal.unit ? ` ${goal.unit}` : ''}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {goal.dueDate && <span className="text-xs text-gray-400">Due {formatDate(goal.dueDate)}</span>}
                  </div>
                  {goal.children && goal.children.length > 0 && (
                    <div className="mt-3 ml-6 space-y-2 border-l-2 border-blue-200 pl-4">
                      {goal.children.map(kr => (
                        <div key={kr.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            <p className="text-sm text-gray-700">{kr.title}</p>
                          </div>
                          {kr.targetValue && (
                            <span className="text-xs text-gray-500">{kr.currentValue}/{kr.targetValue}{kr.unit}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competency Evaluation</CardTitle>
          {cycle.status === 'draft' && <p className="text-xs text-gray-400">Competencies will be rated once cycle is active</p>}
        </CardHeader>
        <CardContent>
          {competencies.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              No active competencies defined.
              <Link href="/performance/competencies" className="text-blue-600 hover:underline ml-1">Manage competencies</Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {competencies.map(comp => (
                <div key={comp.id} className="border rounded-lg p-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{comp.name}</p>
                      {comp.description && <p className="text-xs text-gray-500">{comp.description}</p>}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => rateCompetency(comp.id, star)}
                          disabled={cycle.status !== 'active'}
                          className={`p-0.5 transition-colors ${cycle.status !== 'active' ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              (ratings[comp.id] || 0) >= star
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                      {ratings[comp.id] && (
                        <span className="ml-2 text-xs font-medium text-gray-500">{ratings[comp.id]}/5</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {cycle.status !== 'active' && competencies.length > 0 && (
            <p className="text-xs text-gray-400 mt-3 text-center">Launch the cycle to enable competency rating</p>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Add Objective" size="md">
        <div className="space-y-4">
          <Input label="Title" value={goalForm.title} onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Improve API Performance" />
          <Input label="Description" value={goalForm.description} onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Value" type="number" value={goalForm.targetValue} onChange={e => setGoalForm(f => ({ ...f, targetValue: e.target.value }))} placeholder="e.g. 100" />
            <Input label="Unit" value={goalForm.unit} onChange={e => setGoalForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. %" />
          </div>
          <Input label="Due Date" type="date" value={goalForm.dueDate} onChange={e => setGoalForm(f => ({ ...f, dueDate: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowGoalModal(false)}>Cancel</Button>
            <Button onClick={handleAddGoal} disabled={!goalForm.title}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
