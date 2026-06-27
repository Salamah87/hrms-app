'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CareerJob {
  id: string;
  title: string;
  location?: string;
  type: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  department?: { name: string };
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  intern: 'Internship',
  temporary: 'Temporary',
  freelance: 'Freelance',
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/careers/jobs')
      .then(r => r.json())
      .then(data => { setJobs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="font-semibold text-gray-800 text-lg">PulseHR</span>
          </div>
          <span className="text-sm text-gray-500">Careers</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Join Our Team</h1>
          <p className="text-lg text-gray-600">Explore open positions and find your next role</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Open Positions</h2>
            <p className="text-gray-500">We don&apos;t have any open positions right now. Check back later!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map(job => (
              <Link
                key={job.id}
                href={`/careers/${job.id}`}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all flex items-start justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {job.department?.name && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        {job.department.name}
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {job.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {TYPE_LABELS[job.type] || job.type}
                    </span>
                  </div>
                  {job.description && (
                    <p className="mt-3 text-gray-600 text-sm line-clamp-2">{job.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 ml-6 shrink-0">
                  {(job.salaryMin || job.salaryMax) && (
                    <span className="text-sm font-medium text-emerald-600 whitespace-nowrap">
                      {job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : ''}
                      {job.salaryMin && job.salaryMax ? ' - ' : ''}
                      {job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : ''}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} PulseHR. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
