type DashboardCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  bgColor?: string;
  iconColor?: string;
  valueSize?: string;
};

export default function DashboardCard({
  title,
  value,
  icon,
  trend,
  bgColor = "bg-gradient-to-br from-[#E3B23C]/20 to-[#F3DC94]/20",
  iconColor = "text-[#E3B23C]",
  valueSize = "text-2xl sm:text-3xl",
}: DashboardCardProps) {
  // Check if value is a date string (contains month names or commas typical of dates)
  const isDateValue = typeof value === 'string' && (
    value.includes('Jan') || value.includes('Feb') || value.includes('Mar') || 
    value.includes('Apr') || value.includes('May') || value.includes('Jun') || 
    value.includes('Jul') || value.includes('Aug') || value.includes('Sep') || 
    value.includes('Oct') || value.includes('Nov') || value.includes('Dec')
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-[#E3B23C]/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-[#8B7E6A] font-medium mb-1">{title}</p>
          <h3 className={`${isDateValue ? 'text-lg sm:text-xl' : valueSize} font-bold text-[#2E2815] mb-2`}>{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-semibold">{trend}</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} p-2 sm:p-3 rounded-xl`}>
          <div className={`${iconColor} w-5 h-5 sm:w-6 sm:h-6`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
