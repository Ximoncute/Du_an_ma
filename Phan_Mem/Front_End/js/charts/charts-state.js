// js/charts/charts-state.js
const generateInitialLabels = () => {
  const labels = [];
  const now = Date.now();
  for (let i = 7; i >= 0; i--) {
    const time = new Date(now - i * 5000); // 5 seconds interval
    labels.push(time.toTimeString().split(' ')[0]);
  }
  return labels;
};

export const chartLabels = generateInitialLabels();
export const baseTempData = [25.0, 25.1, 24.9, 25.0, 25.2, 25.1, 25.0, 25.0];
export const baseHumidData = [60, 61, 60, 59, 60, 62, 60, 60];
export const baseLightData = [300, 305, 300, 295, 300, 310, 300, 300];

export const tempChart = { val: null };
export const humidChart = { val: null };
export const lightChart = { val: null };
export const useFallbackCharts = { val: false };
