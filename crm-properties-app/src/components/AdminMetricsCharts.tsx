"use client";

import { Chart } from "react-google-charts";

type MetricsData = {
  usersCount: number;
  clientsCount: number;
  propertiesCount: number;
  interestsCount: number;
  activitiesCount: number;
};

type AdminMetricsChartsProps = {
  metrics: MetricsData;
};

// Reusable komponenta za prikaz Google Charts grafikona na admin stranici.
export default function AdminMetricsCharts({
  metrics,
}: AdminMetricsChartsProps) {
  // Podaci za bar chart.
  const barChartData = [
    ["Category", "Count"],
    ["Users", metrics.usersCount],
    ["Clients", metrics.clientsCount],
    ["Properties", metrics.propertiesCount],
    ["Interests", metrics.interestsCount],
    ["Activities", metrics.activitiesCount],
  ];

  // Podaci za pie chart.
  const pieChartData = [
    ["Category", "Count"],
    ["Clients", metrics.clientsCount],
    ["Properties", metrics.propertiesCount],
    ["Interests", metrics.interestsCount],
    ["Activities", metrics.activitiesCount],
  ];

  // Opcije za bar chart.
  const barChartOptions = {
    title: "System Data Overview",
    titleTextStyle: {
      color: "#ffffff",
      fontSize: 20,
      bold: true,
    },
    backgroundColor: "transparent",
    legend: {
      position: "none",
    },
    chartArea: {
      width: "70%",
      height: "70%",
    },
    hAxis: {
      minValue: 0,
      textStyle: {
        color: "#ffffff",
      },
      gridlines: {
        color: "rgba(255,255,255,0.08)",
      },
      baselineColor: "rgba(255,255,255,0.2)",
    },
    vAxis: {
      textStyle: {
        color: "#ffffff",
      },
    },
    colors: ["#ff8c1a"],
  };

  // Opcije za pie chart.
  const pieChartOptions = {
    title: "System Distribution",
    titleTextStyle: {
      color: "#ffffff",
      fontSize: 20,
      bold: true,
    },
    backgroundColor: "transparent",
    legend: {
      textStyle: {
        color: "#ffffff",
      },
    },
    pieSliceTextStyle: {
      color: "#111111",
      fontSize: 13,
    },
    colors: ["#ff8c1a", "#ffb15c", "#ffffff", "#d9d9d9"],
  };

  return (
    <div className="grid-2" style={{ marginTop: "28px" }}>
      <div className="app-card">
        <Chart
          chartType="BarChart"
          width="100%"
          height="360px"
          data={barChartData}
          options={barChartOptions}
        />
      </div>

      <div className="app-card">
        <Chart
          chartType="PieChart"
          width="100%"
          height="360px"
          data={pieChartData}
          options={pieChartOptions}
        />
      </div>
    </div>
  );
}