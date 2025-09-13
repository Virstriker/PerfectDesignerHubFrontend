import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyWorkService } from '../../services/daily-work.service';
import { ResponseDto } from '../../interfaces/customer';
import { HttpClientModule } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WorkEntry {
  id: number;
  name: string;
  employeeId:number;
  workDate: Date;
  workDetail: string;
  workAmount: number;
}

interface Employee {
  id: number;
  employeeName: string;
}

@Component({
  selector: 'app-daily-work',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers:[DailyWorkService],
  templateUrl: './daily-work.component.html',
  styleUrl: './daily-work.component.css'
})
export class DailyWorkComponent implements OnInit {
  selectedEmployee: number = 0;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  workEntries: WorkEntry[] = [];
  showDialog = false;
  employees: Employee[] = [
    { id: 1, employeeName: 'John Doe' },
    { id: 2, employeeName: 'Jane Smith' },
    { id: 3, employeeName: 'abc' }
  ];
  Withdraw:boolean = false;
  totalWork:number = 0;
  
  // Month and year options
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  availableYears: number[] = [];

  constructor(private dailyWorkService:DailyWorkService){
    // Generate available years (current year and 2 years back)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 2; i--) {
      this.availableYears.push(i);
    }
  }
  newWork = {
    employeeId: 0,
    workDetail: '',
    workAmount: 0
  };
  getDailyWorkOfEmployee(){
    if (this.selectedEmployee && this.selectedYear && this.selectedMonth) {
      this.dailyWorkService.getDailyWorksByMonth(this.selectedEmployee, this.selectedYear, this.selectedMonth).subscribe({
        next:(response:ResponseDto)=>{
          this.workEntries = response.responseObject;
          this.totalWork = this.workEntries.reduce((sum, entry) => sum + entry.workAmount, 0);
        }
      });
    }
  }
  ngOnInit() {
    // Sample data - replace with actual data source
    this.dailyWorkService.getEmployee().subscribe({
      next:(response:ResponseDto)=>{
        this.employees = response.responseObject;
      }
    })
  }

  getGroupedWork() {
    const filtered = this.workEntries;
    return this.groupByWeek(filtered);
  }

  isDebit(amount: number): boolean {
    return amount < 0; // Returns true if the amount is negative
  }

  isCredit(amount: number): boolean {
    return amount > 0; // Returns true if the amount is positive
  }

  private groupByWeek(entries: WorkEntry[]) {
    const groups = new Map<string, WorkEntry[]>();
    
    entries.forEach(entry => {
      const weekStart = this.getWeekStart(entry.workDate);
      const key = weekStart.toISOString();
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(entry);
    });

    return Array.from(groups.entries())
      .map(([key, work]) => ({
        weekStart: new Date(key),
        // Ensure workDate is a Date object before sorting
        work: work.sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime())
      }))
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }

  openDialog() {
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.newWork = { employeeId: 0, workDetail: '', workAmount: 0 };
  }

  submitWork() {
    if (this.newWork.employeeId) {
      if(this.Withdraw){
        this.newWork.workAmount = this.newWork.workAmount - 2*this.newWork.workAmount;
      }
      this.dailyWorkService.addDailyWork(this.newWork).subscribe({
        next:(respone:ResponseDto)=>{
          if(respone.isSuccess){
            alert(respone.message);
            this.getDailyWorkOfEmployee();
            this.closeDialog();
          }else{
            alert(respone.message);
          }
        }
      });
      this.closeDialog();
    }
  }

  downloadPDF() {
    if (!this.selectedEmployee || this.workEntries.length === 0) {
      alert('Please select an employee and ensure there is work data to download.');
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Employee Work Report', 20, 20);

    // Add employee and period info
    doc.setFontSize(12);
    const selectedEmployeeName = this.employees.find(emp => emp.id.toString() === this.selectedEmployee.toString())?.employeeName || 'Unknown';
    const monthName = this.months[this.selectedMonth - 1];
    doc.text(`Employee: ${selectedEmployeeName}`, 20, 35);
    doc.text(`Period: ${monthName} ${this.selectedYear}`, 20, 45);

    // Prepare table data
    const tableData = this.workEntries.map(work => [
      work.id.toString(),
      work.name,
      new Date(work.workDate).toLocaleDateString(),
      work.workDetail,
      `₹${work.workAmount}`
    ]);

    // Add total row
    tableData.push(['', '', '', 'Total:', `₹${this.totalWork}`]);

    // Generate table
    autoTable(doc, {
      head: [['ID', 'Name', 'Date', 'Detail', 'Amount']],
      body: tableData,
      startY: 55,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 40 }, // Name
        2: { cellWidth: 30 }, // Date
        3: { cellWidth: 60 }, // Detail
        4: { cellWidth: 25 }  // Amount
      }
    });

    // Generate filename
    const filename = `employee_work_${selectedEmployeeName.replace(/\s+/g, '_')}_${monthName}_${this.selectedYear}.pdf`;

    // Save the PDF
    doc.save(filename);
  }
}
