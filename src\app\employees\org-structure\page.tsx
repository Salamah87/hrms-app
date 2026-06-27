'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, Users, ChevronDown, ChevronRight, User,
  Building2, Mail, MapPin, Filter, X, Sparkles,
  ZoomIn, ZoomOut, Maximize2, List,
  ChevronUp, Info, Network,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  managerId: string | null;
  departmentColor: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive';
  level: number;
}

interface OrgNode extends Employee {
  children: OrgNode[];
  directReportsCount: number;
  totalReportsCount: number;
}

const DEPT_COLORS: Record<string, string> = {
  Engineering: 'bg-blue-500',
  Sales: 'bg-emerald-500',
  Marketing: 'bg-purple-500',
  Finance: 'bg-amber-500',
  HR: 'bg-rose-500',
  Executive: 'bg-gray-800',
};

const DEPT_BG_COLORS: Record<string, string> = {
  Engineering: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  Sales: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  Marketing: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
  Finance: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  HR: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',
  Executive: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
};

const employees: Employee[] = [
  { id: 'ceo', name: 'Dr. Khalid Al-Rashid', title: 'Chief Executive Officer', department: 'Executive', managerId: null, departmentColor: DEPT_COLORS.Executive, email: 'khalid@pulsehr.com', phone: '+966 50 000 0001', location: 'Riyadh HQ', status: 'active', level: 0 },
  { id: 'ahmad', name: 'Ahmad Khaled', title: 'CTO / Senior Developer', department: 'Engineering', managerId: 'ceo', departmentColor: DEPT_COLORS.Engineering, email: 'ahmad@pulsehr.com', phone: '+966 50 000 0002', location: 'Riyadh HQ', status: 'active', level: 1 },
  { id: 'robert', name: 'Robert Wilson', title: 'Lead Developer', department: 'Engineering', managerId: 'ahmad', departmentColor: DEPT_COLORS.Engineering, email: 'robert@pulsehr.com', phone: '+966 50 000 0003', location: 'Riyadh HQ', status: 'active', level: 2 },
  { id: 'james', name: 'James Taylor', title: 'DevOps Engineer', department: 'Engineering', managerId: 'ahmad', departmentColor: DEPT_COLORS.Engineering, email: 'james@pulsehr.com', phone: '+966 50 000 0004', location: 'Remote', status: 'active', level: 2 },
  { id: 'amanda', name: 'Amanda White', title: 'Junior Developer', department: 'Engineering', managerId: 'ahmad', departmentColor: DEPT_COLORS.Engineering, email: 'amanda@pulsehr.com', phone: '+966 50 000 0005', location: 'Riyadh HQ', status: 'active', level: 2 },
  { id: 'sarah', name: 'Sarah Johnson', title: 'HR Director', department: 'HR', managerId: 'ceo', departmentColor: DEPT_COLORS.HR, email: 'sarah@pulsehr.com', phone: '+966 50 000 0006', location: 'Riyadh HQ', status: 'active', level: 1 },
  { id: 'lisa', name: 'Lisa Anderson', title: 'HR Coordinator', department: 'HR', managerId: 'sarah', departmentColor: DEPT_COLORS.HR, email: 'lisa@pulsehr.com', phone: '+966 50 000 0007', location: 'Riyadh HQ', status: 'active', level: 2 },
  { id: 'michael', name: 'Michael Brown', title: 'Finance Manager', department: 'Finance', managerId: 'ceo', departmentColor: DEPT_COLORS.Finance, email: 'michael@pulsehr.com', phone: '+966 50 000 0008', location: 'Riyadh HQ', status: 'active', level: 1 },
  { id: 'emily', name: 'Emily Davis', title: 'Accountant', department: 'Finance', managerId: 'michael', departmentColor: DEPT_COLORS.Finance, email: 'emily@pulsehr.com', phone: '+966 50 000 0009', location: 'Riyadh HQ', status: 'active', level: 2 },
  { id: 'nora', name: 'Nora Hassan', title: 'Sales Manager', department: 'Sales', managerId: 'ceo', departmentColor: DEPT_COLORS.Sales, email: 'nora@pulsehr.com', phone: '+966 50 000 0010', location: 'Jeddah Office', status: 'active', level: 1 },
  { id: 'william', name: 'William Thomas', title: 'Sales Representative', department: 'Sales', managerId: 'nora', departmentColor: DEPT_COLORS.Sales, email: 'william@pulsehr.com', phone: '+966 50 000 0011', location: 'Jeddah Office', status: 'active', level: 2 },
  { id: 'jennifer', name: 'Jennifer Lee', title: 'Marketing Manager', department: 'Marketing', managerId: 'ceo', departmentColor: DEPT_COLORS.Marketing, email: 'jennifer@pulsehr.com', phone: '+966 50 000 0012', location: 'Riyadh HQ', status: 'active', level: 1 },
  { id: 'maria', name: 'Maria Garcia', title: 'Marketing Specialist', department: 'Marketing', managerId: 'jennifer', departmentColor: DEPT_COLORS.Marketing, email: 'maria@pulsehr.com', phone: '+966 50 000 0013', location: 'Riyadh HQ', status: 'active', level: 2 },
];

function buildTree(emps: Employee[]): OrgNode | null {
  const empMap = new Map<string, Employee>();
  emps.forEach(e => empMap.set(e.id, e));
  const root = emps.find(e => e.managerId === null);
  if (!root) return null;

  function attach(node: Employee): OrgNode {
    const children = emps
      .filter(e => e.managerId === node.id)
      .map(child => attach(child));
    const totalReports = children.reduce((sum, c) => sum + 1 + c.totalReportsCount, 0);
    return {
      ...node,
      children,
      directReportsCount: children.length,
      totalReportsCount: totalReports,
    };
  }
  return attach(root);
}

function flattenTree(node: OrgNode): OrgNode[] {
  return [node, ...node.children.flatMap(flattenTree)];
}

function getChainOfCommand(empId: string, emps: Employee[]): Employee[] {
  const chain: Employee[] = [];
  let current = emps.find(e => e.id === empId);
  while (current) {
    chain.push(current);
    current = emps.find(e => e.id === current?.managerId);
  }
  return chain;
}

const departments = [...new Set(employees.map(e => e.department))];

function TreeNode({
  node,
  searchQuery,
  selectedId,
  onSelect,
  level = 0,
}: {
  node: OrgNode;
  searchQuery: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;
  const isHighlighted = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="relative">
      {level > 0 && (
        <div className="absolute left-[23px] -top-4 bottom-1/2 w-px bg-gray-200 dark:bg-gray-700" />
      )}
      <div className="relative flex items-start gap-3 py-1">
        {level > 0 && (
          <div className="absolute -left-3 top-6 h-px w-3 bg-gray-200 dark:bg-gray-700" />
        )}
        <div className="relative z-10 mt-2 flex-shrink-0 w-5 flex justify-center">
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex h-5 w-5 items-center justify-center rounded-full border bg-white text-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-200 dark:border-gray-700" />
          )}
        </div>
        <div
          className={cn(
            'relative z-10 flex-1 cursor-pointer rounded-lg border p-3 transition-all',
            isSelected
              ? 'border-gray-900 bg-gray-50 shadow-md dark:border-white dark:bg-gray-800'
              : isHighlighted
                ? 'border-yellow-400 bg-yellow-50 shadow-sm dark:border-yellow-600 dark:bg-yellow-950/20'
                : 'border-transparent bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/70',
          )}
          onClick={() => onSelect(node.id)}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shrink-0',
              node.departmentColor
            )}>
              {node.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'truncate text-sm font-semibold',
                  isHighlighted ? 'text-yellow-800 dark:text-yellow-300' : 'text-gray-900 dark:text-white'
                )}>
                  {node.name}
                </span>
                {node.children.length > 0 && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                    {node.children.length}
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{node.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                  'inline-block h-1.5 w-1.5 rounded-full',
                  node.departmentColor
                )} />
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{node.department}</span>
              </div>
            </div>
          </div>
          {hasChildren && expanded && (
            <div className="relative mt-2 ml-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
              {node.children.map(child => (
                <TreeNode
                  key={child.id}
                  node={child}
                  searchQuery={searchQuery}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const aiResponses: Record<string, string> = {
  'sarah': 'Sarah Johnson reports to Dr. Khalid Al-Rashid (CEO). She manages 1 direct report: Lisa Anderson.',
  'engineering': 'The Engineering team has 4 members. Ahmad Khaled (CTO) leads Robert Wilson, James Taylor, and Amanda White.',
  'ceo': 'Dr. Khalid Al-Rashid is the CEO. He has 5 direct reports leading Engineering, HR, Finance, Sales, and Marketing.',
  'report': 'Use the org tree above to click any employee and see their chain of command in the detail panel.',
};

function getAIResponse(query: string, emps: Employee[]): string {
  const q = query.toLowerCase();
  for (const [key, response] of Object.entries(aiResponses)) {
    if (q.includes(key)) return response;
  }
  for (const emp of emps) {
    if (q.includes(emp.name.toLowerCase().split(' ')[0])) {
      const chain = getChainOfCommand(emp.id, emps);
      const reports = emps.filter(e => e.managerId === emp.id);
      let resp = `${emp.name} (${emp.title}, ${emp.department}).`;
      if (chain.length > 1) {
        resp += ` Reports to: ${chain.slice(1).map(e => `${e.name} (${e.title})`).join(' → ')}.`;
      }
      if (reports.length > 0) {
        resp += ` Direct reports (${reports.length}): ${reports.map(r => r.name).join(', ')}.`;
      }
      return resp;
    }
  }
  return `I found ${emps.length} employees across ${departments.length} departments. Try asking about a specific person or team.`;
}

export default function OrgStructurePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(true);
  const treeRef = useRef<HTMLDivElement>(null);

  const orgTree = useMemo(() => buildTree(employees), []);
  const allNodes = useMemo(() => orgTree ? flattenTree(orgTree) : [], [orgTree]);
  const selectedEmp = selectedId ? employees.find(e => e.id === selectedId) : null;
  const directReports = selectedId ? employees.filter(e => e.managerId === selectedId) : [];
  const chainOfCommand = selectedId ? getChainOfCommand(selectedId, employees) : [];

  const filteredNodes = useMemo(() => {
    if (!orgTree) return null;
    if (!deptFilter) return orgTree;
    const empsInDept = employees.filter(e => e.department === deptFilter);
    const idsInDept = new Set(empsInDept.map(e => e.id));
    empsInDept.forEach(e => {
      let current = employees.find(emp => emp.id === e.managerId);
      while (current) {
        idsInDept.add(current.id);
        current = employees.find(emp => emp.id === current?.managerId);
      }
    });
    function filterNode(node: OrgNode): OrgNode | null {
      if (!idsInDept.has(node.id)) return null;
      return {
        ...node,
        children: node.children.map(filterNode).filter((n): n is OrgNode => n !== null),
        directReportsCount: node.children.filter(c => idsInDept.has(c.id)).length,
      };
    }
    return filterNode(orgTree);
  }, [orgTree, deptFilter]);

  const stats = useMemo(() => ({
    total: employees.length,
    departments: departments.length,
    levels: orgTree ? Math.max(...allNodes.map(n => n.level)) + 1 : 0,
    avgSpan: orgTree ? (allNodes.filter(n => n.children.length > 0).reduce((s, n) => s + n.children.length, 0) /
      Math.max(allNodes.filter(n => n.children.length > 0).length, 1)) : 0,
  }), [orgTree, allNodes]);

  useEffect(() => {
    if (selectedId && !showDetailPanel) setShowDetailPanel(true);
  }, [selectedId, showDetailPanel]);

  const handleSearch = useMemo(() => {
    return allNodes.filter(n =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allNodes]);

  return (
    <div className="min-h-full space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Org Chart & Reporting Hierarchy
            </h1>
            <Badge variant="success" className="text-[10px]">AI-Powered</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Interactive organization tree with reporting relationships and AI insights
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Departments', value: stats.departments, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Hierarchy Levels', value: stats.levels, icon: List, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
          { label: 'Avg Span of Control', value: stats.avgSpan.toFixed(1), icon: User, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('rounded-lg p-2.5', stat.bg)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, title, or department..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setShowAIPanel(false); }}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-gray-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setDeptFilter(deptFilter === dept ? null : dept)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                deptFilter === dept
                  ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700'
              )}
            >
              {dept}
            </button>
          ))}
          {deptFilter && (
            <button onClick={() => setDeptFilter(null)} className="text-xs text-gray-500 hover:text-gray-700 underline">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b pb-2 dark:border-gray-800">
        <button
          onClick={() => { setShowAIPanel(!showAIPanel); setShowDetailPanel(false); }}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            showAIPanel ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Assistant
        </button>
        <button
          onClick={() => setShowDetailPanel(!showDetailPanel)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            showDetailPanel && selectedEmp ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <Info className="h-3.5 w-3.5" />
          Details
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => setZoom(1)} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 ml-1">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        <div className={cn('flex-1 min-w-0', (showAIPanel || (showDetailPanel && selectedEmp)) && 'lg:w-2/3')}>
          <Card>
            <CardContent className="p-5">
              <div
                ref={treeRef}
                className="overflow-auto transition-transform duration-200"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              >
                {filteredNodes ? (
                  <div className="mx-auto max-w-2xl">
                    <TreeNode
                      node={filteredNodes}
                      searchQuery={searchQuery}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-400 py-8">No matching employees found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {showAIPanel && (
          <Card className="w-full lg:w-[380px] shrink-0 self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Org Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask about the org structure..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && aiQuery.trim()) {
                      setAiResponse(getAIResponse(aiQuery.trim(), employees));
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 pr-8 text-sm outline-none focus:border-purple-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <button
                  onClick={() => {
                    if (aiQuery.trim()) setAiResponse(getAIResponse(aiQuery.trim(), employees));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </button>
              </div>
              {aiResponse && (
                <div className="rounded-lg border bg-purple-50 p-3 text-sm text-gray-700 dark:border-purple-900/50 dark:bg-purple-950/20 dark:text-gray-300">
                  {aiResponse}
                </div>
              )}
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase text-gray-400">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Who does Sarah report to?', 'Show Engineering team', 'Who is the CEO?', 'Tell me about the org'].map(q => (
                    <button
                      key={q}
                      onClick={() => { setAiQuery(q); setAiResponse(getAIResponse(q, employees)); }}
                      className="rounded-full border bg-white px-2.5 py-1 text-[11px] text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showDetailPanel && selectedEmp && !showAIPanel && (
          <Card className="w-full lg:w-[380px] shrink-0 self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-blue-500" />
                Employee Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b dark:border-gray-800">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-bold', selectedEmp.departmentColor)}>
                  {selectedEmp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedEmp.name}</p>
                  <p className="text-sm text-gray-500">{selectedEmp.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn('inline-block h-2 w-2 rounded-full', selectedEmp.departmentColor)} />
                    <span className="text-xs text-gray-400">{selectedEmp.department}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{selectedEmp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{selectedEmp.location}</span>
                </div>
              </div>

              <div className="rounded-lg border p-3 dark:border-gray-700">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 mb-2">
                  <ChevronUp className="h-3 w-3" />
                  Chain of Command ({chainOfCommand.length})
                </h4>
                <div className="space-y-1">
                  {chainOfCommand.map((emp, i) => (
                    <div key={emp.id} className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full', i === 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600')} />
                      <button
                        onClick={() => setSelectedId(emp.id)}
                        className={cn(
                          'text-xs hover:underline',
                          i === 0 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'
                        )}
                      >
                        {emp.name}
                      </button>
                      {i < chainOfCommand.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-3 dark:border-gray-700">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 mb-2">
                  <Users className="h-3 w-3" />
                  Direct Reports ({directReports.length})
                </h4>
                {directReports.length > 0 ? (
                  <div className="space-y-2">
                    {directReports.map(rep => (
                      <div key={rep.id} className="flex items-center gap-2">
                        <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-bold', rep.departmentColor)}>
                          {rep.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <button
                          onClick={() => setSelectedId(rep.id)}
                          className="text-sm text-gray-700 hover:underline dark:text-gray-300"
                        >
                          {rep.name}
                        </button>
                        <span className="text-xs text-gray-400 ml-auto">{rep.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No direct reports</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t dark:border-gray-800">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">{directReports.length}</span> direct
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">{chainOfCommand.length}</span> levels from CEO
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {allNodes.find(n => n.id === selectedEmp.id)?.totalReportsCount ?? 0}
                  </span> total in subtree
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
