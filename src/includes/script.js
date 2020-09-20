try {
  localStorage.getItem('isDarkModeOn');
} catch {
  localStorage.setItem('isDarkModeOn', 'false');
}
const light = {
  '--background-color': 'rgb(249, 249, 249)',
  '--text-color': 'rgb(49, 49, 49)',
};
const dark = {
  '--background-color': 'rgb(29, 29, 29)',
  '--text-color': 'rgb(249, 249, 249)',
};
const setMode = (isDarkModeOn) => {
  document.getElementById('darkmode-toggle').style.display =
    isDarkModeOn === 'true' ? 'none' : 'inherit';
  document.getElementById('lightmode-toggle').style.display =
    isDarkModeOn !== 'true' ? 'none' : 'inherit';

  Object.entries(isDarkModeOn === 'true' ? dark : light).forEach(
    ([key, val]) => {
      document.body.style.setProperty(key, val);
    }
  );
};
const toggleMode = () => {
  const isDarkModeOn = localStorage.getItem('isDarkModeOn');
  const inverse = isDarkModeOn === 'false' ? 'true' : 'false';
  setMode(inverse);
  localStorage.setItem('isDarkModeOn', inverse);
};
window.addEventListener('DOMContentLoaded', () => {
  isDarkModeOn = localStorage.getItem('isDarkModeOn');
  setMode(isDarkModeOn);
});
