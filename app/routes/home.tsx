import { useLoaderData } from "react-router-dom";
import type { Monitor } from "./+types/Monitor";

interface MonitorDisplay extends Monitor {}

export async function loader() {
  const API_BASE = "http://localhost:3000/api";
  try {
    const monitorsResponse = await fetch(`${API_BASE}/monitors`);
    if (!monitorsResponse.ok) {
      throw new Error(`Error loading monitors: ${monitorsResponse.statusText}`);
    }
    const monitors: Monitor[] = await monitorsResponse.json();

    return { monitors: monitors as MonitorDisplay[] };
  } catch (error) {
    console.error("Error loading monitors:", error);
    return { monitors: [] };
  }
}

export function meta() {
  return [
    { title: "Quanta Monitor | Dashboard" },
    { name: "description", content: "Overview of all tracked monitors." },
  ];
}

const MonitorCard = ({ monitor }: { monitor: MonitorDisplay }) => {
  const statusColor = monitor.isActive ? "text-green-400" : "text-[#F8604A]";
  const statusText = monitor.isActive ? "Active" : "Inactive";

  return (
    <div className="bg-[#222224] p-6 rounded-xl shadow-2xl border border-[#808081]/20 hover:border-[#F8604A] transition duration-300">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-[#FFFFFF] truncate">
          {monitor.name}
        </h3>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${monitor.isActive ? "bg-green-900/50" : "bg-[#F8604A]/30"} ${statusColor}`}
        >
          {statusText}
        </span>
      </div>

      <div className="space-y-1 text-sm text-[#808081]">
        <p className="truncate">
          <span className="font-medium text-[#FFFFFF]">URL:</span> {monitor.url}
        </p>
        <p>
          <span className="font-medium text-[#FFFFFF]">Interval:</span>{" "}
          {monitor.interval} min
        </p>
      </div>
      <p className="text-xs text-[#808081] mt-4 pt-2 border-t border-[#808081]/20">
        Updated: {new Date(monitor.updatedAt).toLocaleTimeString()}
      </p>
    </div>
  );
};

export default function HomePage() {
  const { monitors } = useLoaderData() as { monitors: MonitorDisplay[] };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {monitors.length > 0 ? (
          monitors.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))
        ) : (
          <div className="text-[#808081] col-span-full p-8 bg-[#222224] border border-[#808081]/20 rounded-lg text-center">
            No monitors configured. Go to Settings to add one.
          </div>
        )}
      </div>
    </main>
  );
}
