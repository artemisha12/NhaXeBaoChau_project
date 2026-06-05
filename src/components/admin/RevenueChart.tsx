'use client';

import { useState } from 'react';
import { useAdmin } from "@/context/AdminContext";

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function formatMoneyShort(value: number) {
  if (value >= 1000000) {
    const m = value / 1000000;
    return m % 1 === 0 ? m.toFixed(0) + 'tr' : m.toFixed(1) + 'tr';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'k';
  }
  return String(value);
}

function getBezierPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = (p1.x - p0.x) * 0.35;
    path += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return path;
}

function getAreaPath(points: { x: number; y: number }[], height: number) {
  if (points.length === 0) return '';
  const curve = getBezierPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${curve} L ${last.x} ${height} L ${first.x} ${height} Z`;
}

interface SmoothAreaChartProps {
  data: { label: string; date: string; revenue: number; count: number; allCount: number }[];
  maxValue: number;
  todayStr: string;
}

function SmoothAreaChart({ data, maxValue, todayStr }: SmoothAreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG dimensions
  const width = 600;
  const height = 192; // matching h-48

  const topPadding = 20;
  const bottomPadding = 10;
  const leftPadding = 15;
  const rightPadding = 15;

  const plotWidth = width - leftPadding - rightPadding;
  const plotHeight = height - topPadding - bottomPadding;

  const points = data.map((day, i) => {
    const x = leftPadding + (data.length > 1 ? (i / (data.length - 1)) * plotWidth : 0);
    const y = topPadding + plotHeight - (maxValue > 0 ? (day.revenue / maxValue) * plotHeight : 0);
    return { x, y, ...day };
  });

  const bezierPath = getBezierPath(points);
  const areaPath = getAreaPath(points, topPadding + plotHeight);
  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c88925" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#c88925" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c88925" />
            <stop offset="50%" stopColor="#e6a93a" />
            <stop offset="100%" stopColor="#c88925" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid Lines */}
        {[0, 1, 2, 3, 4].map((step) => {
          const y = topPadding + (step / 4) * plotHeight;
          return (
            <line
              key={step}
              x1={leftPadding}
              y1={y}
              x2={leftPadding + plotWidth}
              y2={y}
              stroke="#e2e8f0"
              strokeOpacity="0.6"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        {/* Area fill */}
        {points.length > 0 && (
          <path d={areaPath} fill="url(#areaGradient)" />
        )}

        {/* Smooth line */}
        {points.length > 0 && (
          <path
            d={bezierPath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Hover vertical dashed line */}
        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={topPadding}
            x2={hoveredPoint.x}
            y2={topPadding + plotHeight}
            stroke="#c88925"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        )}

        {/* Dots on line */}
        {points.map((pt, i) => {
          if (!pt.revenue) return null;
          const showDot = data.length <= 7 || hoveredIdx === i;
          if (!showDot) return null;
          const isTodayPoint = pt.date === todayStr;

          return (
            <g key={pt.date} className="transition-all duration-300">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? 6 : 4}
                fill={isTodayPoint ? '#fff' : '#c88925'}
                stroke={isTodayPoint ? '#c88925' : '#fff'}
                strokeWidth={hoveredIdx === i ? 3 : 2}
              />
            </g>
          );
        })}

        {/* Hover detection rects */}
        {points.map((pt, i) => {
          const stepWidth = plotWidth / (data.length - 1 || 1);
          const rectX = pt.x - stepWidth / 2;
          return (
            <rect
              key={pt.date}
              x={rectX}
              y={0}
              width={stepWidth}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 transition-all duration-150"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100 - 64}%`,
          }}
        >
          <div className="bg-[#04101b] text-white text-[10px] font-bold py-2 px-3 rounded-xl shadow-2xl border border-white/10 text-center whitespace-nowrap">
            <p className="text-slate-400 text-[9px] font-extrabold uppercase tracking-wider">{hoveredPoint.label}</p>
            <p className="text-[#f8c95c] font-black text-xs mt-0.5">{formatMoney(hoveredPoint.revenue)}</p>
            <p className="text-slate-300 font-medium text-[9px] mt-0.5">
              {hoveredPoint.count} xác nhận · {hoveredPoint.allCount} tổng
            </p>
          </div>
          <div className="w-1.5 h-1.5 bg-[#04101b] rotate-45 mx-auto -mt-1 border-r border-b border-white/10"></div>
        </div>
      )}
    </div>
  );
}

export default function RevenueChart() {
  const { bookings, packages } = useAdmin();
  const now = new Date();

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [viewMode, setViewMode] = useState<'week' | 'month' | 'route'>('week');

  // --- Weekly data ---
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const todayStr = getLocalDateString(now);
  const currentMonthStr = todayStr.slice(0, 7);
  const weekDays: { label: string; date: string; dayName: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    weekDays.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      date: getLocalDateString(d),
      dayName: dayNames[d.getDay()],
    });
  }

  const weeklyRevenue = weekDays.map((day) => {
    const confirmed = bookings.filter(
      (b) => b.travelDate === day.date && (b.status === 'completed')
    );
    const revenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);
    const count = confirmed.length;
    const allCount = bookings.filter(b => b.travelDate === day.date && b.status !== 'cancelled').length;
    return { ...day, revenue, count, allCount };
  });

  const maxWeekly = Math.max(...weeklyRevenue.map((d) => d.revenue), 1);
  const totalWeekRevenue = weeklyRevenue.reduce((sum, d) => sum + d.revenue, 0);
  const totalWeekOrders = weeklyRevenue.reduce((sum, d) => sum + d.count, 0);

  // Max revenue day
  const peakDay = weeklyRevenue.reduce(
    (max, d) => (d.revenue > max.revenue ? d : max),
    { dayName: '', label: '', date: '', revenue: 0 }
  );
  const averageBookingValue = totalWeekOrders > 0 ? Math.round(totalWeekRevenue / totalWeekOrders) : 0;

  // --- Monthly calculations ---
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthDays: { label: string; date: string; dayNum: number }[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentYear, currentMonth, i);
    const dayStr = getLocalDateString(d);
    monthDays.push({
      label: `${i}/${currentMonth + 1}`,
      date: dayStr,
      dayNum: i,
    });
  }

  const monthlyRevenueData = monthDays.map((day) => {
    const confirmed = bookings.filter(
      (b) => b.travelDate === day.date && (b.status === 'completed')
    );
    const revenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);
    const count = confirmed.length;
    const allCount = bookings.filter(b => b.travelDate === day.date && b.status !== 'cancelled').length;
    return { ...day, revenue, count, allCount };
  });

  const maxMonthly = Math.max(...monthlyRevenueData.map((d) => d.revenue), 1);
  const totalMonthRevenue = monthlyRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalMonthOrders = monthlyRevenueData.reduce((sum, d) => sum + d.count, 0);
  const peakMonthDay = monthlyRevenueData.reduce(
    (max, d) => (d.revenue > max.revenue ? d : max),
    { dayNum: 0, label: '', date: '', revenue: 0 }
  );
  const averageMonthBookingValue = totalMonthOrders > 0 ? Math.round(totalMonthRevenue / totalMonthOrders) : 0;

  // Helper to identify private vs shared bookings
  const isPrivateTrip = (b: any) => {
    const routePkgs = packages.filter(p => p.routeName === b.routeName);
    const hasPrivateMatch = routePkgs.some(p => p.type === 'private-trip' && p.price === b.totalPrice);
    if (hasPrivateMatch) return true;
    return b.totalPrice >= 1000000;
  };

  // Dynamic Xe ghép vs Bao xe split based on selected view mode
  const currentPeriodBookings = bookings.filter((b) => {
    if (b.status !== 'completed') return false;
    if (viewMode === 'week') {
      const weekDatesStr = weekDays.map((wd) => wd.date);
      return weekDatesStr.includes(b.travelDate);
    } else {
      // For month and route views, use current month's bookings
      return b.travelDate?.startsWith(currentMonthStr);
    }
  });

  const sharedRevenue = currentPeriodBookings
    .filter(b => !isPrivateTrip(b))
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const privateRevenue = currentPeriodBookings
    .filter(b => isPrivateTrip(b))
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const totalPeriodRevenue = sharedRevenue + privateRevenue;
  const sharedPct = totalPeriodRevenue > 0 ? Math.round((sharedRevenue / totalPeriodRevenue) * 100) : 0;
  const privatePct = totalPeriodRevenue > 0 ? (100 - sharedPct) : 0;

  // --- Route data ---
  const routeMap: Record<string, { revenue: number; count: number; pending: number }> = {};
  bookings.forEach((b) => {
    if (!routeMap[b.routeName]) routeMap[b.routeName] = { revenue: 0, count: 0, pending: 0 };
    if (b.status === 'completed') {
      routeMap[b.routeName].revenue += b.totalPrice;
      routeMap[b.routeName].count += 1;
    }
    if (b.status === 'new') routeMap[b.routeName].pending += 1;
  });
  const routeRevenues = Object.entries(routeMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.revenue - a.revenue);
  const totalRouteRevenue = routeRevenues.reduce((s, r) => s + r.revenue, 0);

  // --- Summary ---
  const monthlyActual = bookings
    .filter(b => b.travelDate?.startsWith(currentMonthStr) && (b.status === 'completed'))
    .reduce((s, b) => s + b.totalPrice, 0);
  const monthlyProjected = bookings
    .filter(b => b.travelDate?.startsWith(currentMonthStr) && b.status !== 'cancelled')
    .reduce((s, b) => s + b.totalPrice, 0);
  const todayRevenue = bookings
    .filter(b => b.travelDate === todayStr && (b.status === 'completed'))
    .reduce((s, b) => s + b.totalPrice, 0);

  // Y-axis labels for the chart
  const selectedMax = viewMode === 'week' ? maxWeekly : viewMode === 'month' ? maxMonthly : 1;
  const yAxisSteps = 5;
  const yLabels: string[] = [];
  for (let i = yAxisSteps; i >= 0; i--) {
    yLabels.push(formatMoneyShort(Math.round((selectedMax / yAxisSteps) * i)));
  }

  // Route colors
  const routeGradients = [
    { from: '#c88925', to: '#e6a93a', bg: 'rgba(200,137,37,0.08)' },
    { from: '#059669', to: '#34d399', bg: 'rgba(5,150,105,0.08)' },
    { from: '#6366f1', to: '#a5b4fc', bg: 'rgba(99,102,241,0.08)' },
    { from: '#e11d48', to: '#fda4af', bg: 'rgba(225,29,72,0.08)' },
    { from: '#0284c7', to: '#7dd3fc', bg: 'rgba(2,132,199,0.08)' },
  ];

  return (
    <div className="rounded-2xl bg-[#fffdf8] font-sans border border-amber-100 overflow-hidden">
      {/* ===== TOP SECTION: Dark Header with Summary ===== */}
      <div className="bg-gradient-to-r from-[#04101b] via-[#0a1d2c] to-[#123047] px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thống kê doanh thu</p>
            <h3 className="text-lg font-black text-white mt-1">Biểu đồ doanh thu</h3>
          </div>
          {/* Toggle */}
          <div className="flex rounded-xl bg-white/10 backdrop-blur-sm p-1 shrink-0">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                viewMode === 'week'
                  ? 'bg-[#c88925] text-white shadow-lg shadow-[#c88925]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                viewMode === 'month'
                  ? 'bg-[#c88925] text-white shadow-lg shadow-[#c88925]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setViewMode('route')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                viewMode === 'route'
                  ? 'bg-[#c88925] text-white shadow-lg shadow-[#c88925]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Theo tuyến
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Hôm nay</p>
            <p className="text-xl font-black text-[#f8c95c] mt-1 leading-tight">{formatMoney(todayRevenue)}</p>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Thực nhận T{now.getMonth() + 1}</p>
            <p className="text-xl font-black text-emerald-400 mt-1 leading-tight">{formatMoney(monthlyActual)}</p>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Dự kiến T{now.getMonth() + 1}</p>
            <p className="text-xl font-black text-white mt-1 leading-tight">{formatMoney(monthlyProjected)}</p>
          </div>
        </div>
      </div>

      {/* ===== CHART CONTENT ===== */}
      <div className="p-6">
        {viewMode === 'week' ? (
          /* ====== WEEKLY AREA CHART ====== */
          <div className="space-y-5">
            {/* Chart header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-sm font-black text-slate-900">Doanh thu 7 ngày gần đây</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tổng: <span className="font-black text-[#c88925]">{formatMoney(totalWeekRevenue)}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-bold">{totalWeekOrders} đơn thành công</span>
                </p>
              </div>

              {/* Trip type split bar */}
              {totalPeriodRevenue > 0 && (
                <div className="w-full md:w-64 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shrink-0">
                  <div className="flex justify-between text-[9px] font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#c88925]"></span>
                      Xe ghép ({sharedPct}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#123047]"></span>
                      Bao xe ({privatePct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-[#f8c95c] to-[#c88925]" style={{ width: `${sharedPct}%` }}></div>
                    <div className="h-full bg-gradient-to-r from-[#2d6fa0] to-[#123047]" style={{ width: `${privatePct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-900 mt-1">
                    <span>{formatMoneyShort(sharedRevenue)}</span>
                    <span>{formatMoneyShort(privateRevenue)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chart with Y-axis */}
            <div className="flex gap-3">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between text-[10px] font-black text-slate-400 h-48 w-12 shrink-0 text-right pr-2 select-none py-1.5">
                {yLabels.map((label, i) => (
                  <span key={i} className="leading-none">{label}</span>
                ))}
              </div>

              {/* Chart area */}
              <div className="flex-1 relative h-48">
                <SmoothAreaChart data={weeklyRevenue} maxValue={maxWeekly} todayStr={todayStr} />
              </div>
            </div>

            {/* X-axis Days */}
            <div className="flex gap-3">
              <div className="w-12 shrink-0"></div>
              <div className="flex-1 flex gap-2 sm:gap-4 px-2">
                {weeklyRevenue.map((day) => {
                  const isToday = day.date === todayStr;
                  return (
                    <div key={day.date} className="flex-1 text-center">
                      <div className={`inline-block px-2 py-1 rounded-xl transition ${
                        isToday ? 'bg-[#c88925]/10' : ''
                      }`}>
                        <p className={`text-[11px] font-black leading-tight ${isToday ? 'text-[#c88925]' : 'text-slate-900'}`}>
                          {day.dayName}
                        </p>
                        <p className={`text-[9px] font-bold mt-0.5 leading-none ${isToday ? 'text-[#c88925]' : 'text-slate-400'}`}>
                          {day.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-col sm:flex-row gap-0 pt-4 border-t border-slate-200 mt-4">
              <div className="flex-1 py-2 sm:py-0 sm:pr-6">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Ngày cao nhất</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {peakDay.revenue > 0 ? `${peakDay.dayName} (${peakDay.label})` : '—'}
                </p>
                <p className="text-xs font-semibold text-[#c88925]">
                  {peakDay.revenue > 0 ? formatMoney(peakDay.revenue) : '0đ'}
                </p>
              </div>
              <div className="flex-1 py-2 sm:py-0 sm:px-6 sm:border-x border-slate-200">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Hiệu suất đơn</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{totalWeekOrders} đơn thành công</p>
                <p className="text-xs text-slate-400">Trong 7 ngày qua</p>
              </div>
              <div className="flex-1 py-2 sm:py-0 sm:pl-6">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Trung bình/đơn</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{formatMoney(averageBookingValue)}</p>
                <p className="text-xs text-emerald-600 font-medium">Giá trị trung bình</p>
              </div>
            </div>
          </div>
        ) : viewMode === 'month' ? (
          /* ====== MONTHLY AREA CHART ====== */
          <div className="space-y-5">
            {/* Chart header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-sm font-black text-slate-900">Doanh thu tháng này (T{now.getMonth() + 1})</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tổng: <span className="font-black text-[#c88925]">{formatMoney(totalMonthRevenue)}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-bold">{totalMonthOrders} đơn thành công</span>
                </p>
              </div>

              {/* Trip type split bar */}
              {totalPeriodRevenue > 0 && (
                <div className="w-full md:w-64 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shrink-0">
                  <div className="flex justify-between text-[9px] font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#c88925]"></span>
                      Xe ghép ({sharedPct}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#123047]"></span>
                      Bao xe ({privatePct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-[#f8c95c] to-[#c88925]" style={{ width: `${sharedPct}%` }}></div>
                    <div className="h-full bg-gradient-to-r from-[#2d6fa0] to-[#123047]" style={{ width: `${privatePct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-900 mt-1">
                    <span>{formatMoneyShort(sharedRevenue)}</span>
                    <span>{formatMoneyShort(privateRevenue)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chart with Y-axis */}
            <div className="flex gap-3">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between text-[10px] font-black text-slate-400 h-48 w-12 shrink-0 text-right pr-2 select-none py-1.5">
                {yLabels.map((label, i) => (
                  <span key={i} className="leading-none">{label}</span>
                ))}
              </div>

              {/* Chart area */}
              <div className="flex-1 relative h-48">
                <SmoothAreaChart data={monthlyRevenueData} maxValue={maxMonthly} todayStr={todayStr} />
              </div>
            </div>

            {/* X-axis Days */}
            <div className="flex gap-3">
              <div className="w-12 shrink-0"></div>
              <div className="flex-1 flex justify-between px-2 text-[10px] font-black text-slate-400 mt-3 select-none">
                {monthlyRevenueData.map((day, i) => {
                  const showLabel = i === 0 || i === monthlyRevenueData.length - 1 || (i + 1) % 5 === 0;
                  if (!showLabel) return <div key={day.date} className="w-0 h-0 overflow-hidden"></div>;
                  const isToday = day.date === todayStr;
                  return (
                    <div key={day.date} className="text-center">
                      <div className={`px-1.5 py-0.5 rounded-lg ${isToday ? 'bg-[#c88925]/10 text-[#c88925]' : 'text-slate-400'}`}>
                        {day.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-col sm:flex-row gap-0 pt-4 border-t border-slate-200 mt-4">
              <div className="flex-1 py-2 sm:py-0 sm:pr-6">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Ngày cao nhất</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {peakMonthDay.revenue > 0 ? `Ngày ${peakMonthDay.dayNum}` : '—'}
                </p>
                <p className="text-xs font-semibold text-[#c88925]">
                  {peakMonthDay.revenue > 0 ? formatMoney(peakMonthDay.revenue) : '0đ'}
                </p>
              </div>
              <div className="flex-1 py-2 sm:py-0 sm:px-6 sm:border-x border-slate-200">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Hiệu suất đơn</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{totalMonthOrders} đơn thành công</p>
                <p className="text-xs text-slate-400">Trong tháng này</p>
              </div>
              <div className="flex-1 py-2 sm:py-0 sm:pl-6">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Trung bình/đơn</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{formatMoney(averageMonthBookingValue)}</p>
                <p className="text-xs text-emerald-600 font-medium">Giá trị trung bình</p>
              </div>
            </div>
          </div>
        ) : (
          /* ====== ROUTE REVENUE ====== */
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-black text-slate-900">Phân tích doanh thu theo tuyến</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tổng doanh thu: <span className="font-black text-[#c88925]">{formatMoney(totalRouteRevenue)}</span>
              </p>
            </div>

            {routeRevenues.length > 0 ? (
              <div className="space-y-3">
                {routeRevenues.map((route, idx) => {
                  const pct = totalRouteRevenue > 0 ? (route.revenue / totalRouteRevenue) * 100 : 0;
                  const color = routeGradients[idx % routeGradients.length];
                  return (
                    <div
                      key={route.name}
                      className="rounded-2xl p-4 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(16,32,51,0.06)]"
                      style={{ background: color.bg }}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          {/* Color dot */}
                          <div
                            className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                          />
                          <span className="font-semibold text-slate-900 text-sm">{route.name}</span>
                          <div className="flex gap-1.5">
                            <span className="text-[10px] font-bold bg-white/80 text-slate-600 px-2 py-0.5 rounded-lg shadow-sm">
                              {route.count} đơn
                            </span>
                            {route.pending > 0 && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg">
                                +{route.pending} chờ
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm" style={{ color: color.from }}>
                            {formatMoney(route.revenue)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 ml-1.5">
                            ({pct.toFixed(0)}%)
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-white/60 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{
                            width: `${Math.max(pct, 3)}%`,
                            background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 italic">
                Chưa có doanh thu nào được ghi nhận.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
