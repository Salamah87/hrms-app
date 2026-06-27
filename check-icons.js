const l = require('lucide-react');
const names = Object.keys(l);
const search = ['CheckIn', 'CheckOut', 'ClockArrowUp', 'LogIn', 'LogOut', 'UserCheck', 'Fingerprint'];
search.forEach(s => {
  const found = names.includes(s);
  const similar = names.filter(n => n.toLowerCase().includes(s.toLowerCase())).slice(0,3);
  console.log(s, ':', found ? 'YES' : 'NO, similar:', similar.join(', '));
});
console.log('Total icons:', names.length);
// Find clock-related
console.log('Clock icons:', names.filter(n => n.startsWith('Clock')).slice(0,10).join(', '));
console.log('ArrowUp icons:', names.filter(n => n.startsWith('ArrowUp')).slice(0,5).join(', '));
