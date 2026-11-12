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
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-[#E3B23C]/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-[#8B7E6A] font-medium mb-1">{title}</p>
          <h3 className={`${valueSize} font-bold text-[#2E2815] mb-2`}>{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-semibold">{trend}</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} p-3 sm:p-4 rounded-xl`}>
          <div className={`${iconColor} w-6 h-6 sm:w-8 sm:h-8`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
