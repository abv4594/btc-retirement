// Step 1–4: Retirement Inputs + Model Selection + BTC Required Calculation + Chart with Inflation & Retirement Years
"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function RetirementStep1() {
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [retirementYear, setRetirementYear] = useState(new Date().getFullYear() + 20);
  const [model, setModel] = useState("cagr_20");
  const [inflationRate, setInflationRate] = useState(0.02);
  const [retirementYears, setRetirementYears] = useState(25);
  const [btcRequired, setBtcRequired] = useState(null);
  const [btcData, setBtcData] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearsToRetirement = retirementYear - currentYear;

  const getProjectedBTCPrice = (yearOffset) => {
    const baseBTCPrice = 70000;
    const y = yearOffset !== undefined ? yearOffset : yearsToRetirement;
    switch (model) {
      case "cagr_15":
        return baseBTCPrice * Math.pow(1.15, y);
      case "cagr_20":
        return baseBTCPrice * Math.pow(1.20, y);
      case "cagr_30":
        return baseBTCPrice * Math.pow(1.30, y);
      default:
        return baseBTCPrice * Math.pow(1.20, y);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (monthlyIncome > 0 && retirementYear >= currentYear) {
      const annualIncomeToday = monthlyIncome * 12;

      const labels = [];
      const btcNeeded = [];
      let totalBTC = 0;

      for (let i = 0; i < retirementYears; i++) {
        const year = retirementYear + i;
        labels.push(year);

        const yearsSinceToday = year - currentYear;
        const inflatedIncome = annualIncomeToday * Math.pow(1 + inflationRate, yearsSinceToday);
        const btcPrice = getProjectedBTCPrice(yearsSinceToday);
        const btcForYear = inflatedIncome / btcPrice;
        btcNeeded.push(btcForYear);
        totalBTC += btcForYear;
      }

      setBtcRequired(totalBTC);
      setBtcData({
        labels,
        datasets: [
          {
            label: "BTC Required Per Year",
            data: btcNeeded,
            borderColor: "#1E40AF",
            backgroundColor: "rgba(30,64,175,0.2)",
            tension: 0.3,
            fill: true
          }
        ]
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 px-4">
      <h1 className="text-3xl font-bold mb-4">Step 1: Retirement Planning</h1>
      <p className="mb-6 text-center max-w-md">
        Let’s get started. Estimate your monthly income need, when you’d like to retire, expected inflation, and how long you’d like retirement to last.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Monthly Income (USD)</label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(parseFloat(e.target.value))}
            className="w-full border px-4 py-2 rounded"
            min={0}
            step={50}
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Retirement Year</label>
          <input
            type="number"
            value={retirementYear}
            onChange={(e) => setRetirementYear(parseInt(e.target.value))}
            className="w-full border px-4 py-2 rounded"
            min={currentYear}
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Inflation Rate (e.g. 0.02 = 2%)</label>
          <input
            type="number"
            value={inflationRate}
            onChange={(e) => setInflationRate(parseFloat(e.target.value))}
            className="w-full border px-4 py-2 rounded"
            step={0.01}
            min={0}
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Years in Retirement</label>
          <input
            type="number"
            value={retirementYears}
            onChange={(e) => setRetirementYears(parseInt(e.target.value))}
            className="w-full border px-4 py-2 rounded"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Choose BTC Growth Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="cagr_15">CAGR 15%</option>
            <option value="cagr_20">CAGR 20%</option>
            <option value="cagr_30">CAGR 30%</option>
            <option value="log">Log Regression (est. 20%)</option>
            <option value="s2f">Stock-to-Flow (est. 30%)</option>
            <option value="custom">Custom Model</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Next →
        </button>
      </form>

      {btcRequired !== null && (
        <div className="mt-10 text-center w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-2">Total BTC Required for Retirement</h2>
          <p className="text-lg mb-6">≈ {btcRequired.toFixed(4)} BTC</p>
          {typeof window !== "undefined" && btcData && (
            <Line
              data={btcData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                  y: {
                    title: { display: true, text: 'BTC Needed' }
                  },
                  x: {
                    title: { display: true, text: 'Year' }
                  }
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
