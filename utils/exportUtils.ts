import { ExpenseRecord } from '../types';

/**
 * Converts records to a CSV format compatible with Excel (using BOM for UTF-8 support).
 * 
 * Updated Requirements:
 * 1. Columns: Date, Department(Personnel), Amount
 * 2. Personnel grouped by Department: Dept(Name1, Name2)
 * 3. Departments sorted by Quality > Tech > Others
 * 4. Total amount at the bottom
 */
export const exportToExcel = (
  records: ExpenseRecord[], 
  filename: string,
  getDept: (personName: string) => string
) => {
  // Sorting Helper
  const getDeptPriority = (deptName: string) => {
    if (deptName === '品質部') return 0;
    if (deptName === '技術部') return 1;
    return 99;
  };

  // 1. CSV Header
  const headers = ['日期', '部門(人員)', '金額'];
  
  // 2. CSV Rows
  let totalAmount = 0;

  const rows = records.map(r => {
    totalAmount += r.amount;

    // Group personnel by department
    const groups: { [key: string]: string[] } = {};
    r.personnel.forEach(p => {
      const dept = getDept(p);
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(p);
    });

    // Sort Departments
    const sortedDepts = Object.keys(groups).sort((a, b) => {
      const priA = getDeptPriority(a);
      const priB = getDeptPriority(b);
      return priA - priB;
    });

    // Format: "Dept(Name1,Name2) Dept(Name3)"
    // Using space as separator between departments for readability in CSV cell
    const personnelString = sortedDepts
      .map(dept => `${dept}(${groups[dept].join(',')})`)
      .join(' ');

    return [
      r.date,
      `"${personnelString}"`, // Quote to handle content
      r.amount
    ];
  });

  // 3. Add Total Row
  // Empty first column, Total Label in second, Amount in third
  rows.push(['', '總計', totalAmount]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  // Add BOM for Excel to recognize UTF-8
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};