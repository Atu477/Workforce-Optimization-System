import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  Clock, 
  Calendar, 
  Filter, 
  PlusCircle, 
  FileSpreadsheet, 
  UserCheck, 
  MapPin,
  CheckCircle2,
  Users,
  AlertCircle,
  RefreshCw,
  Building2,
  Layers,
  UserX,
  CalendarOff,
  FileText,
  Printer,
  Sparkles,
  ArrowLeft,
  CalendarRange,
  Zap,
  TrendingUp,
  Download
} from 'lucide-react';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Manager';

  // Active Tab for Admin/Manager: 'live' | 'history'
  const [activeTab, setActiveTab] = useState(isAdminOrManager ? 'live' : 'history');

  // ──── LIVE WORKFORCE ROSTER STATE ────
  const [liveDate, setLiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [liveDept, setLiveDept] = useState('');
  const [liveShift, setLiveShift] = useState('');
  const [liveStatusFilter, setLiveStatusFilter] = useState('');
  const [availability, setAvailability] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);

  // ──── ATTENDANCE HISTORY STATE ────
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // ──── ADMIN OVERRIDE MODAL ────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    workType: 'On-Site',
    shift: 'Morning Shift (08:00 - 16:00)',
    notes: 'Supervisor manual entry'
  });

  // ──── REPORT GENERATOR STATE ────
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportStep, setReportStep] = useState('configure'); // 'configure' | 'preview'
  const [reportTimeframe, setReportTimeframe] = useState('1month'); // '1day' | '1week' | '1month' | '1year' | 'custom'
  const [reportCustomStart, setReportCustomStart] = useState(new Date().toISOString().split('T')[0]);
  const [reportCustomEnd, setReportCustomEnd] = useState(new Date().toISOString().split('T')[0]);
  const [reportEmployeeId, setReportEmployeeId] = useState('all');
  const [reportDept, setReportDept] = useState('');
  const [reportShift, setReportShift] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Fetch Live Workforce Roster
  const fetchLiveRoster = async () => {
    if (!isAdminOrManager) return;
    try {
      setLiveLoading(true);
      const params = {};
      if (liveDate) params.date = liveDate;
      if (liveDept) params.department = liveDept;
      if (liveShift) params.shift = liveShift;

      const res = await API.get('/attendance/availability', { params });
      setAvailability(res.data);
    } catch (err) {
      console.error('Failed to fetch live workforce availability:', err);
    } finally {
      setLiveLoading(false);
    }
  };

  // Fetch Attendance History Logs
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (shiftFilter) params.shift = shiftFilter;
      if (statusFilter) params.status = statusFilter;
      if (departmentFilter) params.department = departmentFilter;

      const res = await API.get('/attendance/history', { params });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    if (isAdminOrManager) {
      try {
        const res = await API.get('/employees');
        setEmployeesList(res.data);
        if (res.data.length > 0) {
          setAdminFormData(prev => ({ ...prev, employeeId: res.data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to fetch employees list:', err);
      }
    }
  };

  useEffect(() => {
    if (isAdminOrManager && activeTab === 'live') {
      fetchLiveRoster();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveDate, liveDept, liveShift, activeTab]);

  useEffect(() => {
    if (activeTab === 'history' || !isAdminOrManager) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, shiftFilter, statusFilter, departmentFilter, activeTab]);

  useEffect(() => {
    fetchEmployeesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/attendance/admin-mark', adminFormData);
      setIsModalOpen(false);
      fetchLiveRoster();
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record attendance');
    }
  };

  const openOverrideForEmployee = (empId, currentShift) => {
    setAdminFormData({
      employeeId: empId,
      date: liveDate || new Date().toISOString().split('T')[0],
      status: 'Present',
      workType: 'On-Site',
      shift: currentShift || 'Morning Shift (08:00 - 16:00)',
      notes: `${user?.role} status update`
    });
    setIsModalOpen(true);
  };

  // ──── GENERATE WORKFORCE REPORT ────
  const handleGenerateReport = async (e) => {
    e?.preventDefault();
    try {
      setReportLoading(true);
      const params = {
        timeframe: reportTimeframe,
        employeeId: reportEmployeeId
      };
      if (reportTimeframe === 'custom') {
        params.startDate = reportCustomStart;
        params.endDate = reportCustomEnd;
      }
      if (reportDept) params.department = reportDept;
      if (reportShift) params.shift = reportShift;

      const res = await API.get('/attendance/report', { params });
      setGeneratedReport(res.data);
      setReportStep('preview');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  // ──── PRINT / PDF GENERATION ────
  const handlePrintPDF = () => {
    if (!generatedReport) return;
    const rep = generatedReport;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download/print the PDF report.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${rep.meta.company} - Workforce Audit Report</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 15mm 20mm 15mm;
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              font-size: 11px;
              line-height: 1.4;
            }
            .header {
              border-bottom: 2px solid #0891b2;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .title-box h1 {
              margin: 0;
              font-size: 18px;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .title-box h2 {
              margin: 3px 0 0 0;
              font-size: 12px;
              color: #0891b2;
              font-weight: 600;
            }
            .meta-box {
              text-align: right;
              font-size: 10px;
              color: #64748b;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-bottom: 16px;
            }
            .card {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 8px 10px;
            }
            .card-label {
              font-size: 9px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: bold;
            }
            .card-value {
              font-size: 16px;
              font-weight: bold;
              color: #0f172a;
              margin-top: 2px;
            }
            .section-title {
              font-size: 12px;
              font-weight: bold;
              color: #0f172a;
              margin: 16px 0 8px 0;
              border-left: 3px solid #0891b2;
              padding-left: 6px;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 10px;
            }
            th {
              background: #0f172a;
              color: #ffffff;
              text-align: left;
              padding: 6px 8px;
              font-size: 9px;
              text-transform: uppercase;
            }
            td {
              padding: 5px 8px;
              border-bottom: 1px solid #e2e8f0;
            }
            tr:nth-child(even) {
              background: #f8fafc;
            }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 9px;
            }
            .badge-success { background: #dcfce7; color: #166534; }
            .badge-warning { background: #fef9c3; color: #854d0e; }
            .badge-danger { background: #fee2e2; color: #991b1b; }
            .recommendations-box {
              background: #f0fdf4;
              border: 1px solid #86efac;
              border-radius: 6px;
              padding: 10px 12px;
              margin-top: 14px;
            }
            .recommendations-box h3 {
              margin: 0 0 6px 0;
              font-size: 11px;
              color: #166534;
              text-transform: uppercase;
            }
            .recommendations-box ul {
              margin: 0;
              padding-left: 16px;
            }
            .recommendations-box li {
              margin-bottom: 4px;
              color: #1e293b;
            }
            .footer-sign {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #475569;
              page-break-inside: avoid;
            }
            .sign-line {
              border-top: 1px solid #94a3b8;
              width: 180px;
              text-align: center;
              padding-top: 4px;
            }
            @media print {
              .no-print { display: none; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title-box">
              <h1>${rep.meta.company}</h1>
              <h2>${rep.meta.reportType}</h2>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                Scope: <strong>${rep.meta.scope}</strong> • Period: <strong>${rep.meta.timeframeLabel}</strong>
              </div>
            </div>
            <div class="meta-box">
              <div>Date: <strong>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
              <div>Audited By: <strong>${rep.meta.generatedBy}</strong></div>
              <div>Report ID: <strong>LMW-WF-${Date.now().toString().slice(-6)}</strong></div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-label">Total Workforce</div>
              <div class="card-value">${rep.summary.totalWorkforce}</div>
            </div>
            <div class="card">
              <div class="card-label">Overall Attendance</div>
              <div class="card-value">${rep.summary.overallAttendance}%</div>
            </div>
            <div class="card">
              <div class="card-label">Total Working Hours</div>
              <div class="card-value">${rep.summary.totalWorkingHours} hrs</div>
            </div>
            <div class="card">
              <div class="card-label">Overtime Logged</div>
              <div class="card-value">${rep.summary.totalOvertimeHours} hrs</div>
            </div>
          </div>

          <div class="section-title">Workforce Attendance &amp; Production Performance Roster</div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Shift</th>
                <th style="text-align:center;">Days Present</th>
                <th style="text-align:center;">Hours Worked</th>
                <th style="text-align:center;">Overtime</th>
                <th style="text-align:center;">Punctuality</th>
                <th style="text-align:center;">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              ${rep.workerList.map(item => `
                <tr>
                  <td><strong>${item.employee.name}</strong> <span style="color:#64748b; font-size:8px;">(${item.employee.employeeId})</span></td>
                  <td>${item.employee.department}</td>
                  <td>${item.employee.shift.split(' ')[0]}</td>
                  <td style="text-align:center;">${item.presentCount} / ${item.recordsCount}</td>
                  <td style="text-align:center; font-weight:bold;">${item.totalHours}h</td>
                  <td style="text-align:center;">${item.overtimeHours > 0 ? '+' + item.overtimeHours + 'h' : '0h'}</td>
                  <td style="text-align:center;">${item.punctualityScore}%</td>
                  <td style="text-align:center;">
                    <span class="badge ${item.attendancePercent >= 85 ? 'badge-success' : item.attendancePercent >= 70 ? 'badge-warning' : 'badge-danger'}">
                      ${item.attendancePercent}%
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Strategic Manpower Planning &amp; Advisory</div>
          <div class="recommendations-box">
            <h3>Executive Recommendations for Future Production Capacity:</h3>
            <ul>
              ${rep.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div class="footer-sign">
            <div class="sign-line">Factory Floor Supervisor Signature</div>
            <div class="sign-line">Plant Operations Admin Approval</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredLiveList = availability?.availabilityList?.filter(item => {
    if (!liveStatusFilter) return true;
    return item.status === liveStatusFilter;
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Clock className="w-6 h-6 text-amber-600" />
            <span>{isAdminOrManager ? 'Live Workforce Roster & Attendance' : 'My Attendance Records'}</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {isAdminOrManager 
              ? 'Real-time active factory floor monitoring, live shifts, audit logs & future manpower reports' 
              : `Personal shift logs and clock-in/out records for ${user?.name}`}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* GENERATE WORKFORCE REPORT BUTTON (Admin/Manager) */}
          {isAdminOrManager && (
            <button
              onClick={() => {
                setReportStep('configure');
                setIsReportModalOpen(true);
              }}
              className="flex items-center justify-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition transform active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          )}

          {/* MANUAL ENTRY BUTTON */}
          {isAdminOrManager && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
          )}

          <button
            onClick={() => {
              if (activeTab === 'live') fetchLiveRoster();
              else fetchHistory();
            }}
            className="p-2 bg-[#F8F5EE] hover:bg-stone-100 text-stone-700 rounded-xl border border-stone-200 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${liveLoading || historyLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Admin / Manager Tab Switcher */}
      {isAdminOrManager && (
        <div className="flex items-center space-x-2 border-b border-stone-200/90 pb-3">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'live'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-stone-500 hover:text-stone-800 border border-stone-200/90'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Workforce Roster</span>
            {availability && (
              <span className="ml-1 px-2 py-0.5 bg-black/40 rounded-full text-[10px]">
                {availability.summary.present}/{availability.summary.totalActive}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-stone-500 hover:text-stone-800 border border-stone-200/90'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Attendance Logs &amp; History</span>
            <span className="ml-1 px-2 py-0.5 bg-black/40 rounded-full text-[10px]">
              {history.length}
            </span>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*               TAB 1: LIVE WORKFORCE ROSTER                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {isAdminOrManager && activeTab === 'live' && (
        <div className="space-y-6">
          
          {/* Live KPI Summary Cards */}
          {availability && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-stone-200/80 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-stone-500 text-[11px] font-semibold uppercase">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Total Active</span>
                </div>
                <div className="text-xl font-extrabold text-amber-600 mt-1">{availability.summary.totalActive}</div>
                <div className="text-[10px] text-stone-400">Registered workers</div>
              </div>

              <div className="bg-white border border-stone-200/80 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-stone-500 text-[11px] font-semibold uppercase">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Present Now</span>
                </div>
                <div className="text-xl font-extrabold text-emerald-400 mt-1">{availability.summary.present}</div>
                <div className="text-[10px] text-stone-400">On-site or active</div>
              </div>

              <div className="bg-white border border-stone-200/80 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-stone-500 text-[11px] font-semibold uppercase">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Late Arrivals</span>
                </div>
                <div className="text-xl font-extrabold text-yellow-400 mt-1">
                  {availability.availabilityList.filter(a => a.status === 'Late').length}
                </div>
                <div className="text-[10px] text-stone-400">Shift delay logged</div>
              </div>

              <div className="bg-white border border-stone-200/80 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-stone-500 text-[11px] font-semibold uppercase">
                  <CalendarOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>On Leave</span>
                </div>
                <div className="text-xl font-extrabold text-amber-400 mt-1">{availability.summary.onLeave}</div>
                <div className="text-[10px] text-stone-400">Approved leaves</div>
              </div>

              <div className="bg-white border border-stone-200/80 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-stone-500 text-[11px] font-semibold uppercase">
                  <UserX className="w-3.5 h-3.5 text-rose-400" />
                  <span>Absent</span>
                </div>
                <div className="text-xl font-extrabold text-rose-400 mt-1">{availability.summary.absent}</div>
                <div className="text-[10px] text-stone-400">Shift gap count</div>
              </div>

              <div className="bg-white border border-stone-200/80 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-stone-500 text-[11px] font-semibold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Availability</span>
                </div>
                <div className="text-xl font-extrabold text-blue-400 mt-1">{availability.summary.availabilityPercentage}%</div>
                <div className="text-[10px] text-stone-400">Workforce presence</div>
              </div>
            </div>
          )}

          {/* Live Filter Bar */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-lg backdrop-blur space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Roster Date</label>
                <input
                  type="date"
                  value={liveDate}
                  onChange={(e) => setLiveDate(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Department</label>
                <select
                  value={liveDept}
                  onChange={(e) => setLiveDept(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                  <option value="Quality">Quality</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Logistics">Logistics</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Shift</label>
                <select
                  value={liveShift}
                  onChange={(e) => setLiveShift(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Shifts</option>
                  <option value="Morning Shift (08:00 - 16:00)">Morning Shift (08:00 - 16:00)</option>
                  <option value="Evening Shift (16:00 - 00:00)">Evening Shift (16:00 - 00:00)</option>
                  <option value="Night Shift (00:00 - 08:00)">Night Shift (00:00 - 08:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Live Status Filter</label>
                <select
                  value={liveStatusFilter}
                  onChange={(e) => setLiveStatusFilter(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Present">Present Only</option>
                  <option value="Late">Late Only</option>
                  <option value="On Leave">On Leave Only</option>
                  <option value="Absent">Absent Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Workforce Roster Table */}
          <div className="bg-white border border-stone-200/90 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F8F5EE] border-b border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Live Factory Floor Workforce — Date: {liveDate}
                </span>
              </div>
              <span className="text-[10px] text-stone-500 bg-[#F8F5EE] px-2 py-0.5 rounded border border-stone-200">
                {filteredLiveList.length} Active Workers Listed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EE] text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200/70">
                  <tr>
                    <th className="px-4 py-3.5">Worker</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Shift</th>
                    <th className="px-4 py-3.5 text-center">Clock In</th>
                    <th className="px-4 py-3.5 text-center">Clock Out</th>
                    <th className="px-4 py-3.5">Working Mode</th>
                    <th className="px-4 py-3.5 text-center">Live Status</th>
                    <th className="px-4 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {liveLoading ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center text-stone-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-600" />
                        Loading live workforce roster...
                      </td>
                    </tr>
                  ) : filteredLiveList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center text-stone-400">
                        No workers found matching the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLiveList.map(({ employee, attendance, status }) => (
                      <tr key={employee._id} className="hover:bg-[#F8F5EE] transition">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-stone-900">{employee.name}</div>
                          <div className="text-[10px] text-stone-500 font-mono">
                            {employee.employeeId} • {employee.designation}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-stone-700">{employee.department}</td>
                        <td className="px-4 py-3.5 text-stone-700 text-[11px]">{employee.shift?.split(' ')[0]}</td>
                        <td className="px-4 py-3.5 text-center font-mono text-stone-700">
                          {attendance?.clockIn 
                            ? new Date(attendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-stone-700">
                          {attendance?.clockOut 
                            ? new Date(attendance.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : attendance?.clockIn ? (
                              <span className="text-emerald-400 font-sans font-semibold text-[11px] flex items-center justify-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>Active</span>
                              </span>
                            ) : '--:--'}
                        </td>
                        <td className="px-4 py-3.5 text-stone-700">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#F8F5EE] border border-stone-200 text-[10px]">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            <span>{attendance?.workType || 'On-Site'}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            status === 'Late' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                            status === 'On Leave' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => openOverrideForEmployee(employee._id, employee.shift)}
                            className="px-2.5 py-1 bg-[#F8F5EE] hover:bg-stone-100 text-stone-700 hover:text-white rounded-lg text-[10px] font-semibold border border-stone-200 transition"
                          >
                            Edit Status
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*               TAB 2: ATTENDANCE HISTORY LOGS                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {(!isAdminOrManager || activeTab === 'history') && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-lg backdrop-blur space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Shift</label>
                <select
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Shifts</option>
                  <option value="Morning Shift (08:00 - 16:00)">Morning Shift</option>
                  <option value="Evening Shift (16:00 - 00:00)">Evening Shift</option>
                  <option value="Night Shift (00:00 - 08:00)">Night Shift</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              {isAdminOrManager && (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1 uppercase">Department</label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="Quality">Quality</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Logistics">Logistics</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="bg-white border border-stone-200/80 rounded-2xl shadow-lg backdrop-blur overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F5EE] text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Employee</th>
                    <th className="px-4 py-3.5">Shift</th>
                    <th className="px-4 py-3.5">Clock In</th>
                    <th className="px-4 py-3.5">Clock Out</th>
                    <th className="px-4 py-3.5">Work Mode</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {historyLoading ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-stone-500">
                        Loading attendance history logs...
                      </td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-stone-500">
                        No attendance logs found matching filters.
                      </td>
                    </tr>
                  ) : (
                    history.map((record) => (
                      <tr key={record._id} className="hover:bg-stone-100/20 transition">
                        <td className="px-4 py-3 font-mono font-semibold text-stone-800">
                          {record.date}
                        </td>
                        <td className="px-4 py-3">
                          {record.employee ? (
                            <div>
                              <div className="font-bold text-stone-900">{record.employee.name}</div>
                              <div className="text-[10px] text-stone-500">{record.employee.employeeId} • {record.employee.department}</div>
                            </div>
                          ) : (
                            <span className="text-stone-400">System Employee</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-stone-700">{record.shift?.split(' ')[0]}</td>
                        <td className="px-4 py-3 font-mono text-stone-700">
                          {record.clockIn 
                            ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : '--:--'}
                        </td>
                        <td className="px-4 py-3 font-mono text-stone-700">
                          {record.clockOut 
                            ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : '--:--'}
                        </td>
                        <td className="px-4 py-3 text-stone-700 font-medium">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white border border-stone-200 text-[10px]">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            <span>{record.workType || 'On-Site'}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            record.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            record.status === 'Late' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                            record.status === 'On Leave' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500 italic text-[11px]">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*        MODAL: WORKFORCE REPORT GENERATOR & PDF EXPORT       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={reportStep === 'preview' ? 'Workforce Planning & Audit Report Preview' : 'Generate Workforce Planning Report'}
      >
        {reportStep === 'configure' ? (
          <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
            <p className="text-stone-500 text-xs">
              Select timeframes, workforce scope, and parameters to generate executive reports for future manpower &amp; shift planning.
            </p>

            {/* Timeframe Dropdown */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Select Timeframe</label>
              <select
                value={reportTimeframe}
                onChange={(e) => setReportTimeframe(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="1day">📅 1 Day (Today's Workforce Audit)</option>
                <option value="1week">📆 1 Week (Past 7 Days Output)</option>
                <option value="1month">🗓️ 1 Month (Past 30 Days Capacity)</option>
                <option value="1year">📈 1 Year (Annual Workforce Overview)</option>
                <option value="custom">🛠️ Custom Date Range...</option>
              </select>
            </div>

            {/* Custom Range pickers */}
            {reportTimeframe === 'custom' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F2]/70 border border-stone-200/90 rounded-xl">
                <div>
                  <label className="block text-stone-500 font-medium mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={reportCustomStart}
                    onChange={(e) => setReportCustomStart(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 font-medium mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={reportCustomEnd}
                    onChange={(e) => setReportCustomEnd(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Employee Filter: All vs Specific Individual Worker */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Workforce Scope</label>
              <select
                value={reportEmployeeId}
                onChange={(e) => setReportEmployeeId(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">👥 All Factory Workforce (Complete Company Report)</option>
                <optgroup label="Or Audit Specific Individual Worker:">
                  {employeesList.map(e => (
                    <option key={e._id} value={e._id}>
                      👤 {e.name} ({e.employeeId} - {e.department})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Department Filter */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Department</label>
                <select
                  value={reportDept}
                  onChange={(e) => setReportDept(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                  <option value="Quality">Quality</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Logistics">Logistics</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Shift</label>
                <select
                  value={reportShift}
                  onChange={(e) => setReportShift(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Shifts</option>
                  <option value="Morning Shift (08:00 - 16:00)">Morning Shift</option>
                  <option value="Evening Shift (16:00 - 00:00)">Evening Shift</option>
                  <option value="Night Shift (00:00 - 08:00)">Night Shift</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200/90">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 bg-[#F8F5EE] hover:bg-stone-100 text-stone-700 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportLoading}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
              >
                {reportLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling Report...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate &amp; View Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* PREVIEW REPORT STEP */
          generatedReport && (
            <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              {/* Header Box */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-stone-200/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-amber-600 uppercase tracking-wide">
                    {generatedReport.meta.company}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(generatedReport.meta.generatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-semibold text-stone-800 text-xs">
                  {generatedReport.meta.reportType}
                </div>
                <div className="text-[11px] text-stone-500">
                  Timeframe: <strong className="text-stone-800">{generatedReport.meta.timeframeLabel}</strong> • Scope: <strong className="text-stone-800">{generatedReport.meta.scope}</strong>
                </div>
              </div>

              {/* KPI Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-stone-900/30 p-3 rounded-xl border border-stone-200/90 text-center">
                  <div className="text-[10px] uppercase font-semibold text-stone-500">Total Workforce</div>
                  <div className="text-lg font-extrabold text-amber-600 mt-0.5">{generatedReport.summary.totalWorkforce}</div>
                </div>
                <div className="bg-stone-900/30 p-3 rounded-xl border border-stone-200/90 text-center">
                  <div className="text-[10px] uppercase font-semibold text-stone-500">Attendance %</div>
                  <div className="text-lg font-extrabold text-emerald-400 mt-0.5">{generatedReport.summary.overallAttendance}%</div>
                </div>
                <div className="bg-stone-900/30 p-3 rounded-xl border border-stone-200/90 text-center">
                  <div className="text-[10px] uppercase font-semibold text-stone-500">Hours Logged</div>
                  <div className="text-lg font-extrabold text-blue-400 mt-0.5">{generatedReport.summary.totalWorkingHours}h</div>
                </div>
                <div className="bg-stone-900/30 p-3 rounded-xl border border-stone-200/90 text-center">
                  <div className="text-[10px] uppercase font-semibold text-stone-500">Overtime Logged</div>
                  <div className="text-lg font-extrabold text-purple-400 mt-0.5">{generatedReport.summary.totalOvertimeHours}h</div>
                </div>
              </div>

              {/* Future Planning & Recommendations */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                <div className="font-bold text-emerald-400 text-xs flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Strategic Future Planning &amp; Advisory</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-700">
                  {generatedReport.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Table of Workers */}
              <div className="border border-stone-200/90 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#FAF7F2] text-stone-500 uppercase text-[9px] border-b border-stone-200/90">
                    <tr>
                      <th className="px-3 py-2">Worker</th>
                      <th className="px-3 py-2">Department</th>
                      <th className="px-3 py-2 text-center">Days</th>
                      <th className="px-3 py-2 text-center">Hours</th>
                      <th className="px-3 py-2 text-center">Overtime</th>
                      <th className="px-3 py-2 text-center">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {generatedReport.workerList.slice(0, 10).map((item) => (
                      <tr key={item.employee._id} className="hover:bg-[#FAF7F2]">
                        <td className="px-3 py-2 font-medium text-stone-800">
                          {item.employee.name} <span className="text-stone-400 text-[9px]">({item.employee.employeeId})</span>
                        </td>
                        <td className="px-3 py-2 text-stone-500">{item.employee.department}</td>
                        <td className="px-3 py-2 text-center text-stone-700">{item.presentCount}/{item.recordsCount}</td>
                        <td className="px-3 py-2 text-center font-bold text-stone-800">{item.totalHours}h</td>
                        <td className="px-3 py-2 text-center text-purple-400 font-semibold">{item.overtimeHours}h</td>
                        <td className="px-3 py-2 text-center text-emerald-400 font-bold">{item.attendancePercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {generatedReport.workerList.length > 10 && (
                  <div className="p-2 bg-[#FAF7F2] text-center text-[10px] text-stone-400">
                    + {generatedReport.workerList.length - 10} more employees included in final PDF export
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-200/90">
                <button
                  type="button"
                  onClick={() => setReportStep('configure')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#F8F5EE] hover:bg-stone-100 text-stone-700 rounded-xl transition text-xs font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Adjust Filters</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-3.5 py-1.5 bg-[#F8F5EE] hover:bg-stone-100 text-stone-700 rounded-xl font-medium transition"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintPDF}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow transition text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Download PDF / Print</span>
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*         MODAL: MANUAL ATTENDANCE OVERRIDE ENTRY             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Supervisor Manual Attendance Override"
      >
        <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-medium mb-1">Select Employee</label>
            <select
              required
              value={adminFormData.employeeId}
              onChange={(e) => setAdminFormData({ ...adminFormData, employeeId: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
            >
              {employeesList.map(e => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.employeeId} - {e.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Target Date</label>
              <input
                type="date"
                required
                value={adminFormData.date}
                onChange={(e) => setAdminFormData({ ...adminFormData, date: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Attendance Status</label>
              <select
                value={adminFormData.status}
                onChange={(e) => setAdminFormData({ ...adminFormData, status: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="On Leave">On Leave</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Work Mode</label>
              <select
                value={adminFormData.workType}
                onChange={(e) => setAdminFormData({ ...adminFormData, workType: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
              >
                <option value="On-Site">On-Site</option>
                <option value="Remote">Remote</option>
                <option value="Field">Field</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">Shift</label>
              <select
                value={adminFormData.shift}
                onChange={(e) => setAdminFormData({ ...adminFormData, shift: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
              >
                <option value="Morning Shift (08:00 - 16:00)">Morning Shift</option>
                <option value="Evening Shift (16:00 - 00:00)">Evening Shift</option>
                <option value="Night Shift (00:00 - 08:00)">Night Shift</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Supervisor Notes</label>
            <input
              type="text"
              value={adminFormData.notes}
              onChange={(e) => setAdminFormData({ ...adminFormData, notes: e.target.value })}
              placeholder="e.g. Approved shift swap or supervisor override"
              className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200/90">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-[#F8F5EE] text-stone-700 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow"
            >
              Record Attendance
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Attendance;
