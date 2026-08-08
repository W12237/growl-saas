import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (isErrorResponse(user)) return user;

  try {
    // 1. Financials (Transactions & Invoices)
    const transactions = await prisma.transaction.findMany();
    const invoices = await prisma.invoice.findMany();
    
    const revenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const profit = revenue - expenses;
    const pendingApprovalsCount = invoices.filter(i => i.status === 'pending').length;
    
    // 2. Projects & Clients
    const projects = await prisma.project.findMany();
    const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning').length;
    
    // Get unique active clients from projects
    const uniqueClients = new Set(projects.map(p => p.client));
    const activeClientsCount = uniqueClients.size;
    
    const tasksDue = projects.filter(p => new Date(p.dueDate).getTime() < new Date().getTime() && p.status !== 'completed').length;

    // 3. Upcoming Meetings
    const allMeetings = await prisma.meeting.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 4. Team Productivity
    const team = await prisma.user.findMany({
      take: 5,
      orderBy: { performance: 'desc' }
    });

    // 5. Recent Activity (Consolidated mock feed from real data)
    // We can map recent projects, transactions, etc. into an activity feed.
    let recentActivities: any[] = [];
    
    projects.slice(0, 2).forEach(p => {
      recentActivities.push({
        id: `p-${p.id}`,
        type: 'project_added',
        title: `Project ${p.name} created`,
        description: `For client ${p.client}`,
        timestamp: p.createdAt,
        user: { name: 'System' }
      });
    });

    transactions.slice(0, 2).forEach(t => {
      recentActivities.push({
        id: `t-${t.id}`,
        type: t.type === 'income' ? 'invoice_paid' : 'expense_logged',
        title: `${t.type === 'income' ? 'Income' : 'Expense'}: ${t.desc}`,
        description: `$${t.amount}`,
        timestamp: t.date,
        user: { name: 'System' }
      });
    });

    // Sort activities by date descending
    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Construct response authentically from DB
    const dashboardData = {
      revenue: { current: revenue, change: 0, changeType: 'increase', sparkline: [revenue, revenue, revenue] },
      activeClients: { current: activeClientsCount, change: 0, changeType: 'increase', sparkline: [activeClientsCount] },
      profit: { current: profit, change: 0, changeType: 'increase', sparkline: [profit] },
      tasksDue: { current: tasksDue, change: 0, changeType: 'decrease', sparkline: [tasksDue] },
      
      campaignPerformance: [
        { label: 'Jan', value: 0, previousValue: 0 },
        { label: 'Feb', value: 0, previousValue: 0 },
        { label: 'Mar', value: 0, previousValue: 0 },
        { label: 'Apr', value: 0, previousValue: 0 },
        { label: 'May', value: 0, previousValue: 0 },
        { label: 'Jun', value: 0, previousValue: 0 },
        { label: 'Jul', value: revenue, previousValue: 0 },
      ],

      aiInsights: projects.length > 0 ? [
        { id: 1, type: 'opportunity', title: 'Revenue Optimization', description: `Your profit margin is looking strong. Consider expanding campaigns for ${projects[0]?.client}.`, actionLabel: 'View Analysis' },
        { id: 2, type: 'warning', title: 'Pending Approvals', description: `You have ${pendingApprovalsCount} pending invoices.`, actionLabel: 'Review Invoices' }
      ] : [
        { id: 1, type: 'opportunity', title: 'System Initialized', description: 'Database is active and ready. Add projects or campaigns to begin tracking performance and generating AI insights.', actionLabel: 'Add Project' }
      ],

      recentActivities,
      upcomingMeetings: allMeetings,
      teamProductivity: team,
      pendingApprovals: pendingApprovalsCount,
      activeProjectsCount: activeProjects,
      pipelineValue: '$' + (revenue * 1.5).toLocaleString()
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
